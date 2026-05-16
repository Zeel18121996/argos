import { Link } from 'react-router-dom'
import { Youtube, Facebook, Instagram, Twitter } from 'lucide-react'

// ── Payment method cards ───────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  'Visa',
  'Mastercard',
  'Amex',
  'Apple Pay',
  'PayPal',
  'Klarna',
  'Argos Gift Card',
  'Nectar',
]

function PaymentBadge({ label }: { label: string }) {
  return (
    <div
      className="inline-flex items-center justify-center h-8 px-2 bg-white rounded border border-argos-gray-600 text-2xs font-semibold text-argos-gray-700 whitespace-nowrap"
      aria-label={`${label} accepted`}
    >
      {label}
    </div>
  )
}

// ── Social links ──────────────────────────────────────────────────────────────
function SocialLinks() {
  const links = [
    { icon: Youtube, label: 'Argos on YouTube', href: 'https://www.youtube.com/user/argoscouk' },
    { icon: Facebook, label: 'Argos on Facebook', href: 'https://www.facebook.com/argos' },
    { icon: Twitter, label: 'Argos on X', href: 'https://x.com/Argos_online' },
    {
      icon: Twitter,
      label: 'Argos on Pinterest',
      href: 'https://www.pinterest.co.uk/argosonline/',
    },
    { icon: Instagram, label: 'Argos on Instagram', href: 'https://www.instagram.com/argos/' },
  ]
  return (
    <div className="flex items-center gap-3">
      {links.map(({ icon: Icon, label, href }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="text-argos-gray-400 hover:text-white transition-colors"
        >
          <Icon size={22} />
        </a>
      ))}
    </div>
  )
}

// ── App store badges ──────────────────────────────────────────────────────────
function AppBadges() {
  return (
    <div className="flex flex-col gap-2 mt-2">
      <a
        href="https://apps.apple.com/gb/app/argos/id370371087"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-lg w-fit hover:bg-argos-gray-800 transition-colors"
        aria-label="Download the Argos app from the App Store"
      >
        <span className="text-base leading-none">&#63743;</span>
        App Store
      </a>
      <a
        href="https://play.google.com/store/apps/details?id=com.homeretailgroup.argos.android"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-lg w-fit hover:bg-argos-gray-800 transition-colors"
        aria-label="Download the Argos app from Google Play"
      >
        <span className="text-base leading-none">▶</span>
        Google Play
      </a>
    </div>
  )
}

// ── Section 1: Dark top ───────────────────────────────────────────────────────
function FooterTopSection() {
  return (
    <div className="bg-argos-gray-700 text-white">
      <div className="page-container py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Returns */}
        <div>
          <p className="text-sm font-bold mb-2">Returning an item</p>
          <p className="text-xs text-argos-gray-400 leading-relaxed">
            For returns, product support and repairs.{' '}
            <Link
              to="/help/returns-and-refunds"
              className="underline text-argos-gray-300 hover:text-white"
            >
              Learn more
            </Link>
          </p>
        </div>

        {/* Payment methods */}
        <div>
          <p className="text-sm font-bold mb-2">Payment methods</p>
          <div className="flex flex-wrap gap-1.5">
            {PAYMENT_METHODS.map((m) => (
              <PaymentBadge key={m} label={m} />
            ))}
          </div>
        </div>

        {/* Social */}
        <div>
          <p className="text-sm font-bold mb-2">Follow us</p>
          <SocialLinks />
        </div>

        {/* App download */}
        <div>
          <p className="text-sm font-bold mb-2">Download our app</p>
          <AppBadges />
        </div>
      </div>
    </div>
  )
}

// ── Section 2: Sister brands bar ──────────────────────────────────────────────
function FooterBrandsBar() {
  const brands = [
    { label: 'argos', href: 'https://www.argos.co.uk', current: true },
    { label: "sainsbury's", href: 'https://www.sainsburys.co.uk/shop/gb/groceries' },
    { label: 'tu', href: 'https://tuclothing.sainsburys.co.uk/' },
    { label: 'habitat', href: 'https://www.habitat.co.uk/' },
    { label: 'nectar', href: 'https://www.nectar.com' },
  ]

  return (
    <div className="bg-argos-gray-100 border-y border-argos-gray-200">
      <div className="page-container py-3 flex flex-wrap items-center gap-1">
        {brands.map((b, i, arr) => (
          <span key={b.label} className="flex items-center gap-1">
            {b.current ? (
              <span className="text-sm text-argos-gray-500 font-medium">{b.label}</span>
            ) : (
              <a
                href={b.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-argos-gray-600 hover:text-argos-blue hover:underline"
              >
                {b.label}
              </a>
            )}
            {i < arr.length - 1 && <span className="text-argos-gray-300 select-none mx-1">|</span>}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Section 3: Legal bar ──────────────────────────────────────────────────────
function FooterLegalBar() {
  const year = new Date().getFullYear()

  return (
    <div className="bg-argos-gray-100">
      <div className="page-container py-4 space-y-3">
        {/* Legal links */}
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {[
            { label: 'Accessibility', href: '/help/accessibility-statement' },
            { label: 'Privacy hub', href: 'https://privacy-hub.sainsburys.co.uk' },
            {
              label: 'Privacy policy',
              href: 'https://privacy-hub.sainsburys.co.uk/privacy-policy/',
            },
            {
              label: 'Cookies policy',
              href: 'https://privacy-hub.sainsburys.co.uk/cookie-policy/',
            },
            { label: 'Terms & conditions', href: '/help/terms-and-conditions' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-2xs text-argos-gray-600 hover:underline"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-2xs text-argos-gray-500">© Argos Limited {year}. All Rights Reserved.</p>

        {/* Fine print */}
        <div className="space-y-1.5 text-2xs text-argos-gray-500 leading-relaxed border-t border-argos-gray-200 pt-3">
          <p>
            <strong>*Argos Pay</strong> is provided by NewDay Ltd. UK residents aged 18 and over.
            Subject to status. Terms apply.{' '}
            <strong>Argos Limited is a credit broker and not a lender</strong>, introducing Argos
            Pay under an exclusive arrangement with the lender NewDay Ltd.
          </p>
          <p>
            <strong>PayPal Pay in 3</strong> is an unregulated credit agreement. Borrowing more than
            you can afford or paying late may negatively impact your financial status. 18+, UK
            residents only. Subject to status.
          </p>
          <p>
            <strong>Klarna&apos;s Pay in 3</strong> / Pay in 30 days are unregulated credit
            agreements. 18+, UK residents only. Subject to status. Ts&amp;Cs and late fees apply.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main Footer ───────────────────────────────────────────────────────────────
export function Footer() {
  return (
    <footer>
      <FooterTopSection />
      <FooterBrandsBar />
      <FooterLegalBar />
    </footer>
  )
}
