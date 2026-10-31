export function Logo({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="Brightloop">
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path d="M21.5 11.2A7 7 0 1 0 23 16" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="22.2" cy="9.6" r="2.1" fill="#fff" />
    </svg>
  );
}
