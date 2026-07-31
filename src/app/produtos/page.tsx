import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import CategoryCard from "@/components/CategoryCard";
import { getCategories } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Produtos",
  description:
    "Linha completa de produtos pneumáticos industriais: cilindros, válvulas, preparação de ar, conexões e acessórios.",
};

export default async function ProdutosPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Produtos" }]}
      />
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-brand-700">Produtos</h1>
      <div className="mt-3 h-1 w-14 bg-accent-500" aria-hidden="true" />
      <p className="mt-3 max-w-2xl text-slate-600">
        Escolha uma linha de produtos para navegar pelo catálogo.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.slug}
            name={cat.name}
            href={`/produtos/${cat.slug}/`}
            image={cat.image}
          />
        ))}
      </div>
    </div>
  );
}
