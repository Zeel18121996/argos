# Skill: Argos Clone – Design Tokens (Pixel-Perfect Reference)

## When to use this skill

Read this before writing ANY TailwindCSS config, styling a component, or matching Argos UI pixel-for-pixel.

---

## Colour Palette

```typescript
// tailwind.config.ts → theme.extend.colors
colors: {
  argos: {
    // Brand
    red:        '#e41b23',   // primary CTA, buttons, logo accent
    'red-dark': '#b51219',   // hover state for red buttons
    'red-light':'#fde8e9',   // red tinted backgrounds (badges)

    // Navigation & UI chrome
    navy:       '#003087',   // "Shop" mega-menu active / promo accents
    blue:       '#0057a8',   // link colour, secondary actions
    'blue-dark':'#00408a',   // link hover
    'blue-light':'#e6f0fb',  // selected filter pill background

    yellow:     '#f5b800',   // sale/offer badge background
    'yellow-text':'#664d00', // text on yellow badges

    green:      '#007a3d',   // in-stock indicator, success states
    'green-light':'#e6f4ed',

    orange:     '#e55c00',   // clearance badge

    // Neutrals
    gray: {
      50:  '#f9f9f9',   // page background
      100: '#f2f2f2',   // card/input background
      200: '#e5e5e5',   // borders, dividers
      300: '#cccccc',   // disabled state borders
      400: '#999999',   // placeholder text, secondary icons
      500: '#767676',   // secondary/meta text (min AA contrast)
      600: '#555555',
      700: '#333333',   // primary body text
      800: '#222222',   // headings
      900: '#111111',
    },

    // Utility
    white:  '#ffffff',
    black:  '#000000',
  },
}
```

### Usage Reference

| Token            | Use                                                        |
| ---------------- | ---------------------------------------------------------- |
| `argos-red`      | "Add to trolley" btn, primary CTA, active nav underline    |
| `argos-navy`     | Mega-menu header bg on hover, promotional banners          |
| `argos-blue`     | Hyperlinks, breadcrumb links, filter pill active bg border |
| `argos-yellow`   | Sale price badge `WAS £X` label, offer callout             |
| `argos-green`    | "In stock" text, delivery confirmation icon                |
| `argos-gray-700` | All body text                                              |
| `argos-gray-200` | Card borders, horizontal dividers, input borders           |
| `argos-gray-50`  | Page body background                                       |

---

## Typography

```typescript
// tailwind.config.ts → theme.extend.fontFamily
fontFamily: {
  sans: ['"Arial"', '"Helvetica Neue"', 'Helvetica', 'sans-serif'],
  // Argos uses system Arial stack — do NOT use Inter or other custom fonts
}

// tailwind.config.ts → theme.extend.fontSize
fontSize: {
  '2xs': ['0.625rem', { lineHeight: '0.875rem' }],  // 10px / 14px
  xs:   ['0.75rem',  { lineHeight: '1rem'    }],    // 12px / 16px
  sm:   ['0.8125rem',{ lineHeight: '1.125rem'}],    // 13px / 18px
  base: ['0.875rem', { lineHeight: '1.25rem' }],    // 14px / 20px
  md:   ['1rem',     { lineHeight: '1.5rem'  }],    // 16px / 24px
  lg:   ['1.125rem', { lineHeight: '1.5rem'  }],    // 18px / 24px
  xl:   ['1.25rem',  { lineHeight: '1.75rem' }],    // 20px / 28px
  '2xl':['1.5rem',   { lineHeight: '2rem'    }],    // 24px / 32px
  '3xl':['1.875rem', { lineHeight: '2.25rem' }],    // 30px / 36px
}
```

### Font Weight Usage

| Weight | Class           | Use                                    |
| ------ | --------------- | -------------------------------------- |
| 400    | `font-normal`   | Body text, descriptions                |
| 600    | `font-semibold` | Product names, prices, button labels   |
| 700    | `font-bold`     | Page headings (h1, h2), section titles |

