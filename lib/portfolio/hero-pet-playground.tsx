import Image from "next/image";
import type { ReactNode } from "react";

const catAsset = "/pets/wandering-cat/cat.gif";
const catSize = {
  desktopHeight: 90,
  desktopWidth: 146,
  mobileHeight: 70,
  mobileWidth: 114,
};

export function HeroPetPlayground(): ReactNode {
  return (
    <div className="pointer-events-none relative h-28 overflow-hidden bg-transparent md:h-36">
      <div className="hero-pet-glint left-[16%] top-9 bg-chart-2" />
      <div className="hero-pet-glint left-[42%] top-4 bg-chart-4 [--glint-delay:-0.7s]" />
      <div className="hero-pet-glint left-[72%] top-11 bg-chart-1 [--glint-delay:-1.5s]" />
      <div aria-hidden="true" className="hero-pet-wanderer">
        <span className="absolute left-5 top-5 h-14 w-24 rounded-full bg-primary/20 blur-xl md:left-6 md:top-6 md:h-16 md:w-28" />
        <span className="absolute left-7 top-[3.55rem] h-2.5 w-20 rounded-[999px] bg-foreground/20 blur-sm md:left-8 md:top-[4.6rem] md:h-3 md:w-24" />
        <Image
          alt=""
          aria-hidden="true"
          className="relative h-[70px] w-[114px] select-none object-contain [image-rendering:auto] md:h-[90px] md:w-[146px]"
          draggable={false}
          height={catSize.desktopHeight}
          src={catAsset}
          unoptimized
          width={catSize.desktopWidth}
        />
      </div>
    </div>
  );
}
