import type { Metadata } from "next";
import CategoryCard from "@/components/CategoryCard";
import PageTitleBar from "@/components/PageTitleBar";
import { getCategories } from "@/lib/catalog";
import { isWipCategory } from "../../../site.config";

export const metadata: Metadata = {
  title: "Produtos",
  description:
    "Linha completa de produtos pneumáticos industriais: cilindros, válvulas, preparação de ar, conexões e acessórios.",
};

export default async function ProdutosPage() {
  const categories = await getCategories();

  return (
    <>
      <PageTitleBar
        title="Produtos"
        crumbs={[{ label: "Home", href: "/" }, { label: "Produtos" }]}
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="max-w-2xl text-slate-600">
          Escolha uma linha de produtos para navegar pelo catálogo.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.slug}
              name={cat.name}
              href={`/produtos/${cat.slug}/`}
              image={cat.image}
              wip={isWipCategory(cat.slug)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
