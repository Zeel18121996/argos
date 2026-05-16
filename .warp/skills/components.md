# Skill: Argos Clone – Component Implementation Specs

## When to use this skill

Read this when implementing any shared component. Each section covers props interface, structure, state, and behaviour.
Always read `design-tokens.md` alongside this skill.

---

## Header

**File**: `client/src/components/layout/Header.tsx`

### Sub-components

```
Header/
  Header.tsx              ← orchestrator, sticky wrapper
  TopUtilityBar.tsx       ← "Track Order | Returns | Stores | Help"
  MainHeaderBar.tsx       ← logo + nav + search + account + basket
  SearchBar.tsx           ← controlled search input with autocomplete
  NavTabs.tsx             ← Shop / Trending / Promotions tabs
  AccountMenu.tsx         ← sign in link or user dropdown
  BasketIcon.tsx          ← trolley icon with count badge
  MegaMenu.tsx            ← full-width category dropdown
  MobileNavDrawer.tsx     ← hamburger → slide-in sheet
```

### Behaviour

- Header is `position: sticky; top: 0; z-index: 30`
- On scroll past `56px`: add `shadow-header` class
- `MegaMenu` mounts inside `Header` (portaled to body) so it can overflow content
- Search input: debounced 300ms → calls `GET /api/v1/search/suggestions?q=` → renders `SearchSuggestions` dropdown
- Mobile: hamburger icon (`Menu` from lucide) at left; logo centred; basket icon at right

### Props

```typescript
// Header has no props — reads from Redux (auth.user, basket.itemCount, categories.tree)
```

---

## MegaMenu

**File**: `client/src/components/layout/MegaMenu.tsx`

### Structure

```
MegaMenu (full-width, absolute below header)
├── Backdrop (rgba overlay, onClick closes menu)
└── MenuPanel (white bg, max-w-[1280px] mx-auto)
    ├── CategoryList (left, ~280px wide)
    │   └── CategoryItem × N  (icon + label, hover highlights)
    └── FeaturedPanel (right, fills remaining space)
        └── Changes based on hovered category
```

### Props

```typescript
interface MegaMenuProps {
  isOpen: boolean
  onClose: () => void
  categories: CategoryTree[]
}
```

### State

- `hoveredCategoryId: string | null` — which category's sub-items to show on right panel

### Behaviour

- Keyboard: `Escape` closes; `Tab` navigates through items; `ArrowDown/Up` moves through category list
- Focus trap while open (use `focus-trap-react` or Radix Dialog)
- Category data from Redux `categories.tree` (fetched once on app load)

---

## SearchBar

**File**: `client/src/components/layout/SearchBar.tsx`

### Props

```typescript
interface SearchBarProps {
  className?: string
  autoFocus?: boolean
}
```

### Behaviour

- Controlled input with `useDebounce(value, 300)`
- On debounced change: RTK Query `useGetSearchSuggestionsQuery(query, { skip: query.length < 2 })`
- Suggestions dropdown: max 8 items, shows product name + category
- On select suggestion: navigate to `/search/{suggestion}`
- On submit (Enter / click search btn): navigate to `/search/{encodeURIComponent(query)}`
- Clear button (×) appears when input has value
- `aria-autocomplete="list"`, `aria-controls="search-suggestions"`, `role="combobox"`

### Structure

```tsx
<div className="relative flex items-center flex-1 max-w-[600px]">
  <input role="combobox" ... className="rounded-l-full border h-10 px-4 flex-1" />
  <button type="submit" className="bg-argos-red text-white w-10 h-10 rounded-r-full">
    <Search size={18} />
  </button>
  {/* Suggestions dropdown */}
  {suggestionsOpen && (
    <ul role="listbox" id="search-suggestions" className="absolute top-full left-0 right-0 bg-white shadow-md rounded-b-lg z-20">
      {suggestions.map(s => <SuggestionItem key={s.id} {...s} />)}
    </ul>
  )}
</div>
```

---

## ProductCard

**File**: `client/src/components/product/ProductCard.tsx`

### Props

