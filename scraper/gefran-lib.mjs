/**
 * Utilidades do extrator Gefran (www.gefran.com.br).
 *
 * O site é um Gatsby estático servido pela Netlify sobre um WordPress
 * headless privado. O WP não é alcançável (403/Cloudflare), mas o Gatsby
 * publica o JSON de cada rota em /page-data/<caminho>/page-data.json, já
 * estruturado — não há HTML para parsear.
 *
 * As imagens só saem pelo proxy de imagens da Netlify; a URL do arquivo
 * original vem embutida no parâmetro `url=` desse proxy.
 */

import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";
import sharp from "sharp";

export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
export const CACHE_DIR = path.join(ROOT, "scraper", ".cache");
export const IMG_DIR = path.join(ROOT, "public", "images", "products");
export const DATA_PRODUCTS = path.join(ROOT, "data", "products");
export const DATA_CATEGORIES = path.join(ROOT, "data", "categories.json");

export const BASE = "https://www.gefran.com.br";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const RATE_MS = 800; // ~1 req/s

/* ----------------------------------------------------------------- utils */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha1 = (s) => crypto.createHash("sha1").update(s).digest("hex");

export function slugify(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Slug limitado a maxLen, cortado em fronteira de palavra. */
export function slugifyMax(s, maxLen = 70) {
  const full = slugify(s);
  if (full.length <= maxLen) return full;
  const cut = full.slice(0, maxLen);
  const lastDash = cut.lastIndexOf("-");
  return (lastDash > 20 ? cut.slice(0, lastDash) : cut).replace(/-+$/, "");
}

let lastRequest = 0;
async function throttle() {
  const wait = lastRequest + RATE_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequest = Date.now();
}

export async function fetchRaw(url, { retries = 3 } = {}) {
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
export async function cachedGet(url) {
  const file = path.join(CACHE_DIR, sha1(url) + ".cache");
  try {
    return await fs.readFile(file, "utf8");
  } catch {}
  const buf = await fetchRaw(url);
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(file, buf);
  return buf.toString("utf8");
}

export const cachedGetJson = async (url) => JSON.parse(await cachedGet(url));

/** JSON de uma rota do Gatsby. `route` começa e termina com "/". */
export const pageData = (route) =>
  cachedGetJson(`${BASE}/page-data${route}page-data.json`);

/* ---------------------------------------------------------------- imagens */

/**
 * Extrai a URL do arquivo original a partir do wrapper do proxy da Netlify
 * (/.netlify/images?...&url=<encoded>) e a largura nativa declarada pelo
 * Gatsby, para pedir a imagem sem upscale nem corte.
 */
export function imageSource(node) {
  const gi = node?.gatsbyImageFull ?? node?.gatsbyImage;
  const src = gi?.images?.fallback?.src;
  if (!src) return null;
  const encoded = new URL(src, BASE).searchParams.get("url");
  if (!encoded) return null;
  return { url: encoded, width: gi.width ?? 800, height: gi.height ?? 800 };
}

const MAX_WIDTH = 1200;

/** Baixa a imagem pelo proxy da Netlify e grava como webp em `dest`. */
export async function saveImage({ url, width }, dest) {
  try {
    const st = await fs.stat(dest);
    if (st.size > 0) return false; // já baixado
  } catch {}
  const w = Math.min(width || MAX_WIDTH, MAX_WIDTH);
  const proxied =
    `${BASE}/.netlify/images?w=${w}&fm=webp&q=95` +
    `&url=${encodeURIComponent(url)}`;
  const buf = await fetchRaw(proxied);
  const out = await sharp(buf)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, out);
  return true;
}

/* ------------------------------------------------------------------ html */

const SANITIZE_KEEP = new Set([
  "p", "ul", "ol", "li", "table", "thead", "tbody", "tr", "td", "th",
  "strong", "em", "br", "h3", "h4",
]);
const SANITIZE_DROP = new Set([
  "script", "style", "iframe", "noscript", "svg", "img", "form", "button",
  "video", "audio", "link", "meta",
]);

/** Sanitiza HTML: só tags whitelisted, sem atributos. */
export function sanitizeHtml(html) {
  const $ = cheerio.load(`<root>${html}</root>`, null, false);
  const walk = (el) => {
    for (const child of $(el).children().toArray()) walk(child);
    const tag = el.tagName?.toLowerCase();
    if (!tag) return;
    if (SANITIZE_DROP.has(tag)) {
      $(el).remove();
    } else if (SANITIZE_KEEP.has(tag)) {
      el.attribs = {};
    } else if (tag === "b") {
      el.tagName = "strong";
      el.attribs = {};
    } else if (tag === "i") {
      el.tagName = "em";
      el.attribs = {};
    } else {
      $(el).replaceWith($(el).contents());
    }
  };
  for (const child of $("root").children().toArray()) walk(child);
  return $("root")
    .html()
    .replace(/<(p|li|td|th)>\s*<\/\1>/g, "")
    .replace(/\s+\n/g, "\n")
    .trim();
}

/**
 * O editor da Gefran usa <div class="ewa-rteLine"> como parágrafo. `div` não
 * está na whitelist e seria desembrulhado, colando as linhas umas nas outras
 * — por isso a conversão para <p> precisa vir antes do sanitize.
 */
export function richTextToHtml(html) {
  if (!html) return "";
  const $ = cheerio.load(`<root>${html}</root>`, null, false);
  for (const el of $("div").toArray()) el.tagName = "p";
  return sanitizeHtml($("root").html());
}

/** Texto puro de um HTML, com espaços normalizados. */
export function htmlToText(html) {
  if (!html) return "";
  const $ = cheerio.load(`<root>${html}</root>`, null, false);
  for (const el of $("div, p, li, br, h1, h2, h3, h4").toArray()) {
    $(el).after(" ");
  }
  return $("root").text().replace(/\s+/g, " ").trim();
}

/**
 * Primeiras frases de um texto, para resumo de card e meta description.
 * O corte é por split (e não por match de frase) porque abreviações como
 * "3.1/2 dígitos" não terminam frase e fariam um match global descartar
 * tudo que vem antes delas.
 */
export function firstSentences(text, max = 2, maxLen = 280) {
  const clean = text.replace(/\s+/g, " ").trim();
  let out = clean.split(/(?<=[.!?])\s+/).slice(0, max).join(" ").trim();
  if (out.length > maxLen) out = out.slice(0, maxLen - 1).trimEnd() + "…";
  return out;
}

/** Converte uma sequência de <p> em uma lista <ul>. */
export function paragraphsToList(html) {
  if (!html) return "";
  const $ = cheerio.load(`<root>${richTextToHtml(html)}</root>`, null, false);
  const items = $("root > p")
    .toArray()
    .map((el) => $(el).html().trim())
    .filter(Boolean);
  if (!items.length) return "";
  return `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
}
