# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Visitors evaluating Khanh Duy's work as an indie app owner and software developer, including potential users, collaborators, and professional peers.

## Product Purpose

Present Khanh Duy, the products he owns, and the products he helps build in one concise portfolio. Success means visitors can quickly understand the distinction between owned products and developer work, inspect each product, and reach the relevant live site or social profile.

## Positioning

The portfolio connects a real indie product portfolio with hands-on developer work across focused macOS, iOS, AI, and document products rather than presenting generic skills or invented case studies.

## Operating Context

Visitors primarily scan the home page, move between the owner and developer product collections, open product websites, and use the footer to reach Khanh Duy's verified profiles or email.

## Capabilities and Constraints

- Preserve the existing single-page information architecture, product descriptions, external URLs, structured data, metadata, light and dark themes, and responsive behavior.
- Keep owned products and developer products visibly distinct and directly navigable from the header.
- Retain the existing Next.js, React, Tailwind CSS v4, Radix-based shadcn, Bun, Biome, and Vitest stack.
- Do not invent customers, outcomes, testimonials, metrics, or commercial claims.

## Brand Commitments

- Preserve the name Khanh Duy, the signature mark, portrait, existing product logos, and the direct first-person voice.
- Use Glass UI as the visual system across the whole site, including navigation, hero surfaces, product showcases, controls, error and not-found states, and footer.
- Glass treatments must keep content legible and product imagery visually dominant.

## Evidence on Hand

- Portrait and signature assets under `public/`.
- Real product and platform assets under `assets/`.
- Product names, descriptions, domains, URLs, social profiles, and update date in `lib/profile.ts`.
- Existing metadata and structured-data implementation in `app/` and `lib/seo.ts`.

## Product Principles

- Let real products and their identities lead the experience.
- Make ownership and developer contribution immediately understandable.
- Prefer direct navigation and working destinations over decorative interaction.
- Preserve accessibility, responsiveness, and performance while making the visual system distinctive.
