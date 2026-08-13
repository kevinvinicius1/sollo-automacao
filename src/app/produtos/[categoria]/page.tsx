import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import CategoryCard from "@/components/CategoryCard";
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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Produtos", href: "/produtos/" },
          { label: category.name },
        ]}
      />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-brand-700">
          {category.name}
        </h1>
        <Link
          href="/produtos/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar
        </Link>
      </div>
      <div className="mt-3 h-1 w-14 bg-accent-500" aria-hidden="true" />

      {category.heroImage && (
        <Image
          src={category.heroImage}
          alt={`Produtos da linha ${category.name}`}
          width={1080}
          height={400}
          unoptimized
          priority
          className="mt-6 h-auto w-full rounded"
        />
      )}

      {wip ? (
        <div className="mt-8 rounded border border-slate-200 bg-white p-8 text-center">
          <h2 className="text-xl font-bold text-brand-700">
            Trabalho em andamento
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-slate-600">
            Os produtos desta linha estão sendo cadastrados no catálogo.
          </p>
        </div>
      ) : hasSubcategories ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded border border-slate-200 bg-white p-8 text-center">
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
  );
}
