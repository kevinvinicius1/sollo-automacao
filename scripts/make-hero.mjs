#!/usr/bin/env node
/**
 * Gera os banners de topo das oito linhas de produto.
 *
 * Os banners são montados a partir das próprias fotos de catálogo, quatro por
 * linha, sempre sobre o mesmo fundo: o carrossel da home alterna Gefran e
 * Fluir a cada slide e qualquer diferença de tom apareceria como um "pulo" na
 * troca de imagem.
 *
 * As fotos são de estúdio sobre branco: `trim` corta a moldura branca e o
 * blend `multiply` faz o branco restante sumir no fundo claro, preservando a
 * sombra natural de cada peça. As alturas abaixo são um alvo: se a fila não
 * couber na largura, todas encolhem na mesma proporção, mantendo a hierarquia.
 *
 * O logotipo do fabricante entra pequeno no canto superior esquerdo, dentro de
 * uma faixa livre reservada no topo para que nenhuma peça encoste nele.
 *
 * Rodar: node scripts/make-hero.mjs
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PRODUCTS = path.join(ROOT, "public", "images", "products");
const CATEGORIAS = path.join(ROOT, "public", "images", "categorias");
const MARCAS = path.join(ROOT, "scripts", "marcas");

const WIDTH = 1080;
const HEIGHT = 400;
const BACKGROUND = { r: 238, g: 242, b: 246 };
const MARGIN = 30;
/**
 * Vão mínimo entre peças. Vale por banner (`vaoMin`) porque foto de peça na
 * diagonal — os cilindros — tem quadro largo e cantos vazios: sem deixar os
 * quadros se sobreporem, as peças precisariam encolher e a fila ficaria
 * pequena no meio de um banner vazio.
 */
const VAO_MIN = 20;
/**
 * Faixa vertical em que a fila pode entrar: começa abaixo do logotipo e para
 * antes da borda inferior. As peças são alinhadas pela base — não
 * centralizadas uma a uma — e a base flutua para centralizar a fila inteira na
 * faixa: linhas de peças alongadas (sensores Melt, magnetostritivos) rendem
 * alturas baixas e, com base fixa, deixariam um vazio grande em cima.
 */
const FAIXA_TOPO = 58;
const FAIXA_BASE = 362;

/** Larguras diferentes porque o logotipo da Fluir tem símbolo além do texto. */
const LOGOTIPOS = {
  Gefran: { file: "gefran.svg", width: 128 },
  "Fluir Automação": { file: "fluir.png", width: 100 },
};
const MARCA_TOP = 26;

/**
 * Um banner por linha. A seleção privilegia os modelos de maior saída e a
 * variedade de formatos — peças de silhueta parecida lado a lado achatam o
 * banner.
 */
const BANNERS = [
  {
    slug: "controladores-e-indicadores",
    marca: "Gefran",
    itens: [
      { file: "gfxtermo4-controlador-pid-4-circuitos-para-trilho-din-1.webp", height: 250 },
      { file: "600-controlador-pid-1-16-din-1.webp", height: 215 },
      { file: "1650-controlador-pid-de-circuito-duplo-1-8-din-1.webp", height: 255 },
      { file: "3850t-controlador-e-registrador-de-ate-16-loops-pid-1.webp", height: 235 },
    ],
  },
  {
    slug: "reles-e-modulos-de-potencia",
    marca: "Gefran",
    itens: [
      { file: "gtf-controlador-de-potencia-monofasico-ate-250a-1.webp", height: 270 },
      { file: "gfx4-controlador-de-potencia-4-circuitos-pid-ate-80-kw-1.webp", height: 235 },
      { file: "grz-h-rele-de-estado-solido-trifasico-10a-ate-75a-1.webp", height: 260 },
      { file: "gq-rele-de-estado-solido-monofasico-ate-90a-1.webp", height: 245 },
    ],
  },
  {
    // Uma peça por família: magnetostritivo, força, cabo e angular. Só o
    // magnetostritivo é alongado — dois na mesma fila achatariam o banner.
    slug: "transdutores-de-posicao",
    marca: "Gefran",
    itens: [
      { file: "wpa-a-magnetostritivo-avancado-perfil-de-aluminio-saida-analogica-1.webp", height: 165 },
      { file: "dlc-celula-de-carga-de-diafragma-sem-amplificador-1.webp", height: 210 },
      { file: "gsh-s-1-8-8-3-m-sensor-a-cabo-para-posicao-linear-1.webp", height: 250 },
      { file: "gra-sensor-rotativo-de-volta-unica-por-efeito-hall-com-eixo-1.webp", height: 285 },
    ],
  },
  {
    // O Melt entra pelo CSP-H: é o transdutor de alta temperatura de capilar
    // mais curto da sublinha — os demais passam de 2,7:1 e sozinhos comeriam
    // a largura da fila. O visor fecha a fila porque os transdutores
    // industriais têm todos a mesma silhueta de cilindro de inox.
    slug: "sensores-de-pressao-melt",
    marca: "Gefran",
    itens: [
      { file: "csp-h-transdutor-de-alta-temperatura-com-saida-hart-1.webp", height: 200 },
      { file: "kx-saida-ma-a-prova-de-explosao-peso-atex-sil2-pac-eac-1.webp", height: 245 },
      { file: "ks-saidas-volt-ou-ma-sil2-de-tamanho-compacto-1.webp", height: 235 },
      { file: "tdp-1001-visor-dos-limites-de-alarme-plug-in-local-1.webp", height: 290 },
    ],
  },
  {
    slug: "cilindros-pneumaticos",
    marca: "Fluir Automação",
    vaoMin: -25,
    itens: [
      { file: "fct-cilindro-tirantado-iso-1.webp", height: 215 },
      { file: "fce-cilindro-perfil-europa-iso-1.webp", height: 200 },
      { file: "fcc-cilindro-compacto-advu-1.webp", height: 195 },
      { file: "fcmi-cilindro-mini-iso-1.webp", height: 175 },
    ],
  },
  {
    slug: "valvulas",
    marca: "Fluir Automação",
    itens: [
      { file: "valvulas-iso-1.webp", height: 245 },
      { file: "valvula-solenoide-com-plug-din-1.webp", height: 265 },
      { file: "valvula-angular-latao-zfa-1.webp", height: 250 },
      { file: "valvula-alta-ciclagem-1.webp", height: 230 },
    ],
  },
  {
    slug: "preparacao-do-ar",
    marca: "Fluir Automação",
    itens: [
      { file: "conjunto-lubrefil-intermediaria-1.webp", height: 285 },
      { file: "filtro-regulador-16-bar-1.webp", height: 300 },
      { file: "regulador-pressao-30-preparacao-especial-1.webp", height: 285 },
      { file: "purgador-eletronico-com-filtro-y-acoplado-2-1.webp", height: 295 },
    ],
  },
  {
    // Conexão avulsa é peça pequena e sozinha não sustenta o banner: entram
    // junto o espiral, o silenciador e a pistola, que dão escala à fila e
    // cobrem os três itens do nome da linha.
    slug: "conexoes",
    marca: "Fluir Automação",
    itens: [
      { file: "tubos-e-espirais-1.webp", height: 200 },
      { file: "pat-distribuidor-multiplo-2x2-1.webp", height: 210 },
      { file: "bsl-silenciador-bronze-conico-1.webp", height: 195 },
      { file: "pistola-de-ar-para-limpeza-1.webp", height: 230 },
    ],
  },
];

