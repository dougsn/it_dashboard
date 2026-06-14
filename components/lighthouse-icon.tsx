// Brand mark for WatchIT Tower — a lighthouse/beacon. Shared between the login
// hero and the sidebar so the mark stays consistent everywhere.
export function LighthouseIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Finial */}
      <path d="M12 2.4V3.4" />
      {/* Roof */}
      <path d="M9.8 6 12 3.7l2.2 2.3" />
      {/* Lantern room */}
      <path d="M10.4 6h3.2v2.5h-3.2z" />
      {/* Lit lamp */}
      <circle cx="12" cy="7.25" r="0.7" fill="currentColor" stroke="none" />
      {/* Beacon beams projecting from the lantern */}
      <path d="M9.8 7.25H8M14.2 7.25H16" />
      {/* Gallery platform */}
      <path d="M8.9 8.5h6.2" />
      {/* Tower body (tapered) */}
      <path d="M9.8 8.5 8.5 19.6M14.2 8.5 15.5 19.6" />
      {/* Band stripes */}
      <path d="M9.3 12.4h5.4" />
      <path d="M8.9 16h6.2" />
      {/* Base */}
      <path d="M7.3 19.6h9.4" />
      {/* Arched door */}
      <path d="M10.9 19.6v-2.3a1.1 1.1 0 0 1 2.2 0v2.3" />
    </svg>
  );
}
