/** Autopus Cloud — Corporate Minimalist Logo
 *  Navy · White · Coral — Professional & Trustworthy
 *  Geometric octopus representing 8 specialized AI agents
 */
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
      {/* Background — Deep Navy */}
      <rect width="32" height="32" rx="8" fill="#1a2332" />
      
      {/* Central head — Clean circle */}
      <circle cx="16" cy="12" r="4" stroke="#f8fafc" strokeWidth="1.5" fill="none" />
      
      {/* Eyes — Minimal dots */}
      <circle cx="14.5" cy="11.5" r="1" fill="#f4a261" />
      <circle cx="17.5" cy="11.5" r="1" fill="#f4a261" />
      
      {/* 8 Tentacles — Geometric lines with circular nodes (agents) */}
      {/* Left side */}
      <path d="M12 15 C10 17 8 18 7 17" stroke="#f8fafc" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="7" cy="17" r="1.5" fill="#f4a261" />
      
      <path d="M13 16 C12 19 11 22 10 23" stroke="#f8fafc" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="10" cy="23" r="1.5" fill="#f4a261" />
      
      <path d="M15 16 C15 19 14 24 13 26" stroke="#f8fafc" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="13" cy="26" r="1.5" fill="#f4a261" />
      
      {/* Center */}
      <path d="M16 16 C16 20 16 25 16 27" stroke="#f8fafc" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="16" cy="27" r="1.5" fill="#f4a261" />
      
      {/* Right side */}
      <path d="M17 16 C17 19 18 24 19 26" stroke="#f8fafc" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="19" cy="26" r="1.5" fill="#f4a261" />
      
      <path d="M19 16 C20 19 21 22 22 23" stroke="#f8fafc" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="22" cy="23" r="1.5" fill="#f4a261" />
      
      <path d="M20 15 C22 17 24 18 25 17" stroke="#f8fafc" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="25" cy="17" r="1.5" fill="#f4a261" />
    </svg>
  );
}

export function AutopusWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-extrabold tracking-tight ${className}`}>
      <span className="text-[#f8fafc]">Autopus</span>
      <span className="text-[#64748b] font-medium ml-1">Cloud</span>
    </span>
  );
}
