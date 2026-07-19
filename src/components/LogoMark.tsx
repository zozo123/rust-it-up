/** Rust It Up mark: three ascending bars (a rising scorecard) whose tallest
 *  resolves into an upward arrow — "the score goes Up". Decorative; the
 *  adjacent wordmark carries the accessible name. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
      className="logo-mark-svg"
    >
      <defs>
        <linearGradient id="riu-bar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#b8551f" />
          <stop offset="1" stopColor="#f0883c" />
        </linearGradient>
      </defs>
      <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="9.5" fill="#0d1219" stroke="#3a2417" strokeWidth="1.25" />
      <rect x="8" y="21" width="7" height="11" rx="3" fill="#8a3f1a" />
      <rect x="16.5" y="14" width="7" height="18" rx="3" fill="#c45c26" />
      <rect x="25" y="12" width="7" height="20" rx="3" fill="url(#riu-bar)" />
      <path d="M22.2 12 L28.5 5 L34.8 12 Z" fill="#f0883c" />
    </svg>
  )
}
