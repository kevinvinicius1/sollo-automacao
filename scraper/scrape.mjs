#!/usr/bin/env node
/**
 * Scraper do catálogo Fluir Automação (www.fluirautomacao.com.br).
 *
 * Estratégia: API REST do WordPress (wp/v2/product + wp/v2/product_cat),
 * que está exposta e devolve o conteúdo Elementor renderizado de cada
 * produto. O HTML de content.rendered é parseado com cheerio para extrair
 * imagens (galeria + destaque), descrição, especificações, PDFs e vídeos.
 *
 * Saídas:
 *   data/products/<slug>.json      (validado contra o schema zod)
 *   data/categories.json           (árvore real categoria → subcategoria)
 *   data/catalogs.json             (catálogos gerais da página /catalogos/)
 *   public/images/products/*.webp  (máx 1200px de largura)
 *   public/catalogos/produtos/*.pdf (PDFs por produto)
 *   public/catalogos/*.pdf          (catálogos gerais)
 *
 * Rodar: node scraper/scrape.mjs   (cache de rede em scraper/.cache/)
 */

import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath, pathToFileURL } from "url";
import * as cheerio from "cheerio";
import sharp from "sharp";
import { z } from "zod";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = path.join(ROOT, "scraper", ".cache");
const IMG_DIR = path.join(ROOT, "public", "images", "products");
const CATALOG_DIR = path.join(ROOT, "public", "catalogos");
const PDF_DIR = path.join(CATALOG_DIR, "produtos");
const DATA_CATALOGS = path.join(ROOT, "data", "catalogs.json");
const DATA_PRODUCTS = path.join(ROOT, "data", "products");
const DATA_CATEGORIES = path.join(ROOT, "data", "categories.json");

const BASE = "https://www.fluirautomacao.com.br";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const RATE_MS = 800; // ~1 req/s

/* Nomes de exibição das categorias raiz, como aparecem na navegação do site */
const NAV_CATEGORIES = [
  { slug: "cilindros-pneumaticos", name: "Cilindros Pneumáticos" },
  { slug: "valvulas", name: "Válvulas" },
  { slug: "preparacao-do-ar", name: "Preparação de Ar" },
  { slug: "conexoes", name: "Conexões, Silenciadores e Tubos" },
];
/* Termos meta que não representam categoria de navegação */
const IGNORED_TERMS = new Set(["toda-linha-de-produtos", "sem-categoria"]);
/* Produtos-modelo (demo com lorem ipsum) publicados por engano no site */
const SKIP_SLUGS = new Set(["produto-modelo-tabela", "produto-modelo-tabela-2"]);
/* Links quebrados no site da Fluir → URL equivalente que funciona */
const PDF_FIXUPS = new Map([
  [
    `${BASE}/wp-content/uploads/2025/05/Fluir-Lancamentos-2025.pdf`,
    `${BASE}/wp-content/uploads/2025/10/Catalogo-Lancamentos-25-.pdf`,
  ],
]);

/* ---------------------------------------------------------------- schema */

let productSchema;
try {
  ({ productSchema } = await import(
    pathToFileURL(path.join(ROOT, "src", "lib", "catalog.ts")).href
  ));
  console.log("[schema] usando productSchema de src/lib/catalog.ts");
} catch {
  console.log("[schema] import de catalog.ts falhou; usando réplica local");
  productSchema = z.object({
    code: z.string(),
    name: z.string(),
    slug: z.string(),
    category: z.string(),
    subcategory: z.string(),
    images: z.array(z.string()),
    shortDescription: z.string(),
    specsHtml: z.string(),
    downloads: z.array(z.object({ label: z.string(), file: z.string() })),
    videos: z.array(z.string()).default([]),
  });
}

/* ----------------------------------------------------------------- utils */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha1 = (s) => crypto.createHash("sha1").update(s).digest("hex");