```typescript
interface ProductCardProps {
  product: ProductSummary // id, name, brand, basePrice, salePrice, avgRating, reviewCount, images, onOffer, slug
  showBadge?: boolean
  onAddToTrolley?: () => void
}
```

### Structure

```tsx
<article className="relative flex flex-col rounded border border-argos-gray-200 bg-white p-3 hover:shadow-card-hover transition-shadow duration-150">
  {/* Offer badge — absolute top-left of image */}
  {product.onOffer && <OfferBadge className="absolute top-2 left-2 z-10" />}

  <Link to={`/product/${product.id}`} className="block">
    <div className="aspect-square overflow-hidden bg-white">
      <img
        src={product.images[0]?.url}
        alt={product.name}
        className="w-full h-full object-contain"
        loading="lazy"
        width={300}
        height={300}
      />
    </div>
    <div className="mt-3 space-y-1">
      {product.brand && <p className="text-2xs text-argos-gray-500">{product.brand}</p>}
      <h3 className="text-sm text-argos-gray-700 line-clamp-2">{product.name}</h3>
      <RatingStars rating={product.avgRating} count={product.reviewCount} />
      <PriceDisplay basePrice={product.basePrice} salePrice={product.salePrice} />
    </div>
  </Link>

  <AddToTrolleyButton productId={product.id} className="mt-2 w-full" />
</article>
```

---

## RatingStars

**File**: `client/src/components/product/RatingStars.tsx`

### Props

```typescript
interface RatingStarsProps {
  rating: number // 0–5, one decimal
  count: number // number of reviews
  size?: 'sm' | 'md'
}
```

### Structure

- 5 star icons (Star from lucide), filled/half/empty based on rating
- `aria-label="Rated {rating} out of 5, {count} reviews"`
- Count as small grey text: `(127)` — click scrolls to `#reviews` anchor

---

## PriceDisplay

**File**: `client/src/components/product/PriceDisplay.tsx`

### Props

```typescript
interface PriceDisplayProps {
  basePrice: number // pence
  salePrice?: number | null // pence
  size?: 'sm' | 'lg' // sm = card, lg = PDP
}
```

### Structure

```tsx
// On sale:
<div className="flex items-baseline gap-2">
  <span className="text-md font-bold text-argos-gray-800">{formatPrice(salePrice)}</span>
  <span className="text-xs text-argos-gray-500 line-through">was {formatPrice(basePrice)}</span>
</div>

// Regular:
<span className="text-md font-bold text-argos-gray-800">{formatPrice(basePrice)}</span>
```

---

## ProductGrid

**File**: `client/src/components/product/ProductGrid.tsx`

### Props

```typescript
interface ProductGridProps {
  products: ProductSummary[]
  isLoading?: boolean
  skeletonCount?: number // default 12
}
```

### Structure

```tsx
<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
  {isLoading
    ? Array.from({ length: skeletonCount }).map((_, i) => <ProductCardSkeleton key={i} />)
    : products.map((p) => <ProductCard key={p.id} product={p} />)}
</div>
```

---

## FilterBar

**File**: `client/src/features/browse/FilterBar.tsx`

### Props

```typescript
interface FilterBarProps {
  totalResults: number
  activeFilters: ActiveFilters
  onSortChange: (sort: SortBy) => void
  onFilterOpen: () => void // opens FilterDrawer
  onOfferToggle: () => void
  activeFilterCount: number
}
```

### Structure

```tsx
<div className="sticky top-[88px] z-20 bg-white border-b border-argos-gray-200 py-2">
  <div className="flex items-center gap-2 max-w-[1280px] mx-auto px-4">
    {/* Sort */}
    <div className="flex items-center gap-1.5 mr-2">
      <label className="text-sm text-argos-gray-500 whitespace-nowrap">Sort by</label>
      <SortSelect value={activeFilters.sortBy} onChange={onSortChange} />
    </div>

    {/* Filter chips */}
    <FilterChip label="Offers & Clearance" active={activeFilters.onOffer} onClick={onOfferToggle} />
    <FilterChip label="Brands" active={!!activeFilters.brands?.length} onClick={onFilterOpen} />
    <FilterChip
      label="All filters"
      active={activeFilterCount > 0}
      badge={activeFilterCount > 0 ? activeFilterCount : undefined}
      onClick={onFilterOpen}
    />

    {/* Result count (pushed to right) */}
    <span className="ml-auto text-sm text-argos-gray-500">{totalResults} products</span>
  </div>
</div>
```

