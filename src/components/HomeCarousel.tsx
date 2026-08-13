"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export interface HomeCarouselSlide {
  name: string;
  href: string;
  image: string;
}

/**
 * Carrossel de banners das linhas de produto, exibido no hero da home.
 * Preenche a altura do contêiner pai (a moldura diagonal define o recorte).
 */
export default function HomeCarousel({
  slides,
}: {
  slides: HomeCarouselSlide[];
}) {
  const autoplay = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    autoplay.current,
  ]);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      autoplay.current.stop();
    }
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  if (slides.length === 0) return null;

  return (
    <div
      className="relative h-full"
      aria-roledescription="carousel"
      aria-label="Linhas de produtos"
    >
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {slides.map((slide, i) => (
            <div
              key={slide.href}
              className="relative min-w-0 flex-[0_0_100%]"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${slides.length}`}
            >
              <Link href={slide.href} className="block h-full">
                <Image
                  src={slide.image}
                  alt={`Linha ${slide.name}`}
                  fill
                  unoptimized
                  priority={i === 0}
                  draggable={false}
                  className="object-cover"
                />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* No mobile a navegação é por arrasto; as setas só aparecem de sm pra cima */}
      <div className="absolute bottom-3 right-3 hidden gap-2 sm:flex">
        <button
          type="button"
          onClick={scrollPrev}
          aria-label="Slide anterior"
          className="flex h-9 w-9 items-center justify-center rounded bg-brand-700 text-white transition-colors hover:bg-brand-600"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          aria-label="Próximo slide"
          className="flex h-9 w-9 items-center justify-center rounded bg-brand-700 text-white transition-colors hover:bg-brand-600"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2.5">
        {slides.map((slide, i) => (
          <button
            key={slide.href}
            type="button"
            onClick={() => scrollTo(i)}
            aria-label={`Ir para o slide ${i + 1} — ${slide.name}`}
            aria-current={i === selected ? "true" : undefined}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              i === selected
                ? "bg-accent-500"
                : "bg-slate-400 hover:bg-slate-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
