import { Link } from 'react-router-dom'

// ── Types ─────────────────────────────────────────────────────────────────────
interface FooterLink {
  label: string
  href: string
  external?: boolean
}

interface FooterColumn {
  heading: string
  links: FooterLink[]
  subHeading?: string
  subLinks?: FooterLink[]
}

// ── Data ──────────────────────────────────────────────────────────────────────
const LINK_COLUMNS: FooterColumn[] = [
  {
    heading: 'Need help?',
    links: [
      { label: 'Help & FAQs', href: '/help' },
      { label: 'Contact us', href: '/help/contact-us' },
      { label: 'Store finder', href: '/stores' },
      { label: 'Account', href: '/account' },
      { label: 'Advice & inspiration', href: '/features/advice-and-inspiration' },
    ],
  },
  {
    heading: 'Delivery & returns',
    links: [
      { label: 'Delivery & collection', href: '/help/delivery-and-collection' },
      { label: 'Returns', href: '/order/tracking?type=returns' },
      { label: 'Refunds', href: '/help/returns-and-refunds' },
      { label: 'Track your order', href: '/order/tracking' },
      { label: 'Argos Plus', href: '/features/argos-plus' },
    ],
    subHeading: 'Product care',
    subLinks: [
      { label: 'Argos Care', href: '/help/argos-care' },
      { label: 'Product Support', href: 'https://www.argos-support.co.uk/', external: true },
      { label: 'Product recall', href: '/events/safety-product-recalls' },
      { label: 'Argos Spares', href: 'http://www.argosspares.co.uk/', external: true },
    ],
  },
  {
    heading: 'Payment & services',
    links: [
      { label: 'Ways to pay', href: 'https://help.argos.co.uk/help/your-ways-to-pay', external: true },
      { label: 'Our Services', href: '/features/our-services' },
      { label: 'Gift cards', href: '/help/gift-cards' },
      { label: 'Voucher codes', href: '/events/voucher-discount-codes' },
      { label: 'eGift Card Rewards', href: '/features/egift-card-rewards' },
      { label: 'Argos Pay', href: 'https://help.argos.co.uk/help/argos-pay', external: true },
      { label: 'Klarna', href: 'https://help.argos.co.uk/help/argos-klarna', external: true },
      { label: 'Nectar at Argos', href: '/help/nectar' },
      { label: 'Pet Insurance', href: 'https://www.argospetinsurance.co.uk/', external: true },
      { label: 'Furniture Recycling', href: 'https://help.argos.co.uk/help/products-and-services/clearabee-information-page/clearabeeinfopage', external: true },
    ],
  },
  {
    heading: 'About Argos',
    links: [
      { label: 'About us', href: 'https://corporate.sainsburys.co.uk/about-us/our-brands/', external: true },
      { label: 'Argos for Business', href: 'https://www.sainsburysforbusiness.co.uk', external: true },
      { label: 'Careers', href: 'https://sainsburys.jobs', external: true },
      { label: 'Press enquiries', href: 'https://corporate.sainsburys.co.uk/contact-us/', external: true },
      { label: 'Modern Slavery Statement', href: 'https://corporate.sainsburys.co.uk/sustainability/explore-by-a-z/people-in-our-supply-chain/standing-up-to-modern-slavery/', external: true },
      { label: 'Sell on Argos', href: '/features/sell-on-argos' },
    ],
  },
]

