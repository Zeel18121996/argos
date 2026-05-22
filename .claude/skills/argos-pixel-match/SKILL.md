---
name: argos-pixel-match
description: Compare a built ArgosC page or component against the live argos.co.uk reference and produce a pixel-level diff plan. Use when the user asks to "pixel-match", "match the live site", "compare against Argos", or has just finished building a storefront page (homepage, browse, PDP, basket, checkout, etc.) and wants a polish pass.
---

# Skill: argos-pixel-match

Produces a structured pixel-diff plan against https://www.argos.co.uk/ for a single ArgosC page or component.

## Inputs needed

1. **Local page or component** — path under `client/src/`.
2. **Live reference URL** on argos.co.uk (e.g. `https://www.argos.co.uk/`, `/browse/home-and-furniture/c:30009`, `/product/{id}`).
3. **Viewports** to check — default `[375, 768, 1024, 1440]`.

## Workflow

1. Read the local component file(s). List the Tailwind classes used, the shadcn primitives, and any inline styles.
2. `WebFetch` the live reference URL. Extract:
   - Visible text, heading hierarchy.
   - Colours (look for `style=` and class names in the fetched HTML/CSS hints).
   - Grid / column counts at the requested viewports.
   - Spacing landmarks (header height, hero height, footer column count).
3. Build a side-by-side audit:

   | Element        | Local                  | Argos.co.uk | Diff                        |
   | -------------- | ---------------------- | ----------- | --------------------------- |
   | Header height  | `h-16` (64px)          | ~72px       | Bump to `h-[72px]`          |
   | Primary CTA bg | `bg-red-600` (#dc2626) | `#ED1C24`   | Replace with `bg-argos-red` |
   | Card radius    | `rounded-lg` (8px)     | 4px         | Use `rounded` (4px)         |

4. Note any **token violations** — hex literals, inline styles, off-scale spacing — and propose Tailwind-token replacements.
5. Note **a11y** issues spotted on the way (missing `alt`, missing focus ring, low contrast).

## Hard rules

- Use only the Argos design tokens defined in `tailwind.config.ts` → `theme.extend.colors.argos.*`. If the live site uses a colour not yet in the config, propose adding it as a new token rather than introducing a hex literal.
- No `style={{ … }}` inline styles unless animating dynamic values.
- Reference comparison is **best-effort** — WebFetch may not render JS-driven layout; describe what was actually inspectable.

## Output

A two-section markdown report:

1. **Diff table** as above, grouped by section (Header, Hero, Grid, Footer, …).
2. **Suggested patches** — for each diff row, the exact Tailwind class change to apply. Do **not** edit files; the parent decides which to apply.
