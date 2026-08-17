#!/usr/bin/env node
/**
 * Extrator do catálogo Gefran (www.gefran.com.br).
 *
 * Diferente do scraper da Fluir, aqui não há HTML para parsear: o Gatsby da
 * Gefran publica o JSON de cada rota em /page-data/…/page-data.json.
 *
 *   listagem → result.data.allWpProductCategory.nodes[0].products.nodes[]
 *   produto  → result.pageContext.product  (title, acf.subTitle, acf.overview,
 *              acf.mainFeatures, acf.gallery[])
 *
 * Visibilidade: o front esconde os produtos com acf.badge === "eop" (fim de
 * produção) e joga os "phase_out" para o fim da lista; o resto sai por
 * menuOrder crescente. Essa regra reproduz exatamente a ordem dos cards
 * renderizados — o front é a fonte da verdade, não a taxonomia do WP.
 *
 * Saídas:
 *   data/products/<slug>.json
 *   public/images/products/<slug>-<n>.webp  (máx 1200px de largura)
 *
 * A taxonomia (data/categories.json) é curada à mão e NÃO é reescrita aqui;
 * o script só avisa se encontrar categoria/subcategoria fora do arquivo.
 *
 * Rodar: node scraper/scrape-gefran.mjs   (cache de rede em scraper/.cache/)
 */

import { promises as fs } from "fs";
import path from "path";
import {
  DATA_CATEGORIES,
  DATA_PRODUCTS,
  IMG_DIR,
  firstSentences,
  htmlToText,
  imageSource,
  pageData,
  paragraphsToList,
  richTextToHtml,
  saveImage,
  slugifyMax,
} from "./gefran-lib.mjs";
import { OVERRIDES } from "./gefran-overrides.mjs";

/**
 * Cada entrada mapeia uma sublinha da Gefran para uma subcategoria nossa.
 * Acrescentar entradas aqui é o único passo necessário para trazer as
 * próximas linhas Gefran.
 */
const LINHAS = [
  {
    category: "controladores-e-indicadores",
    subcategory: "controladores-e-programadores",
    gefran: "/produtos/controladores-e-indicadores/controladores-e-programadores/",
  },
  {
    category: "controladores-e-indicadores",
    subcategory: "indicadores-e-unidades-de-alarme",
    gefran: "/produtos/controladores-e-indicadores/indicadores-e-unidades-de-alarme/",
  },
  {
    category: "reles-e-modulos-de-potencia",
    subcategory: "modulos-de-potencia",
    gefran: "/produtos/controle-de-potencia/modulos-de-potencia/",
  },
  {
    category: "reles-e-modulos-de-potencia",
    subcategory: "reles-de-estado-solido",
    gefran:
      "/produtos/controle-de-potencia/reles-de-estado-solido-com-sem-dissipador-de-calor/",
  },
  // Sensores de posição é uma categoria-pai na Gefran, com seis sublinhas;
  // a sétima vem de Sensores de deformação e força, por decisão do cliente.
  {
    category: "transdutores-de-posicao",
    subcategory: "magnetostritivos",
    gefran: "/produtos/sensores-de-posicao/magnetostritivos/",
  },
  {
    category: "transdutores-de-posicao",
    subcategory: "linear-twiist",
    gefran: "/produtos/sensores-de-posicao/linear-twiist/",
  },
  {
    category: "transdutores-de-posicao",
    subcategory: "potenciometros",
    gefran: "/produtos/sensores-de-posicao/potenciometros/",
  },
  {
    category: "transdutores-de-posicao",
    subcategory: "angulares",
    gefran: "/produtos/sensores-de-posicao/angulares/",
  },
  {
    category: "transdutores-de-posicao",
    subcategory: "inclinacao",
    gefran: "/produtos/sensores-de-posicao/inclinacao/",
  },
  {
    category: "transdutores-de-posicao",
    subcategory: "posicao-por-cabo",
    gefran: "/produtos/sensores-de-posicao/posicao-por-cabo/",
  },
  {
    category: "transdutores-de-posicao",
    subcategory: "celulas-de-carga-e-forca",
    gefran: "/produtos/sensores-de-deformacao-e-forca/forca/",
  },
  {
    category: "sensores-de-pressao-melt",
    subcategory: "industrial",
    gefran: "/produtos/sensores-de-pressao/industrial/",
  },
  {
    category: "sensores-de-pressao-melt",
    subcategory: "melt-alta-temperatura",
    gefran: "/produtos/sensores-de-pressao/melt-temperatura-alta/",
  },
];

/** Software de configuração — fica fora do catálogo de produtos. */
const SKIP_TITLES = new Set(["GF_eXpress"]);

/* ------------------------------------------------------------------ passos */

const MIN_RESUMO = 40;

/**
 * A `overview` é dividida em blocos iniciados por um parágrafo inteiramente
 * em negrito ("Interface do operador", "Controle"…), que são títulos e não
 * descrevem o produto — daí pular os parágrafos totalmente em negrito e
 * resumir o primeiro texto corrido.
 */
function resumoDaOverview(overviewHtml) {
  const paragrafos = overviewHtml
    .split(/<\/p>/)
    .map((bloco) => bloco.replace(/^\s*<p>/, "").trim())
    .filter(Boolean)
    .filter((bloco) => !/^<strong>[^<]*<\/strong>$/.test(bloco));
  return firstSentences(htmlToText(paragrafos.join(" ")));
}

/** Itens de uma lista encadeados em uma linha só, para servir de resumo. */
function resumoDaLista(listaHtml, maxLen = 280) {
  const itens = (listaHtml.match(/<li>([\s\S]*?)<\/li>/g) ?? [])
    .map((li) => htmlToText(li))
    .filter(Boolean);
  const texto = itens.join(" · ");
  return texto.length > maxLen
    ? texto.slice(0, maxLen - 1).trimEnd() + "…"
    : texto;
}

