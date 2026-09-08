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

/**
 * Todas as medidas abaixo estão no sistema de 1080×400 — a proporção 27:10 em
 * que o banner é diagramado — e `px()` converte para o pixel do arquivo. O
 * banner é exibido a 1104 CSS px de largura, então em tela retina o navegador
 * pede o dobro disso: gravar em 1× deixava a imagem visivelmente mole em
 * metade dos aparelhos. As fotos de origem (a maioria com 1200px de lado)
 * aguentam 2× sem ampliação.
 */
const ESCALA = 2;
const px = (n) => Math.round(n * ESCALA);

const WIDTH = px(1080);
const HEIGHT = px(400);
const BACKGROUND = { r: 238, g: 242, b: 246 };
const MARGIN = px(30);
/**
 * Vão mínimo entre peças. Vale por banner (`vaoMin`) porque foto de peça na
 * diagonal — os cilindros — tem quadro largo e cantos vazios: sem deixar os
 * quadros se sobreporem, as peças precisariam encolher e a fila ficaria
 * pequena no meio de um banner vazio.
 */
const VAO_MIN = 20; // em unidades de 1x, como as alturas dos itens
/**
 * Faixa vertical em que a fila pode entrar: começa abaixo do logotipo e para
 * antes da borda inferior. As peças são alinhadas pela base — não
 * centralizadas uma a uma — e a base flutua para centralizar a fila inteira na
 * faixa: linhas de peças alongadas (sensores Melt, magnetostritivos) rendem
 * alturas baixas e, com base fixa, deixariam um vazio grande em cima.
 */
const FAIXA_TOPO = px(58);
const FAIXA_BASE = px(362);

