"use client";

import Image from "next/image";
import { useState } from "react";
import { ImagePlaceholder } from "./ProductCard";

/** Galeria simples: imagem principal + miniaturas clicáveis. */
export default function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) {
    return (
      <div className="overflow-hidden rounded border border-slate-200">
        <ImagePlaceholder className="aspect-square w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded border border-slate-200 bg-white">
        <Image
          src={images[current]}
          alt={`${name} — imagem ${current + 1} de ${images.length}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-4"
        />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Miniaturas">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Ver imagem ${i + 1} de ${images.length}`}
                aria-current={i === current}
                className={`relative h-16 w-16 overflow-hidden rounded border-2 bg-white transition-colors ${
                  i === current
                    ? "border-accent-500"
                    : "border-slate-200 hover:border-accent-300"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