---

## Spacing Scale (matches Argos 4px base grid)

```typescript
// Use Tailwind's default 4px scale — do NOT override
// Key reference values:
// 1 = 4px,  2 = 8px,  3 = 12px,  4 = 16px,  5 = 20px
// 6 = 24px, 8 = 32px, 10 = 40px, 12 = 48px, 16 = 64px
```

### Common Spacing Patterns

| Element                           | Token            |
| --------------------------------- | ---------------- |
| Page horizontal padding (mobile)  | `px-4` (16px)    |
| Page horizontal padding (desktop) | `px-6` (24px)    |
| Max content width                 | `max-w-[1280px]` |
| Card padding                      | `p-3` (12px)     |
| Card gap in grid                  | `gap-3` (12px)   |
| Section vertical gap              | `py-6` (24px)    |
| Header height (top bar)           | `h-8` (32px)     |
| Header height (main bar)          | `h-[56px]`       |
| Button height (standard)          | `h-10` (40px)    |
| Button height (large)             | `h-12` (48px)    |

---

## Breakpoints

```typescript
// tailwind.config.ts → theme.screens (override defaults)
screens: {
  sm:  '480px',   // large mobile / small tablet
  md:  '768px',   // tablet
  lg:  '1024px',  // desktop
  xl:  '1280px',  // wide desktop (max content width)
  '2xl':'1440px', // ultra-wide (rare, mostly max-width clamp)
}
```

### Grid Columns per Breakpoint

| Context              | Mobile (<480) | sm (480+) | md (768+) | lg (1024+) |
| -------------------- | ------------- | --------- | --------- | ---------- |
| Product grid         | 2 cols        | 2 cols    | 3 cols    | 4 cols     |
| Category quick-links | 3 cols        | 4 cols    | 5 cols    | 7 cols     |
| Homepage carousel    | 1 visible     | 2 visible | 3 visible | 4 visible  |
| Checkout form        | 1 col         | 1 col     | 2 col     | 2 col      |
| Footer links         | 1 col stack   | 2 cols    | 3 cols    | 4 cols     |

---

## Border Radius

```typescript
borderRadius: {
  none: '0',
  sm:   '2px',   // subtle — input focus rings
  DEFAULT:'4px', // cards, buttons, badges
  md:   '6px',   // filter pills, large buttons
  lg:   '8px',   // modals, drawers, large cards
  full: '9999px',// fully-rounded: badges, avatar circles
}
```

---

## Shadows

```typescript
boxShadow: {
  sm:     '0 1px 2px rgba(0,0,0,0.08)',
  DEFAULT:'0 2px 6px rgba(0,0,0,0.1)',
  md:     '0 4px 12px rgba(0,0,0,0.12)',
  lg:     '0 8px 24px rgba(0,0,0,0.14)',
  // Card hover:
  'card-hover': '0 4px 16px rgba(0,0,0,0.16)',
  // Header / sticky bar:
  'header': '0 2px 8px rgba(0,0,0,0.12)',
}
```

---

## Z-Index Scale

```typescript
zIndex: {
  0:    0,
  10:   10,   // standard positioned elements
  20:   20,   // dropdowns, tooltips
  30:   30,   // sticky header
  40:   40,   // mega-menu overlay
  50:   50,   // modal backdrop
  60:   60,   // modal content, drawers
  70:   70,   // toasts / notifications
  9999: 9999, // cookie banner
}
```

---

## Animation / Transitions

```typescript
transitionDuration: { DEFAULT: '150ms', slow: '300ms' }
transitionTimingFunction: { DEFAULT: 'ease-in-out' }

// Standard hover transition on interactive elements:
// className="transition-all duration-150 ease-in-out"

// Mega-menu open/close: slide down 300ms ease
// Drawer open/close: slide in from right 300ms ease
// Skeleton shimmer: 1.5s infinite shimmer animation
// Toast: fade + slide up 200ms, fade out 300ms
```

---

