import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import type { ImageProps } from "next/image";
import { createElement } from "react";
import { afterEach, vi } from "vitest";

afterEach(() => cleanup());

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
}));

vi.mock("next/image", () => ({
  default: ({
    fill: _fill,
    preload: _preload,
    priority: _priority,
    unoptimized: _unoptimized,
    src,
    ...props
  }: ImageProps) =>
    createElement("img", {
      ...props,
      src:
        typeof src === "string"
          ? src
          : "default" in src
            ? src.default.src
            : src.src,
    }),
}));

// Test fixtures only; never loaded by production builds.
process.env.NEXT_PUBLIC_SITE_URL ??= "https://www.khanhduy.com";
process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ??= "G-TESTONLY123";
