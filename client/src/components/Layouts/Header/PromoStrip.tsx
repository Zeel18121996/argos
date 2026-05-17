import React from 'react'
import { Tag, Truck, CreditCard } from 'lucide-react'

const PROMOS = [
  { icon: CreditCard, text: 'Argos Pay — 0% interest available on 100s of products' },
  { icon: Tag, text: 'Shop our latest offers — save up to 50%' },
  { icon: Truck, text: 'Argos Plus — unlimited delivery for a whole year from ₹999' },
]

const PromoStrip: React.FC = () => (
  <div
    className="bg-white border-b border-argos-border overflow-hidden"
    style={{ height: 36 }}
    aria-label="Promotional offers"
  >
    {/* Triplicated so the loop is seamless */}
    <div className="argos-ticker-inner h-full">
      {[...PROMOS, ...PROMOS, ...PROMOS].map((p, i) => {
        const Icon = p.icon
        return (
          <div
            key={i}
            className="flex items-center justify-center gap-2 px-8 h-full"
            style={{ width: `${100 / 9}%` }}
          >
            <Icon size={16} className="text-argos-green flex-shrink-0" />
            <span className="text-[16px] leading-[24px] font-normal text-argos-dark whitespace-nowrap">
              {p.text}
            </span>
          </div>
        )
      })}
    </div>
  </div>
)

export default PromoStrip
