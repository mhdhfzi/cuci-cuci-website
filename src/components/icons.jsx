// Brand + custom icons not provided by lucide-react.
// Decorative by default (aria-hidden); pass a label via the parent control.

export function WhatsAppIcon({ className = "size-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.43 9.43 0 0 1-4.8-1.32l-.35-.2-3.57.93.96-3.48-.23-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.43 9.45-9.43a9.38 9.38 0 0 1 6.67 2.77 9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43m8.04-17.47A11.3 11.3 0 0 0 12.05.7C5.78.7.68 5.8.68 12.06c0 2 .52 3.96 1.52 5.68L.58 23.7l6.1-1.6a11.33 11.33 0 0 0 5.37 1.37h.01c6.26 0 11.36-5.1 11.37-11.36 0-3.04-1.18-5.9-3.33-8.04" />
    </svg>
  );
}

export function GoogleIcon({ className = "size-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.87c2.27-2.09 3.58-5.17 3.58-8.81" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.87-3.01c-1.08.72-2.45 1.15-4.08 1.15-3.13 0-5.79-2.11-6.74-4.96H1.26v3.1A12 12 0 0 0 12 24" />
      <path fill="#FBBC05" d="M5.26 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.26a12 12 0 0 0 0 10.76z" />
      <path fill="#EA4335" d="M12 4.76c1.76 0 3.35.61 4.6 1.8l3.44-3.44A11.97 11.97 0 0 0 1.26 6.62l4 3.1C6.21 6.87 8.87 4.76 12 4.76" />
    </svg>
  );
}

export function FacebookIcon({ className = "size-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07" />
    </svg>
  );
}

export function InstagramIcon({ className = "size-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function ThreadsIcon({ className = "size-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.19 24h-.01c-3.58-.02-6.33-1.2-8.18-3.51C2.35 18.44 1.5 15.59 1.47 12.01v-.02c.03-3.58.88-6.43 2.53-8.48C5.85 1.2 8.6.02 12.18 0h.01c2.75.02 5.04.73 6.83 2.1 1.68 1.29 2.86 3.13 3.51 5.47l-2.04.57c-1.1-3.96-3.9-5.98-8.3-6.02-2.91.02-5.11.94-6.54 2.72C4.31 6.5 3.62 8.91 3.59 12c.03 3.09.72 5.5 2.06 7.16 1.43 1.78 3.63 2.7 6.54 2.72 2.62-.02 4.36-.63 5.8-2.05 1.65-1.61 1.62-3.59 1.09-4.8-.31-.71-.87-1.3-1.63-1.75-.19 1.35-.62 2.45-1.28 3.27-.89 1.1-2.14 1.7-3.73 1.79-1.2.07-2.36-.22-3.26-.8-1.06-.69-1.69-1.74-1.75-2.96-.07-1.19.41-2.29 1.33-3.08.88-.76 2.12-1.21 3.58-1.29a13.85 13.85 0 0 1 3.02.14c-.13-.74-.38-1.33-.75-1.76-.51-.59-1.31-.88-2.36-.89h-.03c-.84 0-1.99.23-2.72 1.32L7.73 7.85c.98-1.45 2.57-2.26 4.48-2.26h.04c3.2.02 5.1 1.98 5.29 5.39.11.05.22.09.32.14 1.49.7 2.58 1.76 3.15 3.07.8 1.82.87 4.79-1.55 7.16-1.85 1.81-4.09 2.63-7.28 2.65Zm1-11.69c-.24 0-.49.01-.74.02-1.84.1-2.98.95-2.92 2.14.07 1.26 1.45 1.84 2.78 1.77 1.22-.07 2.82-.54 3.09-3.71a10.5 10.5 0 0 0-2.21-.22z" />
    </svg>
  );
}

export function TikTokIcon({ className = "size-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3 0 .59.04.86.13v-3.5a6.37 6.37 0 0 0-.86-.06A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52V6.73a4.85 4.85 0 0 1-1.84-.04" />
    </svg>
  );
}

// Rolled rug — lucide has no carpet icon.
export function RugIcon({ className = "size-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6 4h14v13H6" />
      <path d="M6 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Z" />
      <path d="M13 8l2.5 2.5L13 13l-2.5-2.5Z" />
      <path d="M9 20h11M11 17v3M14 17v3M17 17v3" />
    </svg>
  );
}

// Official logo (Rizqiman Gemilang Legacy · Cuci-Cuci Senawang). The artwork has
// a white background, so it always sits on a white rounded plate — which also
// keeps its navy/gold readable on the black sections.
export function BrandLogo({ className = "h-12" }) {
  return (
    <span className={`inline-flex shrink-0 overflow-hidden rounded-xl bg-white ${className}`}>
      <img
        src="/images/logo.jpg"
        alt="Cuci-Cuci Senawang — Rizqiman Gemilang Legacy"
        width="680"
        height="320"
        className="h-full w-auto"
      />
    </span>
  );
}

// Emblem only (hexagon "RL" mark) for small square spots. Decorative.
export function BrandMark({ className = "size-9" }) {
  return (
    <span className={`inline-flex shrink-0 overflow-hidden rounded-full bg-white ${className}`} aria-hidden="true">
      <img src="/images/logo-mark.jpg" alt="" width="256" height="256" className="size-full object-contain" />
    </span>
  );
}

// Mosque dome + minaret — lucide has no mosque icon.
export function MosqueIcon({ className = "size-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 3v2" />
      <path d="M6 12a6 6 0 0 1 12 0" />
      <path d="M5 12h14v9H5Z" />
      <path d="M10 21v-4a2 2 0 0 1 4 0v4" />
      <path d="M21 21V9l-1-2-1 2v12" />
      <path d="M2 21h20" />
    </svg>
  );
}

export function Stars({ rating = 5, className = "size-4" }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <svg key={i} viewBox="0 0 20 20" className={className}>
            <defs>
              <linearGradient id={`st-${i}-${Math.round(fill * 100)}`}>
                <stop offset={fill} stopColor="#fbbf24" />
                <stop offset={fill} stopColor="#cbd5e1" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#st-${i}-${Math.round(fill * 100)})`}
              d="M10 1.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.8l-5.2 2.7 1-5.8L1.6 7.6l5.8-.8Z"
            />
          </svg>
        );
      })}
    </span>
  );
}
