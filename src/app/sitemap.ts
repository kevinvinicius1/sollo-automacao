import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/catalog";
import { siteConfig } from "../../site.config";

// Necessário para output: 'export'
export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const categories = await getCategories();
  const products = await getProducts();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/produtos/`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/contato/`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.flatMap((c) => [
    {
      url: `${base}/produtos/${c.slug}/`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...c.subcategories.map((s) => ({
      url: `${base}/produtos/${c.slug}/${s.slug}/`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ]);

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/produto/${p.slug}/`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
