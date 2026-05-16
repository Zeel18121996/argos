# Skill: Pixel-Perfect Replication Methodology

## When to use this skill

Read this before building any page or component that must match argos.co.uk exactly.

---

## Golden Rules

1. **Design tokens first** — always read `design-tokens.md` before touching a single class. Never hardcode a colour or font size that isn't in the token sheet.
2. **Mobile-first** — build the mobile layout first (`< 480px`), then progressively enhance with `sm:`, `md:`, `lg:` classes.
3. **Inspect before you code** — for any element you're unsure about, cross-reference the live site before writing CSS.
4. **Components over pages** — build the leaf components first (card, button, badge), compose into sections, then compose sections into pages.
5. **Real content** — use realistic product names, realistic prices, and real image aspect ratios during development. Placeholder text breaks layouts.

---

## Workflow for Each Component

```
1. Identify the component on argos.co.uk
2. Note: background, border, padding, font size/weight, colour, hover state, active state
3. Check all 3 breakpoints: mobile, tablet, desktop
4. Read design-tokens.md and map every value to a token
5. Write the Tailwind classes — no magic numbers, use token names
6. Verify against the live site at all 3 breakpoints
7. Handle empty/loading/error states
```

---

## Page-by-Page Pixel-Perfect Checklist

### Header

- [ ] Top utility bar: `#333333` bg, white `12px` text, `32px` tall, right-aligned on desktop
- [ ] Utility bar hidden on mobile (`hidden md:flex`)
- [ ] Main bar: white bg, `56px` tall, sticky on scroll with shadow
- [ ] Logo: SVG, `28px` tall, links to `/`
- [ ] Search bar: full-rounded pill shape, red search button flush to right edge
- [ ] Search bar: full width on mobile (hamburger + search only), collapses label text
- [ ] Nav tabs (Shop/Trending/Promo): visible desktop only, red underline active
- [ ] Account: icon + "Sign in" text; when authenticated shows first name
- [ ] Basket: shopping trolley icon with red bubble count badge top-right
- [ ] Hamburger menu button: visible mobile only

### MegaMenu

- [ ] Opens on click of "Shop" tab (not hover)
- [ ] Full-width overlay, `z-40` above content
- [ ] Two-column layout: left = category list (icons + labels), right = featured/promotions
- [ ] Category icon: `40px × 40px` rounded image
- [ ] Category name: `14px`, truncated to 1 line
- [ ] Closes on: outside click, Escape key, click on another nav tab
- [ ] Animated: slides down `300ms ease`
- [ ] Overlay backdrop: semi-transparent `rgba(0,0,0,0.3)` behind menu

### Footer

- [ ] Top section (dark `#333`): 4-column grid — Returns info | Payment methods | Follow us | Download app
- [ ] Payment logos: exact SVG/PNG per brand, `32px` height, white/colour variants
- [ ] Social icons: `24px`, white, spaced `12px` apart
- [ ] App store badges: Apple + Google Play, `~120px` wide
- [ ] Sister brands bar: `argos | sainsbury's | tu | habitat | nectar` text links on grey bg
- [ ] Legal bar: small `12px` grey text, links to Accessibility/Privacy/Cookies/T&C
- [ ] Copyright: `© Argos Limited {year}. All Rights Reserved.`
- [ ] Argos Pay / Klarna disclaimer: fine print `10px` grey

### Product Card

- [ ] Image: `aspect-square`, `object-contain`, white background
- [ ] Brand name (if applicable): `10px` grey above product name
- [ ] Product name: `13px` regular, `line-clamp-2`, grey-700
- [ ] Rating: filled/empty stars `12px` + review count in grey
- [ ] Price: `16px bold` grey-800
- [ ] Was price (sale): `12px` grey-500 `line-through`, adjacent to current price
- [ ] Offer badge: yellow, top-left of image, absolute positioned
- [ ] "Add to trolley" button: full-width, red, `40px` tall, rounded `4px`
- [ ] Card border: `1px solid #e5e5e5`, no shadow; shadow `0 4px 16px` on hover
- [ ] Padding: `12px` all sides

### Browse / Category Page

- [ ] Breadcrumb: `Home > Dept > Category` — `12px`, blue links, grey current page
- [ ] H1: category name, `24px bold` grey-800
- [ ] Sub-category carousel: horizontal scroll of category pill/image links
- [ ] Filter bar: sticky below header on scroll; `Sort by` select + filter chip buttons
- [ ] Filter chips: "Offers & Clearance", "Brands", "All filters" — outlined buttons with chevron icon
- [ ] Active filter count badge on "All filters": red circle with number
- [ ] Result count: `"89 products"` — `14px` grey-500
- [ ] Product grid: 4 cols desktop, 3 tablet, 2 mobile, `12px` gap
- [ ] Ad/promotional banner: full-width between grid rows (at fixed interval, e.g. row 2 and row 5)
- [ ] Pagination: prev/next arrows + numbered pages; current page bold, no link; rounded pill shape
- [ ] "Related categories" section: horizontal scroll of linked pills below grid
- [ ] "Popular filters" section: linked filter shortcuts below related categories
- [ ] SEO copy section: collapsible "Read more" text block at the bottom

### Product Detail Page

- [ ] Breadcrumb (same as browse)
- [ ] Left column (desktop): image gallery
  - [ ] Main image: large, `aspect-[4/3]` or square depending on product
  - [ ] Thumbnail strip: horizontal, `60px × 60px` per thumb, selected = red border
  - [ ] Click thumbnail → updates main image
  - [ ] Zoom on hover (CSS transform scale or lightbox)