---

## Breadcrumb

**File**: `client/src/components/common/Breadcrumb.tsx`

### Props

```typescript
interface BreadcrumbItem {
  label: string
  href?: string
}
interface BreadcrumbProps {
  items: BreadcrumbItem[]
}
```

### Structure

```tsx
<nav aria-label="Breadcrumb">
  <ol className="flex flex-wrap items-center gap-1 text-xs text-argos-gray-500">
    {items.map((item, i) => (
      <li key={i} className="flex items-center gap-1">
        {i > 0 && <ChevronRight size={12} className="text-argos-gray-300" />}
        {item.href ? (
          <Link to={item.href} className="text-argos-blue hover:underline">
            {item.label}
          </Link>
        ) : (
          <span className="text-argos-gray-700 font-semibold">{item.name}</span>
        )}
      </li>
    ))}
  </ol>
</nav>
```

---

## Pagination

**File**: `client/src/components/common/Pagination.tsx`

### Props

```typescript
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}
```

### Behaviour

- Shows up to 7 page buttons with ellipsis (`…`) for large page counts
- Always shows first + last + current ± 2 pages
- Prev/Next arrows (disabled at boundaries)
- Current page: bold, no link, `aria-current="page"`

---

## BasketDrawer

**File**: `client/src/features/basket/BasketDrawer.tsx`

### Behaviour

- Triggered by: clicking basket icon in header (if has items) OR "Add to trolley" animation
- Implemented as shadcn `<Sheet side="right">`, width `min(400px, 100vw)`
- Content: header "Your trolley (N)", item list, subtotal, "View trolley" + "Checkout" buttons
- On mobile: full-screen sheet

---

## AddToTrolleyButton

**File**: `client/src/features/basket/AddToTrolleyButton.tsx`

### Props

```typescript
interface AddToTrolleyButtonProps {
  productId: string
  variantId?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}
```

### Behaviour

1. Click → calls `POST /api/v1/basket/items`
2. Loading: button shows spinner, text stays "Add to trolley" (no layout shift)
3. Success: button briefly shows "Added ✓" (green text, 1.5s), then reverts; `BasketDrawer` opens
4. Error: toast notification "Could not add item, please try again"
5. If item already in basket: button shows "Added to trolley" with a "View trolley" link

---

## Carousel

**File**: `client/src/components/common/Carousel.tsx`

### Props

```typescript
interface CarouselProps {
  title?: string
  viewAllHref?: string
  children: React.ReactNode
  itemMinWidth?: number // default 200
}
```

### Behaviour

- CSS scroll snap (`scroll-snap-type: x mandatory`)
- Prev/Next arrow buttons (hidden when at start/end)
- Touch/swipe support (native scroll)
- `gap-3` between items
- Scrollbar hidden: `scrollbar-hide` utility

---

## ImageGallery (PDP)

**File**: `client/src/features/product/ImageGallery.tsx`

### Props

```typescript
interface ImageGalleryProps {
  images: ProductImage[] // { id, url, altText }
}
```

### Behaviour

- `selectedIndex` state (default 0)
- Main image: `aspect-square` or `aspect-[4/3]`, `object-contain`, click to open lightbox
- Thumbnails: `60×60`, horizontal scroll, click sets `selectedIndex`, active = `border-2 border-argos-red`
- Lightbox: full-screen overlay (Radix Dialog), full-res image, prev/next navigation, close button
- Keyboard: ← → arrows navigate images, Escape closes lightbox

---

## OrderSummaryBox

**File**: `client/src/features/checkout/OrderSummaryBox.tsx`  
Used on both Basket page and Checkout page (sticky on desktop).

