import { ArrowLeft, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb, { type Crumb } from "@/components/Breadcrumb";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import ProductLinesStrip from "@/components/ProductLinesStrip";
import SpecsTable from "@/components/SpecsTable";
import {
  getCategoryBySlug,
  getProductBySlug,
  getProducts,
  getProductsBySubcategory,
} from "@/lib/catalog";
import { siteConfig, whatsappLink } from "../../../../site.config";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const title = product.code
    ? `${product.code} — ${product.name}`
    : product.name;
  return {
    title,
    description: product.shortDescription,
    openGraph: {
      title,
      description: product.shortDescription,
      type: "website",
      ...(product.images.length > 0 && { images: [product.images[0]] }),
    },
  };
}

/** Extrai o ID de um vídeo do YouTube a partir das formas comuns de URL. */
function youtubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default async function ProdutoPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const category = await getCategoryBySlug(product.category);
  const subcategory = category?.subcategories.find(
    (s) => s.slug === product.subcategory
  );

  const related = (
    await getProductsBySubcategory(product.category, product.subcategory)
  )
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  const crumbs: Crumb[] = [
    { label: "Home", href: "/" },
    { label: "Produtos", href: "/produtos/" },
  ];
  if (category) {
    crumbs.push({ label: category.name, href: `/produtos/${category.slug}/` });
    if (subcategory) {
      crumbs.push({
        label: subcategory.name,
        href: `/produtos/${category.slug}/${subcategory.slug}/`,
      });
    }
  }
  crumbs.push({ label: product.name });

  const whatsappCta = whatsappLink(
    product.code
      ? `Olá! Gostaria de um orçamento do produto ${product.code} – ${product.name}`
      : `Olá! Gostaria de um orçamento do produto ${product.name}`
  );

  const embeds = product.videos
    .map(youtubeEmbedUrl)
    .filter((u): u is string => u !== null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.code && { sku: product.code }),
    description: product.shortDescription,
    brand: { "@type": "Brand", name: "Fluir Automação" },
    ...(product.images.length > 0 && {
      image: product.images.map((img) => `${siteConfig.url}${img}`),
    }),
    url: `${siteConfig.url}/produto/${product.slug}/`,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumb items={crumbs} />
        <Link
          href={
            category && subcategory
              ? `/produtos/${category.slug}/${subcategory.slug}/`
              : "/produtos/"
          }
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-500"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar
        </Link>
      </div>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          {product.code && (
            <p className="text-sm font-bold uppercase tracking-widest text-accent-600">
              {product.code}
            </p>
          )}
          <h1 className="mt-1 text-2xl font-bold leading-tight tracking-tight text-brand-700 sm:text-3xl">
            {product.name}
          </h1>
          <p className="mt-4 leading-relaxed text-slate-600">
            {product.shortDescription}
          </p>

          <a
            href={whatsappCta}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded bg-accent-500 px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-accent-600 sm:w-auto"
          >
            <MessageCircle className="h-6 w-6" aria-hidden="true" />
            Solicitar orçamento pelo WhatsApp
          </a>
          <p className="mt-3 text-sm text-slate-500">
            Atendimento comercial: {siteConfig.phone} ·{" "}
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-brand-500 underline"
            >
              {siteConfig.email}
            </a>
          </p>
        </div>
      </div>

      <SpecsTable specsHtml={product.specsHtml} />

      {embeds.length > 0 && (
        <section aria-labelledby="videos-heading" className="mt-10">
          <h2
            id="videos-heading"
            className="mb-4 border-b-2 border-accent-500 pb-2 text-xl font-bold text-brand-700"
          >
            Vídeos
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {embeds.map((src) => (
              <div
                key={src}
                className="aspect-video overflow-hidden rounded border border-slate-200 bg-black"
              >
                <iframe
                  src={src}
                  title={`Vídeo do produto ${product.name}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="h-full w-full"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="relacionados-heading" className="mt-14">
          <h2
            id="relacionados-heading"
            className="mb-5 text-xl font-bold text-brand-700"
          >
            Produtos relacionados
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      <ProductLinesStrip />
    </div>
  );
}
