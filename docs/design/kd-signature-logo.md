# KD Signature Logo Handoff

Issue: BUI-316

## Chosen Direction

Use a connected KD signature mark that feels personal, light, and product-builder oriented instead of a generic app tile. The mark keeps the K readable through a tall entry stroke and angled shoulder, then connects into a rounded D loop and exit flourish.

Design lenses applied:

- Recognition over Recall: the mark must still read as KD without surrounding name text.
- Pragnanz: one continuous, simple stroke is easier to parse than a detailed cursive signature.
- Fitts's Law and WCAG POUR: the header logo should retain a predictable clickable target, with visible focus handled on the link rather than on the tiny mark.
- Aesthetic-Usability Effect: the signature treatment gives the portfolio a personal craft cue while staying restrained enough for the modern indie Mac UI direction.

## Assets

- Header/wordmark asset: `/public/brand/kd-signature.svg`
- Favicon/app icon source: `/public/brand/kd-signature-icon.svg`

Both assets are vector SVGs. Keep the SVGs as the source of truth and generate PNG/ICO outputs only where the framework or browser surface requires a raster fallback.

## Header Usage

- Place the mark before or in place of the current `Khanh Duy` text brand in the sticky header.
- Recommended rendered size: `width: 96px; height: auto` on desktop, `width: 82px` on narrow mobile.
- Preserve a minimum click target of `44px` high for the home link.
- Use the transparent header asset on light surfaces. If it is inlined as SVG later, map the main stroke to `currentColor` and keep the teal accent as `#14b8a6`.
- Keep at least `16px` gap from adjacent navigation controls so the flourish does not visually merge with the nav.

## Favicon Usage

- Use `/public/brand/kd-signature-icon.svg` as the favicon concept source.
- Generate `app/icon.png` from the square source at 512x512 or larger.
- Generate `/public/favicon.ico` with 16x16, 32x32, and 48x48 entries if ICO compatibility remains required.
- Do not use the long header SVG as a favicon; the square source has heavier strokes and a dark rounded tile so it survives browser-tab sizes.

## Accessibility

- The header home link should expose one accessible name: `aria-label="Khanh Duy home"`.
- If the SVG is rendered inline inside that link, set the SVG to `aria-hidden="true"` and keep the accessible name on the link.
- If rendered with `next/image` or `img`, use `alt="Khanh Duy"` only when there is no duplicate adjacent text. Use `alt=""` when visible text already labels the link.

## Implementation Notes for CTO

- Current header brand is in `app/layout.tsx`.
- Replace the current gradient text link with a home link containing the KD signature asset. A text fallback can remain visually hidden if desired.
- Keep the existing sticky header height and spacing; the logo should not increase header height or push nav controls.
