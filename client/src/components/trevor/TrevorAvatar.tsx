// Stylised Trevor avatar — green circular character with antennae.
// Used in the drawer header and on each assistant message bubble.

interface Props {
  size?: number
  className?: string
}

export default function TrevorAvatar({ size = 36, className }: Props) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#E6F4EA',
        border: '2px solid #fff',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.05)',
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="13" r="7" fill="#028940" />
        <circle cx="9.5" cy="12" r="1.4" fill="#fff" />
        <circle cx="14.5" cy="12" r="1.4" fill="#fff" />
        <path
          d="M9 16 Q12 18 15 16"
          stroke="#fff"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
        <line
          x1="9"
          y1="6.5"
          x2="9"
          y2="4"
          stroke="#028940"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1="15"
          y1="6.5"
          x2="15"
          y2="4"
          stroke="#028940"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="9" cy="3.4" r="0.9" fill="#028940" />
        <circle cx="15" cy="3.4" r="0.9" fill="#028940" />
      </svg>
    </span>
  )
}
