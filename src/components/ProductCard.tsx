import { ArrowRight, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PhotoReveal from "@/components/PhotoReveal";
import type { Product } from "@/lib/catalog";

/** Placeholder cinza com ícone quando o produto não tem imagens. */
export function ImagePlaceholder({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-slate-100 ${className}`}
      aria-hidden="true"
    >
      <ImageIcon className="h-12 w-12 text-slate-300" strokeWidth={1.5} />
    </div>
  );
}

/** Subconjunto de Product que o card realmente usa (permite listas leves). */
export type ProductCardData = Pick<
  Product,
  "code" | "name" | "slug" | "shortDescription" | "images"
>;

export default function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/produto/${product.slug}/`}
      className="group flex flex-col overflow-hidden rounded border border-slate-200 bg-white shadow-sm transition-colors hover:border-accent-300"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-white">
        {product.images.length > 0 && <PhotoReveal />}
        {product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3 transition-transform group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder className="h-full w-full" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 border-t border-slate-100 p-3 sm:p-4">
        {product.code && (
          <span className="self-start rounded bg-accent-100 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent-700">
            {product.code}
          </span>
        )}
        <h3 className="line-clamp-3 text-sm font-semibold leading-snug text-brand-700 group-hover:text-brand-500">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {product.shortDescription}
        </p>
        <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-semibold text-accent-600 group-hover:underline">
          Ver detalhes
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
