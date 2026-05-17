import type { Metadata } from "next";
import type { FreeTool } from "~/lib/free-tools/tool-meta";
import {
  createSeoMetadata,
  serializeJsonLd,
  siteName,
  siteUrl,
} from "~/lib/site/seo";

type FreeToolSeo = {
  title: string;
  description: string;
  keywords: string[];
};

const sharedToolKeywords = [
  "free online tool",
  "free browser tool",
  "no signup tool",
  "client-side tool",
  "private developer tool",
];

const freeToolSeoBySlug: Record<string, FreeToolSeo> = {
  "qr-code-generator": {
    title: "Free QR Code Generator Online",
    description:
      "Create QR codes online for URLs, Wi-Fi, contacts, SMS, email, and short text. Free browser QR code generator with no signup.",
    keywords: [
      "free QR code generator",
      "QR code generator online",
      "Wi-Fi QR code generator",
      "vCard QR code",
      "text to QR code",
    ],
  },
  "json-formatter": {
    title: "Free JSON Formatter and Validator",
    description:
      "Format, validate, minify, and inspect JSON online without uploading data. Free JSON formatter for API payloads, configs, and debugging.",
    keywords: [
      "free JSON formatter",
      "JSON validator online",
      "JSON beautifier",
      "JSON minifier",
      "format API JSON",
    ],
  },
  "jwt-decoder": {
    title: "Free JWT Decoder Online",
    description:
      "Decode JWT headers and payloads in your browser. Free JSON Web Token decoder for claims, auth debugging, and token inspection.",
    keywords: [
      "free JWT decoder",
      "JWT decoder online",
      "JSON Web Token decoder",
      "decode JWT payload",
      "JWT claims viewer",
    ],
  },
  "uuid-generator": {
    title: "Free UUID Generator Online",
    description:
      "Generate UUID v4 identifiers online for tests, fixtures, prototypes, and databases. Free browser UUID generator with instant copy.",
    keywords: [
      "free UUID generator",
      "UUID v4 generator",
      "GUID generator online",
      "random UUID",
      "unique ID generator",
    ],
  },
  "password-generator": {
    title: "Free Strong Password Generator",
    description:
      "Create strong random passwords with length, symbols, numbers, and readability controls. Free password generator that runs in your browser.",
    keywords: [
      "free password generator",
      "strong password generator",
      "random password generator",
      "secure password generator",
      "passphrase generator",
    ],
  },
  "base64-encoder": {
    title: "Free Base64 Encoder and Decoder",
    description:
      "Encode and decode Base64 strings online for API testing, Unicode text, JWT debugging, and quick data conversion.",
    keywords: [
      "free Base64 encoder",
      "Base64 decoder online",
      "encode Base64",
      "decode Base64",
      "atob btoa tool",
    ],
  },
  "url-encoder": {
    title: "Free URL Encoder and Decoder",
    description:
      "Encode and decode URLs, query strings, redirect links, and copied parameters. Free URI encoder for everyday web debugging.",
    keywords: [
      "free URL encoder",
      "URL decoder online",
      "query string encoder",
      "URI encode decode",
      "percent encoding tool",
    ],
  },
  "regex-tester": {
    title: "Free JavaScript Regex Tester",
    description:
      "Test JavaScript regular expressions online with sample text, flags, matches, and replace output. Free browser regex tester.",
    keywords: [
      "free regex tester",
      "JavaScript regex tester",
      "regular expression tester",
      "regex match tester",
      "regex replace tool",
    ],
  },
  "hash-generator": {
    title: "Free SHA Hash Generator",
    description:
      "Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes for text snippets, checksums, signatures, and quick verification.",
    keywords: [
      "free hash generator",
      "SHA256 generator",
      "SHA hash online",
      "checksum generator",
      "text hash generator",
    ],
  },
  "timestamp-converter": {
    title: "Free Unix Timestamp Converter",
    description:
      "Convert Unix timestamps to readable local and UTC dates, including seconds and milliseconds. Free epoch time converter.",
    keywords: [
      "Unix timestamp converter",
      "epoch converter",
      "timestamp to date",
      "milliseconds timestamp converter",
      "UTC time converter",
    ],
  },
  "timezone-converter": {
    title: "Free Timezone Converter",
    description:
      "Compare meeting times across cities, remote-work schedules, UTC offsets, and world clocks with a free browser timezone converter.",
    keywords: [
      "free timezone converter",
      "world clock converter",
      "meeting time planner",
      "UTC offset converter",
      "remote work timezone tool",
    ],
  },
  "word-counter": {
    title: "Free Word Counter Online",
    description:
      "Count words, characters, sentences, and reading time for drafts, essays, docs, and copywriting. Free browser text counter.",
    keywords: [
      "free word counter",
      "character counter",
      "reading time calculator",
      "sentence counter",
      "text counter online",
    ],
  },
  "text-diff-checker": {
    title: "Free Text Diff Checker",
    description:
      "Compare two text snippets, prompts, docs, or config files side by side. Free online diff checker for changes and reviews.",
    keywords: [
      "free text diff checker",
      "compare text online",
      "document diff tool",
      "prompt diff checker",
      "side by side diff",
    ],
  },
  "markdown-preview": {
    title: "Free Markdown Preview Tool",
    description:
      "Preview Markdown online for README files, docs, release notes, and GitHub content. Free browser Markdown renderer.",
    keywords: [
      "free Markdown preview",
      "Markdown renderer online",
      "README preview",
      "GitHub Markdown preview",
      "MD preview tool",
    ],
  },
  "css-gradient-generator": {
    title: "Free CSS Gradient Generator",
    description:
      "Create linear and radial CSS gradients, preview colors, and copy production-ready snippets. Free gradient generator for designers.",
    keywords: [
      "free CSS gradient generator",
      "linear gradient generator",
      "radial gradient CSS",
      "background gradient tool",
      "CSS color gradient",
    ],
  },
  "color-converter": {
    title: "Free Color Converter",
    description:
      "Convert HEX, RGB, HSL, OKLCH, and named colors online. Free color converter for design tokens, CSS, and UI themes.",
    keywords: [
      "free color converter",
      "HEX to RGB",
      "RGB to HSL",
      "OKLCH converter",
      "CSS color converter",
    ],
  },
  "palette-from-image": {
    title: "Free Color Palette From Image",
    description:
      "Extract a usable color palette from images, brand assets, screenshots, and photos. Free browser palette generator from image.",
    keywords: [
      "palette from image",
      "color palette generator",
      "extract colors from image",
      "image color picker",
      "brand palette generator",
    ],
  },
  "image-compressor": {
    title: "Free Image Compressor",
    description:
      "Compress PNG, JPEG, and WebP images in your browser for faster uploads, product screenshots, and web performance.",
    keywords: [
      "free image compressor",
      "compress PNG online",
      "compress JPEG online",
      "WebP compressor",
      "reduce image size",
    ],
  },
  "image-resizer": {
    title: "Free Image Resizer",
    description:
      "Resize images online for avatars, thumbnails, social previews, uploads, and app stores. Free browser image resizer.",
    keywords: [
      "free image resizer",
      "resize image online",
      "avatar image resizer",
      "thumbnail resizer",
      "change image dimensions",
    ],
  },
  "images-to-pdf": {
    title: "Free Images to PDF Converter",
    description:
      "Combine screenshots, scans, receipts, and photos into one PDF file in your browser. Free images to PDF converter.",
    keywords: [
      "free images to PDF",
      "JPG to PDF converter",
      "PNG to PDF converter",
      "combine images into PDF",
      "screenshots to PDF",
    ],
  },
};