/** Larguras diferentes porque o logotipo da Fluir tem símbolo além do texto. */
const LOGOTIPOS = {
  Gefran: { file: "gefran.svg", width: px(128) },
  "Fluir Automação": { file: "fluir.png", width: px(100) },
};
const MARCA_TOP = px(26);

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
    // Entra o curinga GPC no lugar do GFX4: a única foto de produto do GFX4
    // publicada pela Gefran tem 354×340 (as outras duas do produto são logos
    // de protocolo), pequena demais para o banner em 2×.
    slug: "reles-e-modulos-de-potencia",
    marca: "Gefran",
    itens: [
      { file: "gtf-controlador-de-potencia-monofasico-ate-250a-1.webp", height: 270 },
      { file: "gpc-controlador-de-potencia-avancado-ate-600-a-1.webp", height: 235 },
      { file: "grz-h-rele-de-estado-solido-trifasico-10a-ate-75a-1.webp", height: 260 },
      { file: "gq-rele-de-estado-solido-monofasico-ate-90a-1.webp", height: 245 },
    ],
  },
  {
    // Seleção do cliente (set/2026): LT, SH e GRA da lista principal e o
    // curinga GSF no lugar do segundo potenciômetro — dois potenciômetros
    // alongados lado a lado deixavam a fila baixa e o banner vazio.
    slug: "transdutores-de-posicao",
    marca: "Gefran",
    itens: [
      { file: "lt-potenciometro-com-haste-1.webp", height: 170 },
      { file: "sh-celula-de-carga-de-perfil-padrao-1.webp", height: 210 },
      { file: "gsf-transdutor-de-posicao-a-cabo-potenciometro-a-cabo-1.webp", height: 260 },
      { file: "gra-sensor-rotativo-de-volta-unica-por-efeito-hall-com-eixo-1.webp", height: 285 },
    ],
  },
  {
    // Seleção do cliente (set/2026): KS, TK e HME da lista principal e o
    // curinga TDP-1001 fechando a fila. Só um Melt: com dois, o capilar de
    // cada um come a largura e os industriais encolhem.
    slug: "sensores-de-pressao-melt",
    marca: "Gefran",
    itens: [
      { file: "ks-saidas-volt-ou-ma-sil2-de-tamanho-compacto-1.webp", height: 235 },
      { file: "tk-saida-volt-ou-ma-de-uso-geral-1.webp", height: 245 },
      { file: "hme-smart-hart-nivel-de-desempenho-c-1.webp", height: 200 },
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
    // Seleção do cliente (set/2026), quatro da lista principal. O Trio
    // Odontológico entra na foto de copos transparentes, como ele pediu.
    slug: "preparacao-do-ar",
    marca: "Fluir Automação",
    itens: [
      { file: "conjunto-lubrefil-intermediaria-1.webp", height: 285 },
      { file: "trio-odontologico-2-3.webp", height: 270 },
      { file: "regulador-pressao-30-preparacao-especial-1.webp", height: 285 },
      { file: "purgador-eletronico-timer-2-1.webp", height: 260 },
    ],
  },
  {
    // Conexão avulsa é peça pequena e sozinha não sustenta o banner. A pedido
    // do cliente (set/2026) esta linha é um mosaico: as 16 peças da lista
    // dele em duas fileiras, no estilo das fotos de conjunto de conexões —
    // fileira de cima com as instantâneas de plástico, a de baixo com as de
    // latão e inox e os silenciadores.
    slug: "conexoes",
    marca: "Fluir Automação",
    vaoMin: 12,
    fileiras: [
      [
        { file: "valvulas-fechamento-manual-1.webp", height: 125 },
        { file: "nse-g-regulador-de-fluxo-bsp-1.webp", height: 130 },
        { file: "nsf-regulador-de-fluxo-em-linha-1.webp", height: 125 },
        { file: "ph-g-banjo-1.webp", height: 120 },
        { file: "pt-g-tee-macho-central-1.webp", height: 130 },
        { file: "conexoes-instantanea-bspp-1.webp", height: 125 },
        { file: "pza-cruzeta-1.webp", height: 130 },
        { file: "put-tee-uniao-copia-1.webp", height: 125 },
      ],
      [
        { file: "sp-03-luva-femea-1.webp", height: 105 },
        { file: "sp-06-cotovelo-femea-x-femea-1.webp", height: 115 },
        { file: "sp-09-tee-femea-1.webp", height: 115 },
        { file: "sp-12-cruzeta-femea-1.webp", height: 125 },
        { file: "ss-pl-cotovelo-macho-inox-1.webp", height: 120 },
        { file: "ss-pc-conector-macho-inox-1.webp", height: 120 },
        { file: "pse-silenciador-conico-1.webp", height: 130 },
        { file: "besl-silenciador-com-controle-de-fluxo-1.webp", height: 135 },
      ],
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
  const alvo = Math.round(Math.min(px(height), ALTURA_MAX));
  const opaca = await sharp(path.join(PRODUCTS, file))
    .flatten({ background: "#ffffff" })
    .toBuffer();
  const recorte = await sharp(opaca)
    .trim({ background: "#ffffff", threshold: 12 })
    .toBuffer();
  const nativa = await sharp(recorte).metadata();
  const buf = await sharp(recorte)
    .resize({ height: alvo, withoutEnlargement: false })
    .toBuffer();
  const { width } = await sharp(buf).metadata();
  return { buf, width, height: alvo, file, ampliacao: alvo / nativa.height };
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

/**
 * Recorta uma fileira e, se ela não couber na largura, encolhe todas as peças
 * na mesma proporção. `alturaMax` é o teto de cada peça — a faixa inteira no
 * banner de uma fileira, a fatia da fileira no mosaico.
 */
async function ajustarFileira(itens, vaoMin, alturaMax) {
  const teto = alturaMax / ESCALA;
  let pecas = [];
  for (const item of itens) pecas.push(await recortar({ ...item, height: Math.min(item.height, teto) }));

  const util = WIDTH - MARGIN * 2 - px(vaoMin) * (pecas.length - 1);
  const larguraCrua = pecas.reduce((s, p) => s + p.width, 0);
  if (larguraCrua > util) {
    const escala = util / larguraCrua;
    pecas = [];
    for (const item of itens) {
      pecas.push(await recortar({ ...item, height: Math.min(item.height, teto) * escala }));
    }
  }

  const larguraTotal = pecas.reduce((s, p) => s + p.width, 0);
  const vao = (WIDTH - MARGIN * 2 - larguraTotal) / (pecas.length - 1);
  return { pecas, vao };
}

const VAO_FILEIRAS = px(22);

async function montar({ slug, marca, itens, fileiras, vaoMin = VAO_MIN }) {
  const camadas = [];
  let pecas;
  let vao;

  if (fileiras) {
    // Mosaico: as fileiras dividem a faixa em fatias iguais e cada peça fica
    // centralizada na vertical dentro da sua fatia — peça pequena alinhada
    // pela base, como no banner de uma fileira, parece pendurada no vazio.
    const fatia = (ALTURA_MAX - VAO_FILEIRAS * (fileiras.length - 1)) / fileiras.length;
    const ajustadas = [];
    for (const fileira of fileiras) ajustadas.push(await ajustarFileira(fileira, vaoMin, fatia));
    pecas = ajustadas.flatMap((a) => a.pecas);
    vao = Math.min(...ajustadas.map((a) => a.vao));

    const alturas = ajustadas.map((a) => Math.max(...a.pecas.map((p) => p.height)));
    const alturaBloco = alturas.reduce((s, h) => s + h, 0) + VAO_FILEIRAS * (fileiras.length - 1);
    let y = FAIXA_TOPO + (ALTURA_MAX - alturaBloco) / 2;
    ajustadas.forEach((a, i) => {
      let x = MARGIN;
      for (const p of a.pecas) {
        camadas.push({
          input: p.buf,
          left: Math.round(x),
          top: Math.round(y + (alturas[i] - p.height) / 2),
          blend: "multiply",
        });
        x += p.width + a.vao;
      }
      y += alturas[i] + VAO_FILEIRAS;
    });
  } else {
    ({ pecas, vao } = await ajustarFileira(itens, vaoMin, ALTURA_MAX));

    const alturaMaior = Math.max(...pecas.map((p) => p.height));
    const baseline = FAIXA_BASE - (ALTURA_MAX - alturaMaior) / 2;

    let x = MARGIN;
    for (const p of pecas) {
      camadas.push({
        input: p.buf,
        left: Math.round(x),
        top: Math.round(baseline - p.height),
        blend: "multiply",
      });
      x += p.width + vao;
    }
  }

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

  // O banner é gravado em 2x justamente para não ficar mole em tela retina —
  // não adianta se a foto de origem for pequena e tiver que ser esticada.
  for (const p of pecas.filter((p) => p.ampliacao > 1.05)) {
    console.log(
      `   aviso: ${p.file} ampliada ${p.ampliacao.toFixed(2)}x — procurar foto maior`
    );
  }
}

async function main() {
  for (const banner of BANNERS) await montar(banner);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
