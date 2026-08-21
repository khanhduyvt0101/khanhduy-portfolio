---
name: "Khanh Duy Portfolio"
description: "A calm, product-led portfolio shaped through living, refractive glass."
colors:
  canvas-light: "oklch(1 0 0)"
  ink-light: "oklch(0.145 0 0)"
  muted-light: "oklch(0.556 0 0)"
  line-light: "oklch(0.922 0 0)"
  canvas-dark: "oklch(0.145 0 0)"
  ink-dark: "oklch(0.985 0 0)"
  muted-dark: "oklch(0.708 0 0)"
  line-dark: "oklch(1 0 0 / 10%)"
  glass-light: "oklch(1 0 0 / 58%)"
  glass-soft-light: "oklch(1 0 0 / 42%)"
  glass-strong-light: "oklch(0.96 0.025 245 / 76%)"
  glass-edge-light: "oklch(1 0 0 / 72%)"
  glass-light-dark: "oklch(0.28 0.035 250 / 54%)"
  glass-soft-dark: "oklch(0.24 0.03 250 / 42%)"
  glass-strong-dark: "oklch(0.32 0.055 250 / 72%)"
  glass-edge-dark: "oklch(1 0 0 / 18%)"
  ambient-cyan: "oklch(0.82 0.11 215 / 42%)"
  ambient-violet: "oklch(0.86 0.1 285 / 34%)"
  ambient-mint: "oklch(0.9 0.09 165 / 24%)"
typography:
  display:
    fontFamily: "Geist, sans-serif"
    fontSize: "clamp(3.75rem, 8vw, 6rem)"
    fontWeight: 600
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Geist, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3rem)"
    fontWeight: 600
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Geist, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.875rem"
  2xl: "1.125rem"
  full: "9999px"
spacing:
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  5: "1.25rem"
  6: "1.5rem"
  8: "2rem"
  12: "3rem"
components:
  button-glass:
    backgroundColor: "{colors.glass-strong-light}"
    textColor: "{colors.ink-light}"
    typography: "{typography.label}"
    rounded: "{rounded.xl}"
    padding: "0 0.625rem"
    height: "2rem"
  button-link:
    textColor: "{colors.ink-light}"
    typography: "{typography.label}"
    rounded: "{rounded.xl}"
    padding: "0"
  chip:
    backgroundColor: "{colors.glass-soft-light}"
    textColor: "{colors.ink-light}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0.125rem 0.5rem"
    height: "1.25rem"
  card:
    backgroundColor: "{colors.glass-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.2xl}"
    padding: "1rem"
---

# Design System: Khanh Duy Portfolio

## Overview

**Creative North Star: "Living Glass Portfolio"**

The portfolio is calm, refractive, precise, and product-led. Its glass is not a decorative overlay: translucent surfaces organize the experience while ambient cyan, violet, and mint light makes the page feel alive beneath them.

Real product artwork and portrait photography are the most saturated, recognizable objects in the composition. Interface chrome stays neutral and translucent so ownership, contribution, and destination remain immediately legible in both themes.

**Key Characteristics:**

- Cool atmospheric light behind neutral content.
- Layered glass with bright refractive edges and diffuse depth.
- Wide, direct typography with compact supporting labels.
- Product artwork remains visually dominant.
- Motion is slow, restrained, and disabled when reduced motion is requested.

## Colors

The palette pairs monochrome semantic content with cool translucent glass and sparse spectral atmosphere.

### Primary

- **Clear Ink:** The high-contrast foreground for names, headings, controls, and essential copy; its light and dark values invert with the theme.

### Secondary

- **Atmospheric Cyan:** The strongest environmental glow, concentrated near the opening viewport and selection state.
- **Atmospheric Violet:** A quieter counter-glow that adds refractive color without competing with artwork.

### Tertiary

- **Atmospheric Mint:** A low-intensity lower-page glow used to keep long surfaces dimensional.

### Neutral

- **Open Canvas:** The page ground, white in light mode and near-black in dark mode.
- **Quiet Copy:** Secondary descriptions, metadata, captions, and footer text.
- **Refractive Edge:** Bright, low-opacity borders that reveal the silhouette of glass.
- **Living Glass:** The default translucent plane for cards and grouped content.
- **Soft Glass:** The quietest layer for chips and subordinate controls.
- **Focused Glass:** The denser layer for navigation, the portrait carousel, menus, and the footer.

### Named Rules

**The Artwork Leads Rule.** Ambient color and glass may frame product artwork, but must never tint, obscure, or visually outrank it.

**The Theme Is Structural Rule.** Preserve the paired light and dark values; do not treat dark mode as a filter applied after composition.

## Typography

**Display Font:** Geist (with sans-serif fallback)

**Body Font:** Geist (with sans-serif fallback)
**Label/Mono Font:** Geist Mono (with monospace fallback)

**Character:** A single rational grotesk keeps the voice modern and direct. Hierarchy comes from scale, weight, line length, and spacing rather than ornamental type changes.

### Hierarchy

- **Display:** Semibold with tight tracking; reserved for the name in the hero and kept broad enough to read as one compact statement.
- **Headline:** Semibold with the same tight tracking; introduces the owner and developer product collections.
- **Title:** Semibold; names products inside cards and showcase rows.
- **Body:** Regular with generous leading; explanatory copy stays within roughly 68 characters per line.
- **Label:** Medium; navigation, buttons, badges, metadata, and compact group labels.

### Named Rules

