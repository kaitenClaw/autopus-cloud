/** Autopus Cloud — Brand logo component */
export function AutopusLogo({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
      {/* Octopus-inspired: central body + radiating tentacles = multi-agent */}
      <circle cx="16" cy="13" r="5" fill="white" fillOpacity="0.95" />
      <circle cx="14" cy="12" r="1.2" fill="#6366f1" />
      <circle cx="18" cy="12" r="1.2" fill="#6366f1" />
      {/* Tentacles — 6 arms for agent orchestration */}
      <path d="M11 16 C9 19 7 22 8 23" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
      <path d="M13 17 C12 20 10 24 11 25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
      <path d="M16 18 C16 21 16 25 16 26" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
      <path d="M19 17 C20 20 22 24 21 25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
      <path d="M21 16 C23 19 25 22 24 23" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function AutopusWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-extrabold tracking-tight ${className}`}>
      <span className="text-white">Autopus</span>
      <span className="text-[var(--text-muted)] font-medium ml-1">Cloud</span>
    </span>
  );
}
