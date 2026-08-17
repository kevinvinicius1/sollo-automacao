#!/usr/bin/env node
/**
 * Gera os banners de topo das linhas Gefran.
 *
 * As páginas de linha da Gefran não têm imagem de topo — só as fotos dos
 * produtos —, então o banner é montado a partir das próprias fotos, na mesma
 * proporção (27:10) dos banners das linhas pneumáticas.
 *
 * As fotos são estúdio sobre branco: `trim` corta a moldura branca e o blend
 * `multiply` faz o branco restante sumir no fundo claro, preservando a sombra
 * natural de cada peça. As alturas abaixo são um alvo: se a fila não couber
 * na largura, todas encolhem na mesma proporção, mantendo a hierarquia.
 *
 * Rodar: node scripts/make-gefran-hero.mjs
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PRODUCTS = path.join(ROOT, "public", "images", "products");
const CATEGORIAS = path.join(ROOT, "public", "images", "categorias");

const WIDTH = 1080;
const HEIGHT = 400;
const BACKGROUND = { r: 238, g: 242, b: 246 };
const BASELINE = 340; // as peças são alinhadas pela base, não centralizadas
const MARGIN = 30;
const VAO_MIN = 18;

/**
 * Um banner por linha, com a seleção de peças. Os instrumentos de painel são
 * quase quadrados e só quatro enchem a altura; os módulos de potência são
 * mais estreitos e comportam cinco.
 */
const BANNERS = [
  {
    slug: "controladores-e-indicadores",
    itens: [
      { file: "3850t-controlador-e-registrador-de-ate-16-loops-pid-1.webp", height: 225 },
      { file: "1850-controlador-pid-de-circuito-duplo-1-4-din-1.webp", height: 260 },
      { file: "1650-controlador-pid-de-circuito-duplo-1-8-din-1.webp", height: 270 },
      { file: "40tb-indicador-unidade-de-alarme-de-temperatura-e-pressao-1.webp", height: 235 },
    ],
  },
  {
    slug: "reles-e-modulos-de-potencia",
    itens: [
      { file: "gpc-controlador-de-potencia-avancado-ate-600-a-1.webp", height: 250 },
      { file: "gtf-controlador-de-potencia-monofasico-ate-250a-1.webp", height: 285 },
      { file: "gfx4-controlador-de-potencia-4-circuitos-pid-ate-80-kw-1.webp", height: 230 },
      { file: "grm-h-controlador-de-potencia-compacto-com-dissipador-ate-120-a-1.webp", height: 265 },
      { file: "grs-h-rele-de-estado-solido-monofasico-com-dissipador-ate-120-a-1.webp", height: 240 },
    ],
  },
  {
    // Os transdutores de posição são alongados e consomem muita largura:
    // com quatro peças a fila encolheria e sobraria altura vazia, então
    // aqui são três — uma linear, uma de força e uma rotativa.
    slug: "transdutores-de-posicao",
    itens: [
      { file: "wpa-a-magnetostritivo-avancado-perfil-de-aluminio-saida-analogica-1.webp", height: 190 },
      { file: "sh-celula-de-carga-de-perfil-padrao-1.webp", height: 230 },
      { file: "gra-sensor-rotativo-de-volta-unica-por-efeito-hall-com-eixo-1.webp", height: 300 },
    ],
  },
];

async function recortar({ file, height }) {
  const buf = await sharp(path.join(PRODUCTS, file))
    .flatten({ background: "#ffffff" })
    .trim({ background: "#ffffff", threshold: 12 })
    .resize({ height, withoutEnlargement: false })
    .toBuffer();
  const { width } = await sharp(buf).metadata();
  return { buf, width, height };
}

async function montar({ slug, itens }) {
  let pecas = [];
  for (const item of itens) pecas.push(await recortar(item));

  const util = WIDTH - MARGIN * 2 - VAO_MIN * (pecas.length - 1);
  const larguraCrua = pecas.reduce((s, p) => s + p.width, 0);
  if (larguraCrua > util) {
    const escala = util / larguraCrua;
    pecas = [];
    for (const item of itens) {
      pecas.push(await recortar({ ...item, height: Math.round(item.height * escala) }));
    }
  }

  const larguraTotal = pecas.reduce((s, p) => s + p.width, 0);
  const vao = (WIDTH - MARGIN * 2 - larguraTotal) / (pecas.length - 1);

  let x = MARGIN;
  const camadas = pecas.map((p) => {
    const layer = {
      input: p.buf,
      left: Math.round(x),
      top: Math.round(BASELINE - p.height),
      blend: "multiply",
    };
    x += p.width + vao;
    return layer;
  });

  const dest = path.join(CATEGORIAS, `topo-${slug}.webp`);
  await fs.mkdir(CATEGORIAS, { recursive: true });
  await sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 3, background: BACKGROUND },
  })
    .composite(camadas)
    .webp({ quality: 88 })
    .toFile(dest);

  console.log(
    `${path.relative(ROOT, dest)} — ${WIDTH}x${HEIGHT}, ${pecas.length} peças` +
      ` (altura máx. ${Math.max(...pecas.map((p) => p.height))}px)`
  );
}

async function main() {
  for (const banner of BANNERS) await montar(banner);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
