"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export interface HomeCarouselSlide {
  name: string;
  image: string;
}

/**
 * Carrossel de banners das linhas de produto, exibido no hero da home.
 * Preenche a altura do contêiner pai, que tem a mesma proporção dos banners
 * (object-contain garante que a imagem apareça inteira, sem corte).
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

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  if (slides.length === 0) return null;

  return (
    <div aria-roledescription="carousel" aria-label="Linhas de produtos">
      <div
        ref={emblaRef}
        className="aspect-[27/10] overflow-hidden rounded bg-white"
      >
        <div className="flex h-full">
          {slides.map((slide, i) => (
            <div
              key={slide.image}
              className="relative min-w-0 flex-[0_0_100%]"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${slides.length}`}
            >
              <Image
                src={slide.image}
                alt={`Linha ${slide.name}`}
                fill
                unoptimized
                priority={i === 0}
                draggable={false}
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Os marcadores ficam fora da imagem: o banner é uma faixa 27:10 com
          peça de ponta a ponta e, no celular, ele tem só uns 130px de altura —
          por dentro os marcadores caíam em cima dos produtos. */}
      <div className="mt-4 flex justify-center gap-2.5">
        {slides.map((slide, i) => (
          <button
            key={slide.image}
            type="button"
            onClick={() => scrollTo(i)}
            aria-label={`Ir para o slide ${i + 1} — ${slide.name}`}
            aria-current={i === selected ? "true" : undefined}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              i === selected
                ? "bg-accent-500"
                : "bg-brand-400 hover:bg-brand-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
