import React from 'react'
import { Link } from 'react-router-dom'
import { PATHS } from '@/constants/path'

const SocialBtn: React.FC<{ href: string; label: string; children: React.ReactNode }> = ({
  href,
  label,
  children,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="w-9 h-9 rounded-full border border-argos-border flex items-center justify-center text-argos-gray hover:text-argos-dark hover:border-argos-dark transition-colors"
  >
    {children}
  </a>
)

const FooterCol: React.FC<{ heading: string; links: { label: string; to?: string }[] }> = ({
  heading,
  links,
}) => (
  <div>
    {/* h4: 20px / 700 / normal — matches live Argos footer heading */}
    <h4 className="text-[20px] font-bold text-argos-dark mb-4">{heading}</h4>
    <ul className="flex flex-col gap-2.5">
      {links.map((l) => (
        <li key={l.label}>
          {l.to ? (
            <Link
              to={l.to}
              className="text-[16px] leading-[24px] font-normal text-argos-gray hover:text-argos-dark hover:underline transition-colors"
            >
              {l.label}
            </Link>
          ) : (
            <span className="text-[16px] leading-[24px] font-normal text-argos-gray hover:text-argos-dark hover:underline cursor-pointer transition-colors">
              {l.label}
            </span>
          )}
        </li>
      ))}
    </ul>
  </div>
)

const Footer: React.FC = () => (
  <footer className="bg-argos-footer-bg mt-auto" style={{ borderTop: '1px solid #E0E0E0' }}>
    {/* ── Main 4-column links ── */}
    <div className="argos-container py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <FooterCol
          heading="Need help?"
          links={[
            { label: 'Help & FAQs', to: PATHS.HELP },
            { label: 'Contact us', to: PATHS.HELP },
            { label: 'Store finder', to: PATHS.STORE_FINDER },
            { label: 'Account', to: PATHS.ACCOUNT },
            { label: 'Advice & inspiration' },
          ]}
        />
        <FooterCol
          heading="Delivery & returns"
          links={[
            { label: 'Delivery & collection', to: PATHS.HELP },
            { label: 'Returns', to: PATHS.HELP },
            { label: 'Refunds', to: PATHS.HELP },
            { label: 'Track your order', to: PATHS.TRACK_ORDER },
            { label: 'Argos Plus' },
            { label: 'Argos Care' },
            { label: 'Product Support' },
          ]}
        />
        <FooterCol
          heading="Payment & services"
          links={[
            { label: 'Ways to pay' },
            { label: 'Our Services' },
            { label: 'Gift cards' },
            { label: 'Voucher codes' },
            { label: 'Argos Pay' },
            { label: 'Klarna' },
            { label: 'Nectar at Argos' },
            { label: 'Pet Insurance' },
          ]}
        />
        <FooterCol
          heading="About Argos"
          links={[
            { label: 'About us' },
            { label: 'Argos for Business' },
            { label: 'Careers' },
            { label: 'Press enquiries' },
            { label: 'Sell on Argos' },
            { label: 'Modern Slavery Statement' },
          ]}
        />
      </div>
    </div>

    {/* ── Mid bar: returns note, payment, social, app ── */}
    <div className="border-t border-argos-border">
      <div className="argos-container py-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Returns notice — 16px / 400 */}
          <div className="text-[16px] leading-[24px] text-argos-gray">
            <p className="font-bold text-argos-dark mb-1">Returning an item</p>
            <p>
              For returns, product support and repairs &mdash;{' '}
              <span className="text-argos-blue hover:underline cursor-pointer">Learn more</span>
            </p>
          </div>

          {/* Payment methods */}
          <div>
            <p className="text-[16px] font-bold text-argos-dark mb-2">Payment methods</p>
            <div className="flex flex-wrap items-center gap-2">
              {['VISA', 'Mastercard', 'Amex', 'PayPal', 'Klarna', 'Argos Pay'].map((m) => (
                <span
                  key={m}
                  className="text-[10px] font-bold border border-argos-border rounded px-2 py-1 text-argos-gray bg-white"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <p className="text-[16px] font-bold text-argos-dark mb-2">Follow us</p>
            <div className="flex items-center gap-2">
              <SocialBtn href="https://youtube.com" label="YouTube">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
                </svg>
              </SocialBtn>
              <SocialBtn href="https://facebook.com" label="Facebook">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </SocialBtn>
              <SocialBtn href="https://x.com" label="X">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </SocialBtn>
              <SocialBtn href="https://pinterest.com" label="Pinterest">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                </svg>
              </SocialBtn>
              <SocialBtn href="https://instagram.com" label="Instagram">
                <svg
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </SocialBtn>
            </div>
          </div>

          {/* App download */}
          <div>
            <p className="text-[16px] font-bold text-argos-dark mb-2">Download our app</p>
            <div className="flex flex-col gap-1.5">
              <div className="bg-argos-dark rounded-lg px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity w-fit">
                <span className="text-white text-base leading-none">&#63743;</span>
                <div>
                  <p className="text-[9px] text-gray-300">Download on the</p>
                  <p className="text-[11px] font-bold text-white">App Store</p>
                </div>
              </div>
              <div className="bg-argos-dark rounded-lg px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity w-fit">
                <span className="text-white text-base">▶</span>
                <div>
                  <p className="text-[9px] text-gray-300">Get it on</p>
                  <p className="text-[11px] font-bold text-white">Google Play</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* ── Brand family strip ── */}
    <div className="border-t border-argos-border">
      <div className="argos-container py-3">
        <div className="flex flex-wrap items-center gap-6">
          {['argos', 'sainsbury’s', 'tu', 'habitat', 'nectar'].map((brand) => (
            <span
              key={brand}
              className="text-[16px] font-normal text-argos-gray hover:text-argos-dark cursor-pointer transition-colors capitalize"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </div>

    {/* ── Legal bottom bar ── */}
    <div className="border-t border-argos-border">
      <div className="argos-container py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
          {/* Legal: 15px / 400 / 24px — matches live Argos */}
          <p className="text-[15px] leading-[24px] text-argos-gray">
            &copy; {new Date().getFullYear()} Argos Limited. All Rights Reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {[
              'Accessibility',
              'Privacy hub',
              'Privacy policy',
              'Cookies policy',
              'Terms & conditions',
            ].map((l) => (
              <span
                key={l}
                className="text-[15px] leading-[24px] text-argos-gray hover:text-argos-dark cursor-pointer transition-colors hover:underline"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
        <p className="text-[15px] leading-[24px] text-argos-gray">
          *Argos Pay is provided by NewDay Ltd. Argos Limited is a credit broker and not a lender,
          introducing Argos Pay under an exclusive arrangement with the lender NewDay Ltd.
        </p>
      </div>
    </div>
  </footer>
)

export default Footer
