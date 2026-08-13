/**
 * Verificação de integridade do catálogo — roda antes do build.
 * Pega o que o zod não cobre: arquivos referenciados que não existem,
 * slugs órfãos/duplicados e violações de decisões do cliente.
 * Erros derrubam o build (exit 1); avisos só logam.
 */
import { promises as fs } from "fs";
import path from "path";

const ROOT = process.cwd();
const errors = [];
const warnings = [];

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

const categories = JSON.parse(
  await fs.readFile(path.join(ROOT, "data/categories.json"), "utf8")
);

const catSlugs = new Set();
const subPairs = new Set();
for (const cat of categories) {
  if (catSlugs.has(cat.slug)) errors.push(`categoria duplicada: ${cat.slug}`);
  catSlugs.add(cat.slug);
  const subSlugs = new Set();
  for (const sub of cat.subcategories) {
    if (subSlugs.has(sub.slug))
      errors.push(`subcategoria duplicada em ${cat.slug}: ${sub.slug}`);
    subSlugs.add(sub.slug);
    subPairs.add(`${cat.slug}/${sub.slug}`);
    if (sub.image && !(await exists(path.join(ROOT, "public", sub.image))))
      errors.push(`imagem da subcategoria ${sub.slug} não existe: ${sub.image}`);
  }
  if (cat.image && !(await exists(path.join(ROOT, "public", cat.image))))
    errors.push(`imagem da categoria ${cat.slug} não existe: ${cat.image}`);
  if (cat.heroImage && !(await exists(path.join(ROOT, "public", cat.heroImage))))
    errors.push(`banner da categoria ${cat.slug} não existe: ${cat.heroImage}`);
}

const productsDir = path.join(ROOT, "data/products");
const files = (await fs.readdir(productsDir)).filter((f) => f.endsWith(".json"));
const seenSlugs = new Set();
let imageCount = 0;

for (const file of files) {
  const p = JSON.parse(await fs.readFile(path.join(productsDir, file), "utf8"));
  const id = p.slug ?? file;

  if (file !== `${p.slug}.json`)
    errors.push(`${file}: nome do arquivo não bate com o slug "${p.slug}"`);
  if (seenSlugs.has(p.slug)) errors.push(`slug de produto duplicado: ${p.slug}`);
  seenSlugs.add(p.slug);

  if (!catSlugs.has(p.category))
    errors.push(`${id}: categoria "${p.category}" não existe em categories.json`);
  else if (!subPairs.has(`${p.category}/${p.subcategory}`))
    errors.push(
      `${id}: subcategoria "${p.subcategory}" não existe na categoria "${p.category}"`
    );

  for (const img of p.images) {
    imageCount++;
    if (!(await exists(path.join(ROOT, "public", img))))
      errors.push(`${id}: imagem não existe: ${img}`);
  }
  if (p.images.length === 0) warnings.push(`${id}: produto sem imagens`);

  // Decisão do cliente (jul/2026): o site não tem downloads de nenhum tipo
  if (p.downloads?.length > 0)
    errors.push(`${id}: downloads deve ser [] (site não tem downloads)`);

  if (/<\s*(script|style|iframe)/i.test(p.specsHtml))
    errors.push(`${id}: specsHtml contém tag proibida (script/style/iframe)`);
}

console.log(
  `Catálogo: ${files.length} produtos, ${categories.length} categorias, ${imageCount} imagens referenciadas.`
);
for (const w of warnings) console.warn(`AVISO: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`ERRO: ${e}`);
  console.error(`\n${errors.length} erro(s) de integridade — build abortado.`);
  process.exit(1);
}
console.log("Integridade OK.");
