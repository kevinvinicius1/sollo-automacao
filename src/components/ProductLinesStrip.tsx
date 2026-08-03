import CategoryCard from "@/components/CategoryCard";
import { getCategories } from "@/lib/catalog";
import { isWipCategory } from "../../site.config";

/** Faixa "Linha de Produtos" repetida no fim das páginas internas. */
export default async function ProductLinesStrip() {
  const categories = await getCategories();

  return (
    <section aria-labelledby="linhas-strip-heading" className="mt-16 border-t border-slate-200 pt-10">
      <h2
        id="linhas-strip-heading"
        className="text-2xl font-bold tracking-tight text-brand-700"
      >
        Linha de Produtos
      </h2>
      <div className="mt-3 h-1 w-14 bg-accent-500" aria-hidden="true" />
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
    </section>
  );
}
