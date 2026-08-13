import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import ProductCard from "@/components/ProductCard";
import {
  getCategories,
  getCategoryBySlug,
  getProductsBySubcategory,
} from "@/lib/catalog";
import { isWipCategory, whatsappLink } from "../../../../../site.config";

type Props = { params: Promise<{ categoria: string; sub: string }> };

export async function generateStaticParams() {
  const categories = await getCategories();
  // Linhas em prévia não geram páginas de subcategoria
  return categories
    .filter((c) => !isWipCategory(c.slug))
    .flatMap((c) =>
      c.subcategories.map((s) => ({ categoria: c.slug, sub: s.slug }))
    );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria, sub } = await params;
  const category = await getCategoryBySlug(categoria);
  const subcategory = category?.subcategories.find((s) => s.slug === sub);
  if (!category || !subcategory) return {};
  return {
    title: `${subcategory.name} — ${category.name}`,
    description: `Catálogo de ${subcategory.name.toLowerCase()}: consulte os produtos e solicite seu orçamento pelo WhatsApp.`,
  };
}

export default async function SubcategoriaPage({ params }: Props) {
  const { categoria, sub } = await params;
  const category = await getCategoryBySlug(categoria);
  const subcategory = category?.subcategories.find((s) => s.slug === sub);
  if (!category || !subcategory) notFound();

  const products = await getProductsBySubcategory(category.slug, subcategory.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Produtos", href: "/produtos/" },
          { label: category.name, href: `/produtos/${category.slug}/` },
          { label: subcategory.name },
        ]}
      />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-brand-700">
          {subcategory.name}
        </h1>
        <Link
          href={`/produtos/${category.slug}/`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar
        </Link>
      </div>
      <div className="mt-3 h-1 w-14 bg-accent-500" aria-hidden="true" />

      {products.length > 0 ? (
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
              `Olá! Gostaria de consultar produtos da linha ${subcategory.name}.`
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
