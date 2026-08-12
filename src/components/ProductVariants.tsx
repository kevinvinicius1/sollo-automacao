"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

/**
 * Grade com todas as fotos/variações do produto, com visualização ampliada.
 * Substitui a antiga seção de produtos relacionados na página de produto.
 */
export default function ProductVariants({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  const prev = useCallback(
    () =>
      setOpen((i) => (i === null ? i : (i + images.length - 1) % images.length)),
    [images.length]
  );
  const next = useCallback(
    () => setOpen((i) => (i === null ? i : (i + 1) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, prev, next]);

  if (images.length < 2) return null;

  return (
    <section aria-labelledby="variacoes-heading" className="mt-10">
      <h2
        id="variacoes-heading"
        className="mb-4 border-b-2 border-accent-500 pb-2 text-xl font-bold text-brand-700"
      >
        Modelos e variações
      </h2>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {images.map((src, i) => (
          <li key={src}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Ampliar foto ${i + 1} de ${images.length}`}
              className="relative block aspect-square w-full overflow-hidden rounded border border-slate-200 bg-white transition-colors hover:border-accent-300"
            >
              <Image
                src={src}
                alt={`${name} — variação ${i + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                className="object-contain p-3"
              />
            </button>
          </li>
        ))}
      </ul>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ${open + 1} de ${images.length} — ${name}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4"
          onClick={() => setOpen(null)}
        >
          <div
            className="relative h-[min(80vh,42rem)] w-full max-w-3xl rounded bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[open]}
              alt={`${name} — variação ${open + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-contain p-10"
            />
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Fechar visualização"
              className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded bg-brand-700 text-white transition-colors hover:bg-brand-600"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={prev}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded bg-brand-700 text-white transition-colors hover:bg-brand-600"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Próxima foto"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded bg-brand-700 text-white transition-colors hover:bg-brand-600"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-500">
              {open + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
