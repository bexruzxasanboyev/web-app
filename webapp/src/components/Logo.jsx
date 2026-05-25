// Logotip — oltin rangli tog'/strelka shakli.
export default function Logo({ size = 72 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="avp-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f5d77a" />
          <stop offset="1" stopColor="#b8860b" />
        </linearGradient>
      </defs>
      <path
        d="M50 10 L86 64 L64 64 L50 42 L36 64 L14 64 Z"
        fill="url(#avp-logo)"
      />
      <path
        d="M50 46 L74 84 L58 84 L50 71 L42 84 L26 84 Z"
        fill="url(#avp-logo)"
        opacity="0.92"
      />
    </svg>
  )
}
