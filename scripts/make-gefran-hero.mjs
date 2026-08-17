#!/usr/bin/env node
/**
 * Gera o banner de topo da linha Gefran de controladores e indicadores.
 *
 * As páginas de linha da Gefran não têm imagem de topo — só as fotos dos
 * produtos —, então o banner é montado a partir das próprias fotos, na mesma
 * proporção (27:10) dos banners das linhas pneumáticas.
 *
 * As fotos são estúdio sobre branco: `trim` corta a moldura branca e o blend
 * `multiply` faz o branco restante sumir no fundo claro, preservando a sombra
 * natural de cada peça.
 *
 * Rodar: node scripts/make-gefran-hero.mjs
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PRODUCTS = path.join(ROOT, "public", "images", "products");
const DEST = path.join(
  ROOT,
  "public",
  "images",
  "categorias",
  "topo-controladores-e-indicadores.webp"
);

const WIDTH = 1080;
const HEIGHT = 400;
const BACKGROUND = { r: 238, g: 242, b: 246 };
const BASELINE = 340; // as peças são alinhadas pela base, não centralizadas
const MARGIN = 30;

/**
 * Os instrumentos são quase quadrados, então uma fila longa numa faixa 27:10
 * deixaria as peças pequenas demais: quatro peças é o que enche a altura.
 * A seleção cobre as duas sublinhas — três controladores e um indicador.
 */
const ITENS = [
  { file: "3850t-controlador-programador-e-registrador-de-ate-16-loops-pid-1.webp", height: 225 },
  { file: "1850-controlador-pid-de-circuito-duplo-1-4-din-1.webp", height: 260 },
  { file: "1650-controlador-pid-de-circuito-duplo-1-8-din-1.webp", height: 270 },
  { file: "40tb-indicador-unidade-de-alarme-para-entradas-de-temperatura-e-1.webp", height: 235 },
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

const VAO_MIN = 18;

async function main() {
  // Mede as peças na altura pedida e, se a fila não couber, reduz todas na
  // mesma proporção — preservando a hierarquia de tamanho entre elas.
  let pecas = [];
  for (const item of ITENS) pecas.push(await recortar(item));

  const util = WIDTH - MARGIN * 2 - VAO_MIN * (pecas.length - 1);
  const larguraCrua = pecas.reduce((s, p) => s + p.width, 0);
  if (larguraCrua > util) {
    const escala = util / larguraCrua;
    console.log(`  reduzindo as peças em ${((1 - escala) * 100).toFixed(0)}%`);
    pecas = [];
    for (const item of ITENS) {
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

  await fs.mkdir(path.dirname(DEST), { recursive: true });
  await sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 3, background: BACKGROUND },
  })
    .composite(camadas)
    .webp({ quality: 88 })
    .toFile(DEST);

  console.log(`${path.relative(ROOT, DEST)} — ${WIDTH}x${HEIGHT}, ${pecas.length} peças`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