export function getFreeToolSeo(tool: FreeTool): FreeToolSeo {
  return (
    freeToolSeoBySlug[tool.slug] ?? {
      title: `${tool.title} Online`,
      description: `${tool.summary} Free browser tool with no signup.`,
      keywords: [`free ${tool.title.toLowerCase()}`, ...tool.keywords],
    }
  );
}

export function createFreeToolMetadata(tool: FreeTool): Metadata {
  const seo = getFreeToolSeo(tool);

  return createSeoMetadata({
    title: seo.title,
    description: seo.description,
    imageAlt: `${seo.title} by ${siteName}`,
    keywords: uniqueKeywords([
      ...seo.keywords,
      ...tool.keywords,
      ...sharedToolKeywords,
    ]),
    path: `/free-tools/${tool.slug}`,
  });
}

export function createFreeToolJsonLd(tool: FreeTool) {
  const seo = getFreeToolSeo(tool);

  return {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
    name: seo.title.replace(/^Free /, ""),
    alternateName: tool.title,
    applicationCategory: getApplicationCategory(tool.category),
    applicationSubCategory: tool.category,
    browserRequirements: "Modern web browser",
    creator: {
      "@type": "Person",
      name: siteName,
      url: siteUrl,
    },
    description: seo.description,
    featureList: [tool.summary, ...tool.keywords],
    isAccessibleForFree: true,
    keywords: uniqueKeywords([
      ...seo.keywords,
      ...tool.keywords,
      ...sharedToolKeywords,
    ]).join(", "),
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: "0",
      priceCurrency: "USD",
    },
    operatingSystem: "Web browser",
    url: `${siteUrl}/free-tools/${tool.slug}`,
  };
}

export function serializeFreeToolJsonLd(tool: FreeTool) {
  return serializeJsonLd(createFreeToolJsonLd(tool));
}

function getApplicationCategory(category: FreeTool["category"]) {
  switch (category) {
    case "Design":
    case "Image":
      return "DesignApplication";
    case "Developer":
      return "DeveloperApplication";
    case "PDF":
    case "Text":
      return "ProductivityApplication";
  }
}

function uniqueKeywords(keywords: string[]) {
  return Array.from(new Set(keywords));
}
