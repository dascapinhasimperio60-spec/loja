/** Metal peg hook coming out of the slatwall. Authored, icon-sized. */
export function Hook({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 44" width="28" height="44" aria-hidden className={className}>
      <defs>
        <linearGradient id="hook-metal" x1="0" x2="1">
          <stop offset="0" stopColor="#5d5d63" />
          <stop offset="0.45" stopColor="#f2f2f5" />
          <stop offset="1" stopColor="#6c6c72" />
        </linearGradient>
      </defs>
      <ellipse cx="14" cy="5" rx="9" ry="4" fill="#0a0a0b" />
      <ellipse cx="14" cy="4.4" rx="6.5" ry="2.6" fill="url(#hook-metal)" />
      <path d="M14 5 V30 q0 7 6 7" fill="none" stroke="url(#hook-metal)" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}