const PAYMENT_METHODS = [
  { alt: 'Visa card', src: 'https://media.4rgos.it/i/Argos/footer-visa?w=44&h=30&qlt=75' },
  { alt: 'Master card', src: 'https://media.4rgos.it/i/Argos/footer-mastercard?w=44&h=30&qlt=75' },
  { alt: 'American Express card', src: 'https://media.4rgos.it/i/Argos/footer-american-express?w=44&h=30&qlt=75' },
  { alt: 'Apple Pay', src: 'https://media.4rgos.it/i/Argos/footer-apple-pay?w=44&h=30&qlt=75' },
  { alt: 'PayPal', src: 'https://media.4rgos.it/i/Argos/footer-paypal?w=44&h=30&qlt=75' },
  { alt: 'Klarna', src: 'https://media.4rgos.it/i/Argos/footer-klarna?w=44&h=30&qlt=75' },
  { alt: 'Love 2 Shop Card', src: 'https://media.4rgos.it/i/Argos/Love2Shop?w=44&h=30&qlt=75' },
  { alt: 'Argos Gift Card', src: 'https://media.4rgos.it/i/Argos/ArgosGiftCard?w=44&h=30&qlt=75' },
  { alt: 'One4All Card', src: 'https://media.4rgos.it/i/Argos/One4All?w=44&h=30&qlt=75' },
  { alt: 'Nectar Card', src: 'https://media.4rgos.it/i/Argos/Nectar?w=44&h=30&qlt=75' },
]

const BRANDS = [
  { label: 'argos', href: '//www.argos.co.uk', src: 'https://documents.4rgos.it/v1/static/argos-logo?qlt=75&fmt.jpeg.interlaced=true', h: 32 },
  { label: 'sainsburys', href: '//www.sainsburys.co.uk/shop/gb/groceries', src: 'https://documents.4rgos.it/v1/static/sainsburys-logo?qlt=75&fmt.jpeg.interlaced=true', h: 24 },
  { label: 'tu', href: '//tuclothing.sainsburys.co.uk/', src: 'https://documents.4rgos.it/v1/static/tu-logo?qlt=75&fmt.jpeg.interlaced=true', h: 32 },
  { label: 'habitat', href: '//www.habitat.co.uk/', src: 'https://documents.4rgos.it/v1/static/habitat-logo?qlt=75&fmt.jpeg.interlaced=true', h: 24 },
  { label: 'nectar', href: '//www.nectar.com', src: 'https://documents.4rgos.it/v1/static/nectar-logo?qlt=75&fmt.jpeg.interlaced=true', h: 32 },
]

const LEGAL_LINKS = [
  { label: 'Accessibility', href: '/help/accessibility-statement' },
  { label: 'Privacy hub', href: 'https://privacy-hub.sainsburys.co.uk', external: true },
  { label: 'Privacy policy', href: 'https://privacy-hub.sainsburys.co.uk/privacy-policy/', external: true },
  { label: 'Cookies policy', href: 'https://privacy-hub.sainsburys.co.uk/cookie-policy/', external: true },
  { label: 'Terms & conditions', href: '/help/terms-and-conditions' },
]

// ── Sub-components ────────────────────────────────────────────────────────────
function FooterNavLink({ link }: { link: FooterLink }) {
  const cls = 'text-sm text-argos-gray-600 hover:text-argos-gray-900 hover:underline transition-colors leading-6'
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>
        {link.label}
      </a>
    )
  }
  return (
    <Link to={link.href} className={cls}>
      {link.label}
    </Link>
  )
}

