import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";

/** Schema de um produto em data/products/<slug>.json */
export const productSchema = z.object({
  /** Código/série do produto, ex.: "FCMK" */
  code: z.string(),
  /** Nome completo, ex.: "Cilindro Perfil Mickey Mouse ISO 6431" */
  name: z.string(),
  /** Slug único usado na URL /produto/<slug> */
  slug: z.string(),
  /** Slug da categoria (bate com data/categories.json) */
  category: z.string(),
  /** Slug da subcategoria (bate com data/categories.json) */
  subcategory: z.string(),
  /** Caminhos públicos, ex.: "/images/products/fcmk-1.webp" */
  images: z.array(z.string()),
  /** Resumo curto para cards e meta description */
  shortDescription: z.string(),
  /** Especificações técnicas preservadas como HTML sanitizado */
  specsHtml: z.string(),
  downloads: z.array(z.object({ label: z.string(), file: z.string() })),
  /** URLs de vídeos (YouTube) */
  videos: z.array(z.string()).default([]),
});

export type Product = z.infer<typeof productSchema>;

export const subcategorySchema = z.object({
  name: z.string(),
  slug: z.string(),
  /** Imagem de capa (caminho público) — opcional até o scraper preencher */
  image: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string(),
  slug: z.string(),
  image: z.string().optional(),
  order: z.number(),
  subcategories: z.array(subcategorySchema),
});

export type Category = z.infer<typeof categorySchema>;
export type Subcategory = z.infer<typeof subcategorySchema>;

const DATA_DIR = path.join(process.cwd(), "data");

let productsCache: Product[] | null = null;
let categoriesCache: Category[] | null = null;

export async function getCategories(): Promise<Category[]> {
  if (categoriesCache) return categoriesCache;
  const raw = await fs.readFile(path.join(DATA_DIR, "categories.json"), "utf8");
  categoriesCache = z
    .array(categorySchema)
    .parse(JSON.parse(raw))
    .sort((a, b) => a.order - b.order);
  return categoriesCache;
}

export async function getProducts(): Promise<Product[]> {
  if (productsCache) return productsCache;
  const dir = path.join(DATA_DIR, "products");
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json"));
  productsCache = await Promise.all(
    files.map(async (f) =>
      productSchema.parse(JSON.parse(await fs.readFile(path.join(dir, f), "utf8")))
    )
  );
  productsCache.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  return productsCache;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return (await getCategories()).find((c) => c.slug === slug);
}

export async function getProductsBySubcategory(
  category: string,
  subcategory: string
): Promise<Product[]> {
  return (await getProducts()).filter(
    (p) => p.category === category && p.subcategory === subcategory
  );
}
