/**
 * "Part of the family" — thin horizontal line with the text centered on top,
 * followed by Argos / Tu / habitat brand wordmarks. Shared across auth pages.
 */
export function FamilyDivider() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full flex items-center" aria-hidden="true">
        <span className="flex-1 h-px bg-argos-gray-light" />
        <span className="px-3 text-xs text-argos-gray font-normal whitespace-nowrap">
          Part of the family
        </span>
        <span className="flex-1 h-px bg-argos-gray-light" />
      </div>
      <div
        className="flex items-center justify-center gap-8"
        aria-label="Part of the Sainsbury's family: Argos, Tu, habitat"
      >
        <BrandArgos />
        <BrandTu />
        <BrandHabitat />
      </div>
    </div>
  )
}

function BrandArgos() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center bg-argos-red text-white font-bold rounded-sm"
      style={{ width: 56, height: 28, fontSize: 13, letterSpacing: '-0.02em' }}
    >
      Argos
    </span>
  )
}

function BrandTu() {
  return (
    <span
      aria-hidden="true"
      className="font-bold text-argos-charcoal italic"
      style={{ fontSize: 26, lineHeight: 1, fontFamily: 'Georgia, serif' }}
    >
      Tu
    </span>
  )
}

function BrandHabitat() {
  return (
    <span
      aria-hidden="true"
      className="text-argos-charcoal"
      style={{ fontSize: 18, lineHeight: 1, fontFamily: 'Georgia, serif' }}
    >
      habitat<sup style={{ fontSize: 9, marginLeft: 1 }}>®</sup>
    </span>
  )
}
