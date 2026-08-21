"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import gymPhoto from "~/assets/portraits/gym.webp";
import poolPhoto from "~/assets/portraits/pool.webp";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import avatarPhoto from "~/public/avatar.webp";

interface HeroSlide {
  alt: string;
  image: StaticImageData;
  position: string;
}

const slides: HeroSlide[] = [
  {
    alt: "Portrait of Khanh Duy",
    image: avatarPhoto,
    position: "object-[50%_42%]",
  },
  {
    alt: "Khanh Duy checking his phone at the gym",
    image: gymPhoto,
    position: "object-[52%_50%]",
  },
  {
    alt: "Khanh Duy posing by a pool surrounded by tropical plants",
    image: poolPhoto,
    position: "object-center",
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  function showPreviousSlide() {
    setCurrentSlide((current) => (current - 1 + slides.length) % slides.length);
  }

  function showNextSlide() {
    setCurrentSlide((current) => (current + 1) % slides.length);
  }

  return (
    <section
      aria-label="Khanh Duy photo gallery"
      aria-roledescription="carousel"
      className="glass-frosted relative aspect-[4/5] w-full overflow-hidden rounded-2xl p-2"
    >
      {slides.map((slide, index) => {
        const active = index === currentSlide;

        return (
          <div
            aria-hidden={!active}
            className="absolute inset-2 overflow-hidden rounded-xl"
            key={slide.alt}
          >
            <Image
              alt={slide.alt}
              className={cn(
                "object-cover transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none",
                slide.position,
                active ? "scale-100 opacity-100" : "scale-[1.02] opacity-0",
              )}
              fill
              placeholder="blur"
              preload={index === 0}
              sizes="(max-width: 767px) calc(100vw - 2rem), 28rem"
              src={slide.image}
            />
          </div>
        );
      })}

      <p aria-live="polite" className="sr-only">
        {slides[currentSlide].alt}
      </p>

      <Button
        aria-label="Previous photo"
        className="absolute bottom-5 left-5 rounded-full"
        onClick={showPreviousSlide}
        size="icon"
        variant="secondary"
      >
        <ChevronLeft />
      </Button>

      <div className="glass-control absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1 rounded-full p-1">
        {slides.map((slide, index) => (
          <Button
            aria-label={`Show photo ${index + 1}`}
            aria-pressed={index === currentSlide}
            className="rounded-full"
            key={slide.alt}
            onClick={() => setCurrentSlide(index)}
            size="icon-sm"
            variant="secondary"
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 rounded-full",
                index === currentSlide
                  ? "bg-primary"
                  : "bg-muted-foreground/40",
              )}
            />
          </Button>
        ))}
      </div>

      <Button
        aria-label="Next photo"
        className="absolute right-5 bottom-5 rounded-full"
        onClick={showNextSlide}
        size="icon"
        variant="secondary"
      >
        <ChevronRight />
      </Button>
    </section>
  );
}
