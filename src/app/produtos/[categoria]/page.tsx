import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import CategoryCard from "@/components/CategoryCard";
import PageTitleBar from "@/components/PageTitleBar";
import ProductCard from "@/components/ProductCard";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/catalog";
import { isWipCategory, whatsappLink } from "../../../../site.config";

type Props = { params: Promise<{ categoria: string }> };

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const category = await getCategoryBySlug(categoria);
  if (!category) return {};
  return {
    title: category.name,
    description: `Catálogo de ${category.name.toLowerCase()}: consulte os produtos e solicite seu orçamento pelo WhatsApp.`,
  };
}

export default async function CategoriaPage({ params }: Props) {
  const { categoria } = await params;
  const category = await getCategoryBySlug(categoria);
  if (!category) notFound();

  const wip = isWipCategory(category.slug);
  const hasSubcategories = !wip && category.subcategories.length > 0;
  const products =
    wip || hasSubcategories
      ? []
      : (await getProducts()).filter((p) => p.category === category.slug);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-6 sm:px-6">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Produtos", href: "/produtos/" },
            { label: category.name },
          ]}
        />
        {category.heroImage && (
          <Image
            src={category.heroImage}
            alt={`Produtos da linha ${category.name}`}
            width={1080}
            height={400}
            unoptimized
            priority
            className="mt-4 h-auto w-full rounded"
          />
        )}
      </div>

      <PageTitleBar title={category.name} backHref="/produtos/" />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {wip ? (
          <div className="rounded border border-slate-200 bg-white p-8 text-center">
            <h2 className="text-xl font-bold text-brand-700">
              Trabalho em andamento
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-slate-600">
              Os produtos desta linha estão sendo cadastrados no catálogo.
            </p>
          </div>
        ) : hasSubcategories ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {category.subcategories.map((sub) => (
              <CategoryCard
                key={sub.slug}
                name={sub.name}
                href={`/produtos/${category.slug}/${sub.slug}/`}
                image={sub.image}
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <div className="rounded border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600">
              Os itens desta linha ainda não foram publicados no site. Consulte
              disponibilidade e preço com a equipe comercial.
            </p>
            <a
              href={whatsappLink(
                `Olá! Gostaria de consultar produtos da linha ${category.name}.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded bg-accent-500 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent-600"
            >
              Consultar pelo WhatsApp
            </a>
          </div>
        )}
      </div>
    </>
  );
}