### Props

```typescript
interface OrderSummaryBoxProps {
  subtotal: number
  deliveryCost: number
  discountAmount: number
  total: number
  itemCount: number
  promoCode?: string
  showCheckoutButton?: boolean // true on basket page
  showPlaceOrderButton?: boolean // true on payment step
  isProcessing?: boolean
}
```

### Structure

```tsx
<div className="rounded border border-argos-gray-200 bg-white p-4 space-y-3">
  <h2 className="text-lg font-bold">Order summary</h2>
  <SummaryRow label={`Subtotal (${itemCount} items)`} value={subtotal} />
  <SummaryRow label="Delivery" value={deliveryCost} free={deliveryCost === 0} />
  {discountAmount > 0 && <SummaryRow label="Discount" value={-discountAmount} highlight />}
  <Divider />
  <SummaryRow label="Total" value={total} bold large />
  {showCheckoutButton && (
    <Button variant="primary" size="lg" className="w-full mt-2" asChild>
      <Link to="/checkout">Continue to checkout</Link>
    </Button>
  )}
</div>
```

---

## CheckoutStepper

**File**: `client/src/features/checkout/CheckoutStepper.tsx`

### Props

```typescript
type CheckoutStep = 'delivery' | 'payment' | 'confirmation'
interface CheckoutStepperProps {
  currentStep: CheckoutStep
}
```

### Structure

```tsx
// Visual: 1. Delivery  →  2. Payment  →  3. Confirm
// Completed steps: filled circle + line, active: filled, future: outline
<ol className="flex items-center">
  {steps.map((step, i) => (
    <>
      <StepCircle step={i + 1} status={getStatus(step, currentStep)} label={step.label} />
      {i < steps.length - 1 && <StepConnector completed={isCompleted(step, currentStep)} />}
    </>
  ))}
</ol>
```

---

## Toast / Notification

**File**: `client/src/components/common/Toast.tsx`  
Use `sonner` library (`npm install sonner`) — matches Argos's minimal toast style.

```typescript
// Usage anywhere in app:
import { toast } from 'sonner'
toast.success('Item added to your trolley')
toast.error('Could not add item. Please try again.')
```

Configure in `App.tsx`:

```tsx
<Toaster position="top-right" richColors closeButton duration={3000} />
```

---

## ProtectedRoute

**File**: `client/src/components/common/ProtectedRoute.tsx`

```typescript
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
```

After login, redirect back to `location.state.from`.

---

## LoadingSkeleton Variants

**File**: `client/src/components/common/skeletons/`

```typescript
// Shimmer base animation — add to tailwind.config.ts
keyframes: {
  shimmer: {
    '0%':   { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0'  },
  },
},
animation: {
  shimmer: 'shimmer 1.5s infinite linear',
},

// Base skeleton class:
// "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded"
```

Skeleton variants to create:

- `ProductCardSkeleton` — matches ProductCard layout
- `PageSkeleton` — full page placeholder
- `ProductDetailSkeleton` — two-column PDP layout
- `OrderRowSkeleton` — single order list row
- `CategoryItemSkeleton` — breadcrumb + title

---

## Footer

**File**: `client/src/components/layout/Footer.tsx`

### Sub-components

```
Footer/
  Footer.tsx
  FooterTopSection.tsx   ← dark bg, 4-col grid
  FooterBrandsBar.tsx    ← argos | sainsbury's | tu | habitat | nectar
  FooterLegalBar.tsx     ← links + copyright + fine print
```

### Payment logos order (left to right)

Visa, Mastercard, Amex, Apple Pay, PayPal, Klarna, Love2Shop, Argos Gift Card, One4All, Nectar

### Sister brands bar

- Light grey background `#f5f5f5`
- Links styled as plain grey text `14px`, `|` separator
- "argos" link is the current site (no navigation)

### Legal fine print includes

- Argos Pay (NewDay Ltd) disclaimer
- PayPal Pay in 3 disclaimer
- Klarna disclaimer
- Argos Care (Domestic & General) disclaimer