/**
 * Resumo do card e da meta description, na ordem em que o texto costuma
 * existir: descrição longa, características principais e, por último, o
 * subtítulo. A Gefran publica boa parte dos potenciômetros sem descrição
 * nenhuma; sem o segundo passo, o card repetiria o próprio título.
 */
function resumo(overviewHtml, featuresHtml, subTitle) {
  const daOverview = resumoDaOverview(overviewHtml);
  if (daOverview.length >= MIN_RESUMO) return daOverview;
  const daLista = resumoDaLista(featuresHtml);
  if (daLista.length >= MIN_RESUMO) return daLista;
  return subTitle || daOverview || daLista;
}

/** Lista de produtos de uma sublinha, na ordem exata em que o front renderiza. */
async function listarProdutos(rota) {
  const data = await pageData(rota);
  const nodes =
    data?.result?.data?.allWpProductCategory?.nodes?.[0]?.products?.nodes ?? [];
  return nodes
    .filter((p) => p.acf?.badge !== "eop")
    .filter((p) => !SKIP_TITLES.has(p.title))
    .sort((a, b) => {
      const phase = (p) => (p.acf?.badge === "phase_out" ? 1 : 0);
      return phase(a) - phase(b) || (a.menuOrder ?? 0) - (b.menuOrder ?? 0);
    });
}

/** Monta o JSON do produto a partir do page-data da rota dele. */
async function montarProduto(uri, linha, order) {
  const data = await pageData(uri);
  const produto = data?.result?.pageContext?.product;
  if (!produto) throw new Error(`sem pageContext.product em ${uri}`);

  // A chave dos ajustes é o título, mas há títulos repetidos entre sublinhas
  // (o "CT" é um kit de limpeza no Melt e um transdutor de força em outra),
  // então "<subcategoria>/<título>" tem precedência sobre o título sozinho.
  const ajustes =
    OVERRIDES[`${linha.subcategory}/${produto.title}`] ??
    OVERRIDES[produto.title] ??
    {};
  const acf = { ...produto.acf, ...ajustes };
  // Grupos de acessórios não são modelos: recebem título em português e
  // `code: ""`, para o card não exibir um selo com uma frase inteira.
  const titulo = (ajustes.title ?? produto.title).trim();
  const code = (ajustes.code ?? titulo).trim();
  const subTitle = (acf.subTitle ?? "").trim();
  const name = subTitle ? `${titulo} – ${subTitle}` : titulo;
  const slug = slugifyMax(name);

  const features = paragraphsToList(acf.mainFeatures);
  const overview = richTextToHtml(acf.overview);
  const specsHtml = [
    features && `<h3>Características principais</h3>\n${features}`,
    overview && `<h3>Visão geral</h3>\n${overview}`,
  ]
    .filter(Boolean)
    .join("\n");

  const images = [];
  const galeria = acf.gallery ?? [];
  for (const [i, item] of galeria.entries()) {
    const src = imageSource(item);
    if (!src) continue;
    const file = `${slug}-${i + 1}.webp`;
    await saveImage(src, path.join(IMG_DIR, file));
    images.push(`/images/products/${file}`);
  }

  return {
    code,
    name,
    slug,
    category: linha.category,
    subcategory: linha.subcategory,
    images,
    shortDescription: resumo(overview, features, subTitle),
    specsHtml,
    // Sem downloads de nenhum tipo (decisão do cliente).
    downloads: [],
    // Os vídeos da Gefran são Vimeo; a página de produto só embute YouTube.
    videos: [],
    order,
  };
}

/** Confere se as sublinhas do mapa existem em data/categories.json. */
async function conferirTaxonomia() {
  const categorias = JSON.parse(await fs.readFile(DATA_CATEGORIES, "utf8"));
  const problemas = [];
  for (const linha of LINHAS) {
    const cat = categorias.find((c) => c.slug === linha.category);
    if (!cat) {
      problemas.push(`categoria "${linha.category}" não existe`);
      continue;
    }
    if (!cat.subcategories?.some((s) => s.slug === linha.subcategory)) {
      problemas.push(
        `subcategoria "${linha.subcategory}" não existe em "${linha.category}"`
      );
    }
  }
  return problemas;
}

/* -------------------------------------------------------------------- main */

async function main() {
  await fs.mkdir(IMG_DIR, { recursive: true });
  await fs.mkdir(DATA_PRODUCTS, { recursive: true });

  for (const aviso of await conferirTaxonomia()) {
    console.warn(`AVISO: ${aviso} — ajuste data/categories.json`);
  }

  let total = 0;
  const slugsVistos = new Map();

  for (const linha of LINHAS) {
    const lista = await listarProdutos(linha.gefran);
    console.log(`\n${linha.category}/${linha.subcategory}: ${lista.length} produtos`);

    for (const [i, item] of lista.entries()) {
      const produto = await montarProduto(item.uri, linha, i + 1);

      const anterior = slugsVistos.get(produto.slug);
      if (anterior) {
        throw new Error(
          `slug duplicado "${produto.slug}": ${anterior} e ${produto.name}`
        );
      }
      slugsVistos.set(produto.slug, produto.name);

      await fs.writeFile(
        path.join(DATA_PRODUCTS, `${produto.slug}.json`),
        JSON.stringify(produto, null, 2) + "\n"
      );
      console.log(
        `  ${String(i + 1).padStart(2)}. ${produto.name}` +
          `  (${produto.images.length} img)`
      );
      if (!produto.images.length) console.warn("      sem imagem!");
      if (!produto.specsHtml) console.warn("      sem descrição técnica!");
      total++;
    }
  }

  console.log(`\n${total} produtos gravados em data/products/.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
