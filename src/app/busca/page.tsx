import type { Metadata } from "next";
import { Suspense } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import ProductLinesStrip from "@/components/ProductLinesStrip";
import SearchResults from "@/components/SearchResults";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Busca",
  description: "Busque produtos por nome, código de série ou descrição.",
  robots: { index: false },
};

export default async function BuscaPage() {
  // Lista leve: só os campos que o card e o índice de busca usam
  const items = (await getProducts()).map((p) => ({
    code: p.code,
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription,
    images: p.images.slice(0, 1),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Busca" }]} />
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-brand-700">
        Busca
      </h1>
      <div className="mt-3 h-1 w-14 bg-accent-500" aria-hidden="true" />

      {/* useSearchParams exige Suspense com export estático */}
      <Suspense fallback={null}>
        <SearchResults items={items} />
      </Suspense>

      <ProductLinesStrip />
    </div>
  );
}
