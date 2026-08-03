# SkytLabs Limited Corporate Website Plan

## Goals
Build a multi-page, SEO-friendly corporate website for SkytLabs Limited, an IT consulting company in Nigeria. The site will feel premium, modern, and distinctly African tech, anchored by a corporate blue palette with vibrant accents.

## Information Architecture (Routes)
Replace the placeholder index page with proper corporate routes under `src/routes/`:

```text
__root.tsx       -> root layout (header, footer, fonts, global SEO)
index.tsx        -> Home / landing
services.tsx     -> All 10 services with grouped cards
products.tsx     -> AI Call Center product page
projects.tsx     -> Digital transformation schedule case study
contact.tsx      -> Address, email, phone (mailto), map area
```

## Design Direction
- **Palette**: Corporate blue as the primary anchor, deep navy for premium contrast, warm amber/gold accents for the African tech vibrancy, and clean off-white backgrounds.
- **Typography**: Load a modern sans-serif display font (e.g., Inter or Space Grotesk) for headings and a clean body font via `<link>` in `__root.tsx` head. Keep font pairing minimal.
- **Visual style**: Large hero sections, subtle gradients, rounded cards, generous whitespace, and professional imagery.
- **Tokens**: Add semantic tokens in `src/styles.css` under `@theme inline` and `:root`/`dark` (primary blue, accent gold, navy foreground, premium surfaces).

## Shared Components
- **Header / Navigation**: Sticky top nav with logo text "SkytLabs", nav links (Home, Services, Products, Projects, Contact), mobile hamburger menu.
- **Footer**: Company address, email, quick links, social placeholders, copyright.
- **CTA Banner**: Reusable section to drive inquiries to the Contact page.
- **Section wrappers / hero primitives**: Consistent padding, max-width, and heading hierarchy.

## Page Content
- **Home**: Hero with headline + subheadline, trust indicators, 3 featured service highlights, a "Why SkytLabs" section, featured product (AI Call Center) teaser, CTA to contact.
- **Services**: Grid or accordion of the 10 services, grouped logically (Development & QA, Strategy & Architecture, Infrastructure & Security, Data & Enterprise Apps, Operations & Automation).
- **Products**: Dedicated page for the AI Call Center product with key features, dashboard benefits, and response/decision-making value props.
- **Projects**: Case study page for the Digital Transformation Schedule, listing applications (Staff Management, Asset Management, HR Management, etc.) and the operational efficiency outcome.
- **Contact**: Address (Plot 4, Church Street, Magodo GRA, Lagos), email `info@skytlabs.com` as a mailto link, a simple contact form that submits via mailto, and a Lagos location visual/map area.

## Imagery
Generate premium, context-appropriate images under `src/assets/` for:
- Home hero (African tech team / Lagos skyline / modern office)
- AI Call Center product visual
- Digital transformation / enterprise workflow visual
- Each major service group icon or illustration (kept subtle)

Images will be imported as ES6 imports and used with `alt` text.

## SEO / Metadata
- Add route-level `head()` in every leaf route with unique title, description, `og:title`, `og:description`, `og:url`, canonical links, and JSON-LD Organization schema in `__root.tsx`.
- No root-level `og:image`; leaf pages will include generated absolute images where relevant.

## Technical Notes
- Uses TanStack Start + Tailwind v4 + shadcn/ui.
- No backend functionality required (mailto-only contact). No Lovable Cloud activation needed.
- Shared layout rendered in `__root.tsx` around `<Outlet />`.
- All navigation uses TanStack `<Link>`.
- No custom hardcoded colors; all colors come from semantic design tokens.

## Build & Verify
- Run `bun run build` and verify all routes render without errors.
- Check that route head metadata appears in the page source.
- Spot-check mobile responsiveness and navigation in the live preview.