- [ ] Right column (desktop): product info
  - [ ] Brand link (blue)
  - [ ] H1: product name, `20px bold`
  - [ ] SKU: `"Product code: XXXXXXX"` — `12px` grey
  - [ ] Rating stars + `"N reviews"` link (scrolls to reviews)
  - [ ] Price block: current price `28px bold`, was price `16px` line-through
  - [ ] Argos Pay callout: `"Pay £X/month"` link in grey/small text
  - [ ] Variant selector (if applicable): colour swatches or dropdown pills
  - [ ] Quantity: `−` number `+` stepper, `40px` tall
  - [ ] "Add to trolley" button: full-width on mobile, `320px` on desktop, `48px` tall
  - [ ] "Add to wishlist" icon button: heart icon, ghost style
  - [ ] Delivery section: icon + "Delivery available" or "In-store collection" info
- [ ] Below the fold:
  - [ ] Product description accordion
  - [ ] Specifications table (key/value pairs)
  - [ ] Reviews section (rating histogram + individual reviews)
  - [ ] "You may also like" carousel

### Search Results Page

- [ ] Same layout as Browse page
- [ ] H1: `"Results for {query}"` or `"Showing results for {query}"`
- [ ] Sponsored banner at top (full-width promotional link)
- [ ] "Did you mean" suggestion (when applicable)
- [ ] No results state: sympathetic message + suggestions

### Basket / Trolley Page

- [ ] Page title: `"Your trolley (N items)"`
- [ ] Two-column layout: basket items (left, wider) + order summary (right, sticky)
- [ ] Basket item row:
  - [ ] Product image: `80px × 80px`
  - [ ] Product name (link), variant, SKU
  - [ ] Unit price
  - [ ] Quantity stepper `−/+`
  - [ ] Item total
  - [ ] Remove link (grey, small)
  - [ ] "Save for later" / move to wishlist (grey, small)
- [ ] Divider between items: `1px solid #e5e5e5`
- [ ] Promo code input: text field + "Apply" button inline
- [ ] Order summary box: subtotal, delivery, discount, **Total** (bold, larger)
- [ ] "Continue to checkout" button: full-width red, `48px`
- [ ] "Continue shopping" link below
- [ ] "You may also need" carousel below basket

### Checkout (multi-step)

- [ ] Progress indicator: `1. Delivery → 2. Payment → 3. Confirm` breadcrumb steps
- [ ] Step 1 – Delivery:
  - [ ] Delivery address form (first name, last name, line1, line2, city, postcode)
  - [ ] Saved addresses selector for logged-in users
  - [ ] Delivery method selector: Standard / Next Day / Click & Collect
  - [ ] Delivery cost shown per option
- [ ] Step 2 – Payment:
  - [ ] Stripe Elements card input
  - [ ] Payment method tabs: Card | PayPal | Klarna
  - [ ] Order summary sidebar (same as basket page)
  - [ ] "Place order" button
- [ ] Step 3 – Confirmation:
  - [ ] Green tick icon
  - [ ] Order number prominently displayed
  - [ ] Confirmation email sent message
  - [ ] Order summary
  - [ ] "Continue shopping" CTA

### Account Pages

- [ ] Account sidebar nav: Overview | Orders | Wishlist | Personal details | Addresses | Payment methods
- [ ] Orders list: order number, date, status badge (colour coded), total, "View order" link
- [ ] Order detail: timeline of statuses + item list + address + payment summary
- [ ] Wishlist: same product card grid with "Move to trolley" and remove icons

### Order Tracking (Public)

- [ ] Form: order number + postcode fields
- [ ] Result: order status timeline + estimated delivery

### Store Finder

- [ ] Postcode input + "Find stores" button
- [ ] Map (Google Maps or Leaflet) showing nearby stores with pins
- [ ] Store card list: name, address, phone, opening hours, distance
- [ ] Store card: "Get directions" + "Set as my store" links

---

## Responsive Behaviour Reference

### Header collapse (mobile)

- Top bar: hidden
- Nav tabs: hidden
- Search bar: icon-only → expands to full bar on tap
- Logo: centred
- Hamburger: opens mobile slide-in nav drawer

### Mobile nav drawer

- Full-height right-to-left slide-in (shadcn `<Sheet side="left">`)
- Contains: category list (expandable), account link, basket link, help/stores links
- Overlay backdrop closes drawer

### Filter drawer (mobile Browse page)

- Full-height right-side drawer
- Contains all filter groups (accordion)
- "Apply filters" sticky button at bottom of drawer
- Shows active filter count in header

---

## Common Mistakes to Avoid

| Mistake                                    | Correct approach                                  |
| ------------------------------------------ | ------------------------------------------------- |
| Using `Inter` or `Roboto` font             | Use Arial stack (system font)                     |
| Pixel values in style attributes           | Use Tailwind tokens from design-tokens.md         |
| `gap-4` (16px) between cards               | Use `gap-3` (12px)                                |
| `rounded-lg` on cards                      | Use `rounded` (4px) on cards                      |
| Full-width "Add to trolley" on desktop PDP | Max-width `320px` on desktop                      |
| `text-base` (16px) for product names       | `text-sm` (13px)                                  |
| Blue (#0000ee) for links                   | `argos-blue` (#0057a8)                            |
| Spinner for loading states                 | Skeleton (shimmer placeholder)                    |
| `hover:` only                              | Always include `focus-visible:` for keyboard a11y |
