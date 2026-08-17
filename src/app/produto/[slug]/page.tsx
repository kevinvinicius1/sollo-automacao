import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb, { type Crumb } from "@/components/Breadcrumb";
import ProductGallery from "@/components/ProductGallery";
import ProductVariants from "@/components/ProductVariants";
import SpecsTable from "@/components/SpecsTable";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import {
  getCategoryBySlug,
  getProductBySlug,
  getProducts,
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
  // O nome já começa pelo código em todo produto que tem um.
  const title = product.name;
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
  // O código identifica o produto sem estourar a linha; nomes da Gefran
  // passam de 60 caracteres e fariam a trilha quebrar, empurrando o
  // "Voltar" para baixo. Sem código cadastrado, cai no nome.
  crumbs.push({ label: product.code || product.name });

  // Todo produto com código já traz o código no início do nome, então
  // repeti-lo aqui duplicava o trecho na mensagem ("1850 – 1850 – …").
  const whatsappCta = whatsappLink(
    `Olá! Gostaria de um orçamento do produto ${product.name}`
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
    ...(category && { brand: { "@type": "Brand", name: category.brand } }),
    ...(product.images.length > 0 && {
      image: product.images.map((img) => `${siteConfig.url}${img}`),
    }),
    url: `${siteConfig.url}/produto/${product.slug}/`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Faixa de identificação do produto — azul profundo fechado por
          filete bordô, ecoando o filete do topo do header */}
      <section className="border-b-4 border-accent-500 bg-brand-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Breadcrumb items={crumbs} tone="dark" />
            <Link
              href={
                category && subcategory
                  ? `/produtos/${category.slug}/${subcategory.slug}/`
                  : "/produtos/"
              }
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-200 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Voltar
            </Link>
          </div>

          {product.code && (
            <p className="mt-6 text-sm font-bold uppercase tracking-widest text-accent-300">
              {product.code}
            </p>
          )}
          <h1
            className={`max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl ${
              product.code ? "mt-1" : "mt-6"
            }`}
          >
            {product.name}
          </h1>
          {category && subcategory && (
            <p className="mt-3 text-sm text-brand-200">
              {category.name} · {subcategory.name}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <ProductGallery images={product.images} name={product.name} />

          <div>
            <p className="leading-relaxed text-slate-600">
              {product.shortDescription}
            </p>

            <a
              href={whatsappCta}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded bg-accent-500 px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-accent-600 sm:w-auto"
            >
              <WhatsAppIcon className="h-6 w-6" />
              Solicitar orçamento pelo WhatsApp
            </a>
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

        <ProductVariants images={product.images} name={product.name} />

      </div>
    </>
  );
}
