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

/** Carrossel de banners das linhas de produto, exibido no hero da home. */
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
    <div aria-roledescription="carousel" aria-label="Linhas de produtos">
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden rounded bg-white">
          <div className="flex">
            {slides.map((slide, i) => (
              <div
                key={slide.href}
                className="min-w-0 flex-[0_0_100%]"
                aria-roledescription="slide"
                aria-label={`${i + 1} de ${slides.length}`}
              >
                <Link href={slide.href} className="block">
                  <Image
                    src={slide.image}
                    alt={`Linha ${slide.name}`}
                    width={1080}
                    height={400}
                    unoptimized
                    priority={i === 0}
                    draggable={false}
                    className="h-auto w-full"
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={scrollPrev}
          aria-label="Slide anterior"
          className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded bg-brand-700 text-white transition-colors hover:bg-brand-600"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          aria-label="Próximo slide"
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded bg-brand-700 text-white transition-colors hover:bg-brand-600"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-4 flex justify-center gap-2.5">
        {slides.map((slide, i) => (
          <button
            key={slide.href}
            type="button"
            onClick={() => scrollTo(i)}
            aria-label={`Ir para o slide ${i + 1} — ${slide.name}`}
            aria-current={i === selected ? "true" : undefined}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              i === selected ? "bg-white" : "bg-brand-400 hover:bg-brand-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