function FooterColumn({ col }: { col: FooterColumn }) {
  return (
    <div>
      <h4 className="text-base font-bold text-argos-gray-800 mb-4">{col.heading}</h4>
      <ul className="space-y-1.5">
        {col.links.map((l) => (
          <li key={l.label}>
            <FooterNavLink link={l} />
          </li>
        ))}
      </ul>
      {col.subHeading && col.subLinks && (
        <>
          <h4 className="text-base font-bold text-argos-gray-800 mt-6 mb-4">{col.subHeading}</h4>
          <ul className="space-y-1.5">
            {col.subLinks.map((l) => (
              <li key={l.label}>
                <FooterNavLink link={l} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

// ── Section 1: Nav link columns ───────────────────────────────────────────────
function FooterNavColumns() {
  return (
    <div className="bg-argos-footer-bg border-t border-argos-gray-200">
      <div className="page-container py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {LINK_COLUMNS.map((col) => (
            <FooterColumn key={col.heading} col={col} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Section 2: Returns / Payment / Social / App ───────────────────────────────
function FooterMidBar() {
  return (
    <div className="bg-argos-footer-bg border-t border-argos-gray-200">
      <div className="page-container py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Returning an item */}
          <div>
            <p className="text-sm font-bold text-argos-gray-800 mb-2">Returning an item</p>
            <p className="text-sm text-argos-gray-600 leading-relaxed">
              For returns, product support and repairs{' '}
              <Link to="/help/returns-and-refunds" className="underline hover:text-argos-gray-900">
                Learn more here
              </Link>
            </p>
          </div>

          {/* Payment methods */}
          <div>
            <p className="text-sm font-bold text-argos-gray-800 mb-3">Payment methods</p>
            <div className="flex flex-wrap gap-1.5">
              {PAYMENT_METHODS.map((m) => (
                <img
                  key={m.alt}
                  src={m.src}
                  alt={m.alt}
                  width={44}
                  height={30}
                  className="rounded border border-argos-gray-200 object-contain bg-white"
                />
              ))}
            </div>
          </div>

          {/* Follow us */}
          <div>
            <p className="text-sm font-bold text-argos-gray-800 mb-3">Follow us</p>
            <div className="flex items-center gap-2">
              <a href="https://www.youtube.com/user/argoscouk" target="_blank" rel="noopener noreferrer" aria-label="Argos YouTube channel" className="w-11 h-11 flex items-center justify-center rounded-full bg-argos-gray-900 text-white hover:bg-argos-gray-700 transition-colors">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
                </svg>
              </a>
              <a href="https://www.facebook.com/argos" target="_blank" rel="noopener noreferrer" aria-label="Argos Facebook page" className="w-11 h-11 flex items-center justify-center rounded-full bg-argos-gray-900 text-white hover:bg-argos-gray-700 transition-colors">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="https://x.com/Argos_online" target="_blank" rel="noopener noreferrer" aria-label="Argos X social network" className="w-11 h-11 flex items-center justify-center rounded-full bg-argos-gray-900 text-white hover:bg-argos-gray-700 transition-colors">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://www.pinterest.co.uk/argosonline/" target="_blank" rel="noopener noreferrer" aria-label="Argos Pinterest" className="w-11 h-11 flex items-center justify-center rounded-full bg-argos-gray-900 text-white hover:bg-argos-gray-700 transition-colors">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/argos/" target="_blank" rel="noopener noreferrer" aria-label="Argos Instagram" className="w-11 h-11 flex items-center justify-center rounded-full bg-argos-gray-900 text-white hover:bg-argos-gray-700 transition-colors">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Download our app */}
          <div>
            <p className="text-sm font-bold text-argos-gray-800 mb-3">Download our app</p>
            <div className="flex gap-2">
              <a
                href="https://apps.apple.com/gb/app/argos/id370371087"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download the Argos app from the Apple Store"
                className="hover:opacity-80 transition-opacity w-fit"
              >
                <img
                  src="https://media.4rgos.it/i/Argos/app-apple-prompt?w=140&h=47&qlt=75"
                  alt="Apple Store"
                  width={140}
                  height={47}
                />
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.homeretailgroup.argos.android&hl=en"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download the Argos app from the Google Play Store"
                className="hover:opacity-80 transition-opacity w-fit"
              >
                <img
                  src="https://media.4rgos.it/i/Argos/app-google-prompt?w=140&h=47&qlt=75"
                  alt="Google Play Store"
                  width={140}
                  height={47}
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Section 3: Brand logos bar ────────────────────────────────────────────────
function FooterBrandsBar() {
  return (
    <div className="bg-white border-t border-argos-gray-200">
      <div className="page-container py-5">
        <div className="flex flex-wrap items-center justify-center gap-8">
          {BRANDS.map((b) => (
            <a
              key={b.label}
              href={b.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={b.label}
              className="hover:opacity-70 transition-opacity"
            >
              <img
                src={b.src}
                alt={b.label}
                height={b.h}
                style={{ height: b.h, width: 'auto' }}
                className="object-contain"
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Section 4: Legal bar ──────────────────────────────────────────────────────
function FooterLegalBar() {
  const year = new Date().getFullYear()

  return (
    <div className="bg-argos-footer-bg border-t border-argos-gray-200">
      <div className="page-container py-5 space-y-3 text-center">
        {/* Legal links row — centred with pipe separators */}
        <nav aria-label="Legal links" className="flex flex-wrap justify-center items-center">
          {LEGAL_LINKS.map((item, i) => (
            <span key={item.label} className="flex items-center">
              {i > 0 && <span className="text-argos-gray-300 select-none mx-1" aria-hidden>|</span>}
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-argos-gray-600 hover:text-argos-gray-900 hover:underline transition-colors px-1"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  to={item.href}
                  className="text-sm text-argos-gray-600 hover:text-argos-gray-900 hover:underline transition-colors px-1"
                >
                  {item.label}
                </Link>
              )}
            </span>
          ))}
          <span className="flex items-center">
            <span className="text-argos-gray-300 select-none mx-1" aria-hidden>|</span>
            <button
              type="button"
              className="text-sm text-argos-gray-600 hover:text-argos-gray-900 hover:underline transition-colors cursor-pointer px-1"
            >
              Cookie preferences
            </button>
          </span>
        </nav>

        {/* Copyright */}
        <p className="text-sm text-argos-gray-600">© Argos Limited {year}. All Rights Reserved.</p>

        {/* Fine print */}
        <div className="space-y-2 text-xs text-argos-gray-500 leading-relaxed border-t border-argos-gray-200 pt-4">
          <p>
            <strong className="text-argos-gray-700">*Argos Pay</strong> is provided by NewDay Ltd.
            UK residents aged 18 and over. Subject to status. Terms apply.{' '}
            <strong className="text-argos-gray-700">
              Argos Limited is a credit broker and not a lender, introducing Argos Pay under an
              exclusive arrangement with the lender NewDay Ltd.
            </strong>
          </p>
          <p>
            Argos Limited is authorised and regulated by the Financial Conduct Authority (firm
            reference number: 713206), registered office: 33 Charterhouse Street, London, EC1M 6HA.
            NewDay Ltd is authorised and regulated by the Financial Conduct Authority (firm reference
            number: 690292).
          </p>
          <p>
            <strong className="text-argos-gray-700">PayPal Pay in 3</strong> is the trading name of
            PayPal UK LTD, 5 Fleet Place, London, United Kingdom, EC4M 7RD. Terms and conditions
            apply. Credit subject to status, UK residents only. Argos Limited acts as a broker and
            offers finance from a restricted range of finance providers. PayPal Pay in 3 is not
            regulated by the Financial Conduct Authority. Pay in 3 eligibility is subject to status
            and approval. 18+ UK residents only.
          </p>
          <p>
            <strong className="text-argos-gray-700">Klarna&apos;s Pay in 3</strong> / Pay in 30 days
            are unregulated credit agreements. Borrowing more than you can afford or paying late may
            negatively impact your financial status and ability to obtain credit. 18+, UK residents
            only. Subject to status. Ts&amp;Cs and late fees apply.
          </p>
          <p>
            <strong className="text-argos-gray-700">Argos Care</strong> policies are provided by
            Domestic &amp; General Insurance PLC, who are an insurer not an intermediary. They have
            not given you a personal recommendation as to whether this policy is suitable for your
            needs.
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
      <FooterNavColumns />
      <FooterMidBar />
      <FooterBrandsBar />
      <FooterLegalBar />
    </footer>
  )
}