function slugify(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function decodeEntities(s) {
  return cheerio.load(`<x>${s}</x>`)("x").text();
}

let lastRequest = 0;
async function throttle() {
  const wait = lastRequest + RATE_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequest = Date.now();
}

async function fetchRaw(url, { retries = 3 } = {}) {
  for (let attempt = 1; ; attempt++) {
    await throttle();
    try {
      const res = await fetch(url, {
        headers: { "user-agent": UA, accept: "*/*" },
        redirect: "follow",
        signal: AbortSignal.timeout(90_000),
      });
      if (!res.ok) {
        const err = new Error(`HTTP ${res.status} em ${url}`);
        err.status = res.status;
        throw err;
      }
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      if (attempt >= retries || e.status === 404) throw e;
      console.warn(`  [retry ${attempt}] ${url}: ${e.message}`);
      await sleep(1500 * attempt);
    }
  }
}

/** GET com cache em disco (texto). */
async function cachedGet(url) {
  const file = path.join(CACHE_DIR, sha1(url) + ".cache");
  try {
    return await fs.readFile(file, "utf8");
  } catch {}
  const buf = await fetchRaw(url);
  await fs.writeFile(file, buf);
  return buf.toString("utf8");
}

const cachedGetJson = async (url) => JSON.parse(await cachedGet(url));

/** Baixa binário para dest; pula se já existir (cache natural). */
async function downloadFile(url, dest) {
  try {
    const st = await fs.stat(dest);
    if (st.size > 0) return false; // já baixado
  } catch {}
  const buf = await fetchRaw(url);
  await fs.writeFile(dest, buf);
  return true;
}

/* ------------------------------------------------------------- extração */

/** Remove sufixo -300x300 etc. para obter o arquivo original. */
function fullSizeUrl(u) {
  return u.replace(/-\d{2,4}x\d{2,4}(\.(?:png|jpe?g|webp|gif))$/i, "$1");
}

function isProductImage(u) {
  if (!u) return false;
  if (!/\/wp-content\/uploads\//.test(u)) return false;
  if (!/\.(png|jpe?g|webp)(\?|$)/i.test(u)) return false;
  const base = path.basename(u).normalize("NFD").toLowerCase();
  if (/logo|icone|icon-|whatsapp|favicon|placeholder/.test(base)) return false;
  return true;
}

const SANITIZE_KEEP = new Set([
  "p", "ul", "ol", "li", "table", "thead", "tbody", "tr", "td", "th",
  "strong", "em", "br", "h3", "h4",
]);
const SANITIZE_DROP = new Set([
  "script", "style", "iframe", "noscript", "svg", "img", "form", "button",
  "video", "audio", "link", "meta",
]);

/** Sanitiza HTML: só tags whitelisted, sem atributos. */
function sanitizeHtml(html) {
  const $ = cheerio.load(`<root>${html}</root>`, null, false);
  const walk = (el) => {
    for (const child of $(el).children().toArray()) walk(child);
    const tag = el.tagName?.toLowerCase();
    if (!tag) return;
    if (SANITIZE_DROP.has(tag)) {
      $(el).remove();
    } else if (SANITIZE_KEEP.has(tag)) {
      el.attribs = {};
    } else {
      // unwrap: mantém filhos, descarta a tag (div, span, a, b→?, section…)
      if (tag === "b") {
        el.tagName = "strong";
        el.attribs = {};
      } else if (tag === "i") {
        el.tagName = "em";
        el.attribs = {};
      } else {
        $(el).replaceWith($(el).contents());
      }
    }
  };
  for (const child of $("root").children().toArray()) walk(child);
  return $("root")
    .html()
    .replace(/<(p|li|td|th)>\s*<\/\1>/g, "")
    .replace(/\s+\n/g, "\n")
    .trim();
}

function extractCode(title) {
  // "FCMK – Cilindro Perfil Mickey Mouse ISO 6431" → code FCMK
  const m = title.match(/^([^–—]{1,24}?)\s*[–—]\s*(.+)$/);
  if (m) {
    const left = m[1].trim();
    if (/^[A-Z0-9][A-Z0-9 .\-\/+]*$/.test(left) && !/\s{2,}/.test(left)) {
      return { code: left, name: m[2].trim() };
    }
  }
  return { code: "", name: title.trim() };
}

function firstSentences(text, max = 2, maxLen = 280) {
  const clean = text.replace(/\s+/g, " ").trim();
  const parts = clean.match(/[^.!?]+[.!?]+(?:\s|$)/g);
  let out = parts ? parts.slice(0, max).join(" ").trim() : clean;
  if (out.length > maxLen) out = out.slice(0, maxLen - 1).trimEnd() + "…";
  return out;
}

function pdfLabel(text) {
  const t = text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (t.includes("desenho")) return "Desenho técnico";
  if (t.includes("catalogo")) return "Catálogo técnico";
  return "Download";
}

/**
 * Parseia content.rendered de um produto (Elementor).
 * Devolve { images[], shortDescription, specsHtml, downloads[], videos[] }
 * com URLs remotas (os downloads acontecem depois).
 */
function parseProductContent(rendered, featuredUrl) {
  const $ = cheerio.load(rendered);
  // header/footer do site vêm embutidos como widgets de template
  $('[data-widget_type="template.default"]').remove();

  /* imagens: destaque + widgets de imagem + galeria */
  const imgs = [];
  const pushImg = (u) => {
    if (!u) return;
    u = fullSizeUrl(u.split("?")[0]);
    if (isProductImage(u) && !imgs.includes(u)) imgs.push(u);
  };
  pushImg(featuredUrl);
  $('[data-widget_type="image.default"] img').each((_, el) =>
    pushImg($(el).attr("src"))
  );
  $(".e-gallery-item").each((_, el) => pushImg($(el).attr("href")));
  $('[data-widget_type="gallery.default"] [data-thumbnail]').each((_, el) =>
    pushImg($(el).attr("data-thumbnail"))
  );

  /* widgets de conteúdo: descrição (text-editor) antes do heading
     "Especificações"; specs (text-editor + jet-table) depois dele */
  const isTextEditor = (el) =>
    $(el).attr("data-widget_type") === "text-editor.default";
  const editors = $(
    '[data-widget_type="text-editor.default"],[data-widget_type="jet-table.default"]'
  ).toArray();
  const specsHeading = $("h1,h2,h3,h4")
    .toArray()
    .find((el) => /especifica/i.test($(el).text()));
  let descEditors = editors.filter(isTextEditor);
  let specEditors = editors.filter((el) => !isTextEditor(el));
  if (specsHeading) {
    const cut = $(specsHeading).closest(".elementor-element").length
      ? $(specsHeading).closest(".elementor-element")[0]
      : specsHeading;
    const all = $("*").toArray();
    const cutIdx = all.indexOf(cut);
    const idxOf = (el) => all.indexOf(el);
    descEditors = editors.filter((el) => isTextEditor(el) && idxOf(el) < cutIdx);
    specEditors = editors.filter((el) => idxOf(el) > cutIdx);
  } else if (editors.filter(isTextEditor).length > 1) {
    const textEditors = editors.filter(isTextEditor);
    descEditors = [textEditors[0]];
    specEditors = editors.filter((el) => el !== textEditors[0]);
  }
  const descText = descEditors.length ? $(descEditors[0]).text() : "";
  // descrição placeholder (lorem ipsum) não vai para o site
  const shortDescription = /lorem ipsum/i.test(descText)
    ? ""
    : firstSentences(descText);
  const specsHtml = specEditors
    .map((el) =>
      sanitizeHtml($(el).find(".elementor-widget-container").html() ?? $(el).html() ?? "")
    )
    .filter(Boolean)
    .join("\n");

  /* downloads (PDFs) */
  const downloads = [];
  $("a[href]").each((_, el) => {
    const href = ($(el).attr("href") || "").trim();
    if (!/\.pdf(\?|$)/i.test(href)) return;
    const abs = href.replace(/^http:/, "https:");
    if (downloads.some((d) => d.url === abs)) return;
    downloads.push({ url: abs, label: pdfLabel($(el).text()) });
  });

  /* vídeos YouTube */
  const videos = [];
  const pushVideo = (id) => {
    if (!id) return;
    const url = `https://www.youtube.com/watch?v=${id}`;
    if (!videos.includes(url)) videos.push(url);
  };
  $("[data-video_id]").each((_, el) => {
    if (($(el).attr("data-provider") || "youtube") === "youtube")
      pushVideo($(el).attr("data-video_id"));
  });
  for (const m of rendered.matchAll(
    /youtube\.com\\?\/embed\\?\/([\w-]{6,15})/g
  ))
    pushVideo(m[1]);

  return { images: imgs, shortDescription, specsHtml, downloads, videos };
}

/* -------------------------------------------------- categoria do produto */

/**
 * Escolhe (category, subcategory) a partir dos termos product_cat.
 * extraSubs: Map catSlug → Map subSlug → name (subcategorias sintetizadas).
 */
function resolvePlacement(termIds, termsById, extraSubs) {
  const terms = termIds
    .map((id) => termsById.get(id))
    .filter((t) => t && !IGNORED_TERMS.has(t.slug));
  const navSlugs = new Set(NAV_CATEGORIES.map((c) => c.slug));

  // 1) termo filho (subcategoria real)
  const subTerms = terms.filter((t) => t.parent !== 0);
  const preferred =
    subTerms.find((t) => navSlugs.has(termsById.get(t.parent)?.slug)) ||
    subTerms[0];
  if (preferred) {
    const parent = termsById.get(preferred.parent);
    return { category: parent.slug, subcategory: preferred.slug };
  }

  // 2) só termos raiz
  const roots = terms.filter((t) => t.parent === 0);
  if (roots.length === 0) return null;
  const navRoot = roots.find((t) => navSlugs.has(t.slug));
  const otherRoot = roots.find((t) => !navSlugs.has(t.slug));
  if (navRoot && otherRoot) {
    // ex.: produto "Tubos Espirais" com termos [conexoes, tubos-espirais…]
    registerExtraSub(extraSubs, navRoot.slug, otherRoot.slug, otherRoot.name);
    return { category: navRoot.slug, subcategory: otherRoot.slug };
  }
  const root = navRoot || otherRoot;
  // categoria sem subcategoria: sintetiza uma com o mesmo slug
  registerExtraSub(extraSubs, root.slug, root.slug, root.name);
  return { category: root.slug, subcategory: root.slug };
}

function registerExtraSub(extraSubs, catSlug, subSlug, subName) {
  if (!extraSubs.has(catSlug)) extraSubs.set(catSlug, new Map());
  extraSubs.get(catSlug).set(subSlug, subName);
}

/* ------------------------------------------------------------------ main */

async function main() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.mkdir(IMG_DIR, { recursive: true });
  await fs.mkdir(PDF_DIR, { recursive: true });
  await fs.mkdir(DATA_PRODUCTS, { recursive: true });

  /* 1. taxonomia */
  console.log("[1/6] Baixando taxonomia product_cat…");
  const catTerms = await cachedGetJson(
    `${BASE}/wp-json/wp/v2/product_cat?per_page=100`
  );
  const termsById = new Map(catTerms.map((t) => [t.id, t]));
  console.log(`  ${catTerms.length} termos`);

  /* 2. produtos via API */
  console.log("[2/6] Baixando lista de produtos via API REST…");
  const rawProducts = [];
  for (let page = 1; ; page++) {
    const url = `${BASE}/wp-json/wp/v2/product?per_page=100&page=${page}&_embed=wp:featuredmedia`;
    let batch;
    try {
      batch = await cachedGetJson(url);
    } catch (e) {
      if (e.status === 400) break; // fim da paginação
      throw e;
    }
    if (!Array.isArray(batch) || batch.length === 0) break;
    rawProducts.push(...batch);
    console.log(`  página ${page}: ${batch.length} produtos`);
    if (batch.length < 100) break;
  }
  console.log(`  total: ${rawProducts.length} produtos`);

  /* 3. catálogos gerais da página /catalogos/ (antes dos produtos, para
     que PDFs de produto idênticos reutilizem o arquivo geral) */
  console.log("[3/6] Baixando catálogos gerais de /catalogos/…");
  const catalogs = [];
  const pdfByUrl = new Map(); // url remota → caminho público
  try {
    const html = await cachedGet(`${BASE}/catalogos/`);
    const $ = cheerio.load(html);
    // h2 "Catálogo …" e links .pdf aparecem pareados na ordem do documento
    const labels = $("h2")
      .toArray()
      .map((el) => $(el).text().trim().replace(/\s+/g, " "))
      .filter((t) => /^cat[aá]logo/i.test(t) && !/fluir$/i.test(t));
    const urls = [];
    $("a[href]").each((_, el) => {
      const href = ($(el).attr("href") || "").trim().replace(/^http:/, "https:");
      if (/\.pdf(\?|$)/i.test(href) && !urls.includes(href)) urls.push(href);
    });
    if (labels.length !== urls.length)
      console.warn(
        `  aviso: ${labels.length} títulos × ${urls.length} PDFs — pareando pela ordem`
      );
    for (const [idx, url] of urls.entries()) {
      const label =
        labels[idx] || decodeURIComponent(path.basename(new URL(url).pathname));
      const base = slugify(
        decodeURIComponent(path.basename(new URL(url).pathname)).replace(
          /\.pdf$/i,
          ""
        )
      );
      const dest = path.join(CATALOG_DIR, `${base}.pdf`);
      try {
        await downloadFile(url, dest);
        const sizeMb =
          Math.round(((await fs.stat(dest)).size / 1048576) * 10) / 10;
        catalogs.push({ label, file: `/catalogos/${base}.pdf`, sizeMb });
        pdfByUrl.set(url, `/catalogos/${base}.pdf`);
        console.log(`  ok: ${label} (${sizeMb} MB)`);
      } catch (e) {
        console.warn(`  catálogo falhou (${url}): ${e.message}`);
      }
    }
    await fs.writeFile(DATA_CATALOGS, JSON.stringify(catalogs, null, 2) + "\n");
  } catch (e) {
    console.warn(`  página /catalogos/ falhou: ${e.message}`);
  }

  /* 4. parse + downloads por produto */
  console.log("[4/6] Extraindo dados e baixando mídia…");
  const products = [];
  const failures = [];
  const extraSubs = new Map();
  let imagesDownloaded = 0;
  let imagesTotal = 0;

  for (const [i, rp] of rawProducts.entries()) {
    const slug = rp.slug;
    const progress = `[${i + 1}/${rawProducts.length}]`;
    if (SKIP_SLUGS.has(slug)) {
      console.log(`  ${progress} pulado (produto-modelo): ${slug}`);
      continue;
    }
    try {
      const title = decodeEntities(rp.title.rendered);
      const { code, name } = extractCode(title);
      const placement = resolvePlacement(
        rp.product_cat || [],
        termsById,
        extraSubs
      );
      if (!placement) throw new Error("produto sem categoria utilizável");

      const featured =
        rp._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;
      const parsed = parseProductContent(rp.content?.rendered || "", featured);

      /* imagens → webp */
      const localImages = [];
      let n = 0;
      for (const remote of parsed.images) {
        n++;
        const publicPath = `/images/products/${slug}-${n}.webp`;
        const dest = path.join(IMG_DIR, `${slug}-${n}.webp`);
        try {
          const st = await fs.stat(dest).catch(() => null);
          if (!st || st.size === 0) {
            let buf;
            try {
              buf = await fetchRaw(remote);
            } catch (e) {
              // original pode não existir; tenta a URL sem upscaling? já é a original.
              throw e;
            }
            await sharp(buf)
              .resize({ width: 1200, withoutEnlargement: true })
              .webp({ quality: 82 })
              .toFile(dest);
            imagesDownloaded++;
          }
          localImages.push(publicPath);
        } catch (e) {
          console.warn(`  ${progress} ${slug}: imagem falhou (${remote}): ${e.message}`);
          n--; // reusa o índice para a próxima
        }
      }
      imagesTotal += localImages.length;

      /* PDFs do produto (links quebrados corrigidos; PDFs já baixados como
         catálogo geral são reutilizados) */
      const downloads = [];
      for (const d of parsed.downloads) {
        const url = PDF_FIXUPS.get(d.url) ?? d.url;
        let publicPath = pdfByUrl.get(url);
        if (!publicPath) {
          const base = slugify(
            decodeURIComponent(path.basename(new URL(url).pathname)).replace(
              /\.pdf$/i,
              ""
            )
          );
          publicPath = `/catalogos/produtos/${base}.pdf`;
          try {
            await downloadFile(url, path.join(PDF_DIR, `${base}.pdf`));
            pdfByUrl.set(url, publicPath);
          } catch (e) {
            console.warn(`  ${progress} ${slug}: PDF falhou (${url}): ${e.message}`);
            continue;
          }
        }
        if (!downloads.some((x) => x.file === publicPath))
          downloads.push({ label: d.label, file: publicPath });
      }

      const product = productSchema.parse({
        code,
        name,
        slug,
        category: placement.category,
        subcategory: placement.subcategory,
        images: localImages,
        shortDescription: parsed.shortDescription,
        specsHtml: parsed.specsHtml,
        downloads,
        videos: parsed.videos,
      });
      await fs.writeFile(
        path.join(DATA_PRODUCTS, `${slug}.json`),
        JSON.stringify(product, null, 2) + "\n"
      );
      products.push(product);
      if ((i + 1) % 10 === 0 || i === rawProducts.length - 1)
        console.log(`  ${progress} ok (${imagesTotal} imagens até aqui)`);
    } catch (e) {
      failures.push({ slug, url: rp.link, error: e.message });
      console.error(`  ${progress} FALHOU ${slug}: ${e.message}`);
    }
  }

  /* 5. categories.json */
  console.log("[5/6] Gerando data/categories.json…");
  const usedPairs = new Map(); // catSlug → Set(subSlug)
  for (const p of products) {
    if (!usedPairs.has(p.category)) usedPairs.set(p.category, new Set());
    usedPairs.get(p.category).add(p.subcategory);
  }
  const firstImage = (catSlug, subSlug) =>
    products.find(
      (p) =>
        p.category === catSlug &&
        (!subSlug || p.subcategory === subSlug) &&
        p.images.length > 0
    )?.images[0];

  const categories = [];
  let order = 1;
  const catOrder = [
    ...NAV_CATEGORIES.map((c) => c.slug),
    ...[...usedPairs.keys()].filter(
      (s) => !NAV_CATEGORIES.some((c) => c.slug === s)
    ),
  ];
  for (const catSlug of catOrder) {
    if (!usedPairs.has(catSlug)) continue;
    const nav = NAV_CATEGORIES.find((c) => c.slug === catSlug);
    const rootTerm = catTerms.find((t) => t.slug === catSlug && t.parent === 0);
    const catName = nav?.name || rootTerm?.name || catSlug;
    const subSlugs = usedPairs.get(catSlug);
    const subcategories = [];
    // subcategorias reais da taxonomia (ordem alfabética), depois extras
    const realSubs = catTerms
      .filter((t) => t.parent === rootTerm?.id && subSlugs.has(t.slug))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    for (const t of realSubs) {
      const image = firstImage(catSlug, t.slug);
      subcategories.push({
        name: decodeEntities(t.name),
        slug: t.slug,
        ...(image ? { image } : {}),
      });
    }
    for (const [subSlug, subName] of extraSubs.get(catSlug) || []) {
      if (!subSlugs.has(subSlug)) continue;
      if (subcategories.some((s) => s.slug === subSlug)) continue;
      const image = firstImage(catSlug, subSlug);
      subcategories.push({
        name: decodeEntities(subName),
        slug: subSlug,
        ...(image ? { image } : {}),
      });
    }
    const image = firstImage(catSlug, null);
    categories.push({
      name: catName,
      slug: catSlug,
      ...(image ? { image } : {}),
      order: order++,
      subcategories,
    });
  }
  await fs.writeFile(
    DATA_CATEGORIES,
    JSON.stringify(categories, null, 2) + "\n"
  );

  /* 5. resumo */
  console.log("[6/6] Resumo:");
  const pdfCount = (await fs.readdir(PDF_DIR)).filter((f) =>
    f.endsWith(".pdf")
  ).length;
  const imgCount = (await fs.readdir(IMG_DIR)).filter((f) =>
    f.endsWith(".webp")
  ).length;
  for (const cat of categories) {
    const catProducts = products.filter((p) => p.category === cat.slug);
    console.log(`  ${cat.name} (${cat.slug}): ${catProducts.length} produtos`);
    for (const sub of cat.subcategories) {
      const c = catProducts.filter((p) => p.subcategory === sub.slug).length;
      console.log(`    - ${sub.name} (${sub.slug}): ${c}`);
    }
  }
  console.log(`  Produtos OK: ${products.length}/${rawProducts.length}`);
  console.log(`  Imagens locais: ${imgCount} (${imagesDownloaded} baixadas nesta execução)`);
  console.log(`  PDFs de produto: ${pdfCount} | catálogos gerais: ${catalogs.length}`);
  console.log(`  Produtos com downloads: ${products.filter((p) => p.downloads.length).length}`);
  console.log(`  Produtos sem imagem: ${products.filter((p) => !p.images.length).length}`);
  console.log(`  Produtos sem specs: ${products.filter((p) => !p.specsHtml).length}`);
  if (failures.length) {
    console.log("  FALHAS:");
    for (const f of failures) console.log(`    ${f.slug} (${f.url}): ${f.error}`);
  } else {
    console.log("  Nenhuma falha.");
  }
}

main().catch((e) => {
  console.error("Erro fatal:", e);
  process.exit(1);
});