const ALTURA_MAX = FAIXA_BASE - FAIXA_TOPO;

/**
 * O sharp aplica `trim` antes de `flatten` dentro de um mesmo pipeline, e boa
 * parte das fotos da Fluir tem canal alfa: num pipeline só, o recorte olharia
 * para pixels transparentes e não cortaria nada. Daí as duas passagens.
 */
async function recortar({ file, height }) {
  const alvo = Math.min(height, ALTURA_MAX);
  const opaca = await sharp(path.join(PRODUCTS, file))
    .flatten({ background: "#ffffff" })
    .toBuffer();
  const buf = await sharp(opaca)
    .trim({ background: "#ffffff", threshold: 12 })
    .resize({ height: alvo, withoutEnlargement: false })
    .toBuffer();
  const { width } = await sharp(buf).metadata();
  return { buf, width, height: alvo };
}

async function logotipo(marca) {
  const { file, width } = LOGOTIPOS[marca];
  const origem = path.join(MARCAS, file);
  const buf = await sharp(origem, { density: 600 })
    .resize({ width })
    .png()
    .toBuffer();
  const meta = await sharp(buf).metadata();
  return { input: buf, left: MARGIN, top: MARCA_TOP, height: meta.height };
}

async function montar({ slug, marca, itens, vaoMin = VAO_MIN }) {
  let pecas = [];
  for (const item of itens) pecas.push(await recortar(item));

  const util = WIDTH - MARGIN * 2 - vaoMin * (pecas.length - 1);
  const larguraCrua = pecas.reduce((s, p) => s + p.width, 0);
  if (larguraCrua > util) {
    const escala = util / larguraCrua;
    pecas = [];
    for (const item of itens) {
      pecas.push(await recortar({ ...item, height: Math.round(Math.min(item.height, ALTURA_MAX) * escala) }));
    }
  }

  const larguraTotal = pecas.reduce((s, p) => s + p.width, 0);
  const vao = (WIDTH - MARGIN * 2 - larguraTotal) / (pecas.length - 1);

  const alturaMaior = Math.max(...pecas.map((p) => p.height));
  const baseline = FAIXA_BASE - (ALTURA_MAX - alturaMaior) / 2;

  let x = MARGIN;
  const camadas = pecas.map((p) => {
    const layer = {
      input: p.buf,
      left: Math.round(x),
      top: Math.round(baseline - p.height),
      blend: "multiply",
    };
    x += p.width + vao;
    return layer;
  });

  const marcaLayer = await logotipo(marca);
  camadas.push(marcaLayer);

  const dest = path.join(CATEGORIAS, `topo-${slug}.webp`);
  await fs.mkdir(CATEGORIAS, { recursive: true });
  await sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 3, background: BACKGROUND },
  })
    .composite(camadas)
    .webp({ quality: 88 })
    .toFile(dest);

  console.log(
    `${path.relative(ROOT, dest)} — ${marca}, ${pecas.length} peças` +
      ` (altura máx. ${Math.max(...pecas.map((p) => p.height))}px, vão ${Math.round(vao)}px)`
  );
}

async function main() {
  for (const banner of BANNERS) await montar(banner);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
