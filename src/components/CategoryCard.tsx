import { ArrowRight, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PhotoReveal from "@/components/PhotoReveal";

/** Card usado para categorias e subcategorias. */
export default function CategoryCard({
  name,
  href,
  image,
  description,
  wip = false,
}: {
  name: string;
  href: string;
  image?: string;
  description?: string;
  /** Linha em prévia: badge "Trabalho em andamento" no lugar do CTA. */
  wip?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded border border-slate-200 bg-white shadow-sm transition-colors hover:border-accent-300"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {wip && (
          <span className="absolute left-2 top-2 z-10 rounded bg-slate-800 px-2 py-0.5 text-xs font-semibold text-white">
            Trabalho em andamento
          </span>
        )}
        {image && <PhotoReveal />}
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-4 transition-transform group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-slate-100"
            aria-hidden="true"
          >
            <Wrench className="h-12 w-12 text-slate-300" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-base font-bold text-brand-700 group-hover:text-brand-500">
          {name}
        </h3>
        {description && (
          <p className="line-clamp-2 text-sm text-slate-500">{description}</p>
        )}
        {wip ? (
          <span className="mt-auto pt-2 text-sm font-medium text-slate-500">
            Linha em atualização
          </span>
        ) : (
          <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold text-accent-600 group-hover:underline">
            Ver produtos
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
    </Link>
  );
}