## Icon System

- Use **Lucide React** (`lucide-react`) for all UI icons.
- Argos-specific icons (category thumbnails, payment logos) use SVG assets in `src/assets/icons/`.
- Standard icon sizes: `16px` (inline), `20px` (buttons), `24px` (nav), `32px` (feature icons).
- Payment method icons: exact SVGs for Visa, Mastercard, Amex, Apple Pay, PayPal, Klarna, Argos Gift Card, Nectar, Love2Shop, One4All — stored in `src/assets/payment/`.
- Social icons: YouTube, Facebook, X (Twitter), Pinterest, Instagram — stored in `src/assets/social/`.

---

## Header Exact Measurements

### Top utility bar

- Background: `argos-gray-700` (`#333333`)
- Text colour: `white`, font-size `xs` (12px)
- Height: `32px`
- Links: Track Order | Returns | Stores | Help — separated by `|` divider with `px-3` spacing

### Main header bar

- Background: `white`
- Height: `56px`
- Bottom border: `1px solid argos-gray-200`
- Shadow on scroll: `shadow-header`
- Logo: `h-[28px]` (28px height, width auto)
- Search bar: `rounded-full`, border `1px solid argos-gray-300`, height `40px`, `flex-1 max-w-[600px]`
- Search button (magnifying glass): `bg-argos-red text-white w-10 h-10 rounded-r-full`
- Account icon + "Sign in" text: icon `20px`, text `xs`
- Basket icon + item count badge: count badge `bg-argos-red text-white text-2xs w-4 h-4 rounded-full`

### Nav pills (Shop / Trending / Promotions)

- Font: `sm` (13px) `font-semibold`
- Active underline: `2px solid argos-red`
- Hover: underline appears

---

## Product Card Exact Measurements

```
┌─────────────────────────────┐
│  [Product Image 1:1 ratio]  │  aspect-square, object-contain, bg-white
│                             │
├─────────────────────────────┤ ← 12px gap
│ Product Name (2 lines max)  │  text-sm (13px) font-normal text-argos-gray-700 line-clamp-2
│ ★★★★☆ (4.3) 127 reviews   │  text-2xs text-argos-gray-500
│ £29.99                      │  text-md font-bold text-argos-gray-800
│ was £39.99                  │  text-xs line-through text-argos-gray-500 (if on sale)
├─────────────────────────────┤ ← 8px gap
│  [Add to trolley]           │  bg-argos-red text-white text-sm font-semibold h-10 w-full rounded
└─────────────────────────────┘
Card: p-3 rounded border border-argos-gray-200 bg-white hover:shadow-card-hover transition-shadow
```

---

## Button Variants

```typescript
// Primary (Add to trolley, Buy now)
'bg-argos-red hover:bg-argos-red-dark text-white font-semibold text-sm h-10 px-4 rounded transition-colors'

// Secondary outline
'border-2 border-argos-red text-argos-red hover:bg-argos-red-light font-semibold text-sm h-10 px-4 rounded transition-colors'

// Ghost / text link
'text-argos-blue hover:text-argos-blue-dark hover:underline text-sm'

// Filter pill (inactive)
'border border-argos-gray-300 text-argos-gray-700 text-sm h-9 px-3 rounded-md hover:border-argos-gray-500'

// Filter pill (active)
'border-2 border-argos-blue bg-argos-blue-light text-argos-blue text-sm h-9 px-3 rounded-md font-semibold'
```

---

## Badge Variants

```typescript
// Sale / Offer
'bg-argos-yellow text-argos-yellow-text text-2xs font-bold px-1.5 py-0.5 rounded'

// Clearance
'bg-argos-orange text-white text-2xs font-bold px-1.5 py-0.5 rounded'

// New
'bg-argos-navy text-white text-2xs font-bold px-1.5 py-0.5 rounded'

// In stock (text only)
'text-argos-green text-xs font-semibold'

// Out of stock (text only)
'text-argos-gray-400 text-xs'
```