**The Direct Voice Rule.** Use plain, first-person product language; type should clarify the work rather than perform around it.

## Layout

The global content container is capped at 80rem and uses responsive horizontal padding: 1rem on mobile, 1.5rem from small screens, and 2rem on large screens. Major sections use 6rem vertical padding, expanding to 8rem on medium screens, with 3rem between section introductions and their showcases.

The hero is a single column on mobile and becomes an asymmetric copy-and-portrait grid at the medium breakpoint. Owner products use a dense 12-column mosaic with intentional 7/5 and 4/4/4 spans. Developer products use full-width horizontal rows. Both collapse into clear stacked reading order on narrow screens.

The floating header and inset footer retain a small viewport gutter. Layouts must remain legible from 390px mobile through desktop, without horizontal overflow.

**The Product Path Rule.** Preserve the sequence: identity, owned products, developer products, then direct destinations.

## Elevation & Depth

Depth is ambient and layered. Default surfaces combine translucent fill, a bright one-pixel edge, background blur, saturation, diffuse cool shadows, and a subtle inset highlight. Soft controls use an 18px blur, standard surfaces use 24px, and focused glass uses 32px; the solid frosted fallback preserves readability when backdrop filtering is unavailable.

### Shadow Vocabulary

- **Control:** `0 0.125rem 0.5rem oklch(0.35 0.06 250 / 8%), inset 0 1px 0 oklch(1 0 0 / 64%)`; compact depth for controls and artwork frames.
- **Surface:** `0 0.75rem 2.5rem oklch(0.35 0.08 250 / 12%), 0 0.125rem 0.5rem oklch(0.35 0.06 250 / 7%), inset 0 1px 0 oklch(1 0 0 / 78%)`; default card elevation in light mode.
- **Focused:** `0 1.5rem 4rem oklch(0.35 0.1 250 / 16%), 0 0.25rem 1rem oklch(0.35 0.08 250 / 8%), inset 0 1px 0 oklch(1 0 0 / 84%)`; navigation, carousel, footer, and hover emphasis in light mode.

### Named Rules

**The Ambient Layer Rule.** Elevation should feel like light passing through material, never like a hard drop shadow beneath an opaque panel.

## Shapes

The form language is gently rectangular. Large surfaces, cards, image frames, navigation, and footer use the 2xl corner; controls use the xl corner; carousel controls and chips use full circles. One-pixel translucent borders define glass edges, while imagery is clipped inside a slightly smaller nested radius.

Avoid mixing arbitrary radii inside one component. Nested elements step down one established radius so the material reads as a coherent shell.

## Components

Components are translucent but legible. Their states add lift or clarity without turning navigation into a field of opaque calls to action.

### Buttons

- **Shape:** Compact rounded rectangles for text controls and circles for icon-only controls.
- **Primary:** Strong glass with foreground text; the default control is 2rem high, while prominent outbound actions use the 2.25rem large size.
- **Hover / Focus:** Hover lifts by 2px and may strengthen the ambient shadow; focus uses a visible three-pixel semantic ring; active buttons settle by 1px.
- **Secondary / Ghost / Link:** Secondary controls use softer glass, ghost controls reveal glass only on interaction, and link actions remain underlined with a stronger decoration on hover.

### Chips

- **Style:** Full-radius soft glass with compact medium labels and a restrained refractive border.
- **State:** Interactive chips may brighten on hover; destructive state uses the semantic destructive tint rather than a new glass color.

### Cards / Containers

- **Corner Style:** Gently rounded 2xl shells with clipped content.
- **Background:** Living Glass for product content; Focused Glass for persistent or high-attention shells.
- **Shadow Strategy:** Ambient at rest, strengthening to Focused elevation on hover.
- **Border:** A single refractive edge, never a heavy opaque stroke.
- **Internal Padding:** 1rem by default, with larger bespoke showcase rows using responsive 1.25rem, 1.75rem, and 2.25rem padding.

### Navigation

The sticky navigation is a focused-glass bar inset from the viewport. The signature remains an image mark, product destinations remain underlined links, and the theme control remains a compact icon button. At small widths, labels and spacing tighten without hiding either product collection.

### Product Showcases

Owner cards use a dense mosaic; developer work uses horizontal rows. Artwork sits in its own control-glass frame and scales gently on hover. Visit actions retain explicit outbound-link language, and ownership or developer contribution remains visible without obscuring the product name.

### Portrait Carousel

Portraits fill a focused-glass 4:5 frame. Crossfades use a 700ms ease-out transition with a slight scale change; previous, next, and position controls sit on glass and remain fully operable by accessible labels. Reduced-motion users receive no transition.

## Do's and Don'ts

### Do:

- **Do** preserve strong semantic contrast across translucent layers and the solid fallback.
- **Do** let real logos, screenshots, and portraits carry the strongest visual identity.
- **Do** keep owned products and developer contributions visibly distinct and directly navigable.
- **Do** keep outbound CTAs explicit and link-like, with underlines or outbound-arrow cues where implemented.
- **Do** use refractive borders, ambient shadows, and restrained motion as one coordinated material system.

### Don't:

- **Don't** turn every link into a filled button or make navigation feel like a bank of competing CTAs.
- **Don't** place heavy color washes, blur, or glass effects over product artwork.
- **Don't** replace the cool atmospheric palette with unrelated per-section accent colors.
- **Don't** use hard black drop shadows, thick borders, or opaque card stacks that flatten the living-glass effect.
- **Don't** invent metrics, testimonials, product outcomes, or decorative interface content.
