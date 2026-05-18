"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  isPortfolioCommandPaletteShortcut,
  type PortfolioCommandPaletteOpenDetail,
  portfolioCommandPaletteOpenEvent,
} from "~/lib/portfolio/command-palette-events";
import type { PortfolioCommandPaletteOpenRequest } from "~/lib/portfolio/portfolio-interactions";

const LazyPortfolioCommandPalette = dynamic(
  () =>
    import("~/lib/portfolio/portfolio-interactions").then(
      (module) => module.PortfolioCommandPalette,
    ),
  { ssr: false },
);

export function PortfolioCommandPaletteLoader(): ReactNode {
  const [openRequest, setOpenRequest] =
    useState<PortfolioCommandPaletteOpenRequest | null>(null);

  useEffect(() => {
    if (openRequest) {
      return;
    }

    let requestId = 0;
    const openPalette = (
      source: PortfolioCommandPaletteOpenDetail["source"],
    ) => {
      requestId += 1;
      setOpenRequest({ id: requestId, source });
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (isPortfolioCommandPaletteShortcut(event)) {
        event.preventDefault();
        openPalette("keyboard_shortcut");
      }
    };
    const onPaletteOpen = (event: Event) => {
      const detail = (event as CustomEvent<PortfolioCommandPaletteOpenDetail>)
        .detail;
      openPalette(detail?.source ?? "header_search");
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(portfolioCommandPaletteOpenEvent, onPaletteOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(
        portfolioCommandPaletteOpenEvent,
        onPaletteOpen,
      );
    };
  }, [openRequest]);

  return openRequest ? (
    <LazyPortfolioCommandPalette openRequest={openRequest} />
  ) : null;
}
