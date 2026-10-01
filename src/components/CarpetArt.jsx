import { useId } from "react";

// Illustrated carpets used as placeholders until real before/after photos are
// added (see src/data/services.js). `dirty` renders the same carpet dulled,
// dusty and stained so the before/after slider has something honest to show.
const palettes = {
  rug: { field: "#9f1239", border: "#1e3a8a", accent: "#fde68a", inner: "#fff7ed", line: "#0f172a" },
  mosque: { field: "#166534", border: "#7f1d1d", accent: "#fcd34d", inner: "#ecfccb", line: "#052e16" },
  shaggy: { field: "#e7d7c1", border: "#c8b299", accent: "#f5ede1", inner: "#fbf7f0", line: "#a08b72" },
};

function RugPattern({ c, id }) {
  return (
    <>
      <rect width="400" height="300" fill={c.border} />
      <rect x="14" y="14" width="372" height="272" fill="none" stroke={c.accent} strokeWidth="3" strokeDasharray="10 6" />
      <rect x="30" y="30" width="340" height="240" fill={c.field} />
      <pattern id={`${id}-dia`} width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M20 4 36 20 20 36 4 20Z" fill="none" stroke={c.accent} strokeOpacity="0.35" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="2.5" fill={c.accent} fillOpacity="0.5" />
      </pattern>
      <rect x="30" y="30" width="340" height="240" fill={`url(#${id}-dia)`} />
      <path d="M200 70 290 150 200 230 110 150Z" fill={c.inner} />
      <path d="M200 92 265 150 200 208 135 150Z" fill={c.border} />
      <path d="M200 118 232 150 200 182 168 150Z" fill={c.accent} />
      <circle cx="200" cy="150" r="9" fill={c.field} />
      {[
        [62, 62],
        [338, 62],
        [62, 238],
        [338, 238],
      ].map(([x, y]) => (
        <path key={`${x}${y}`} d={`M${x} ${y - 18} ${x + 18} ${y} ${x} ${y + 18} ${x - 18} ${y}Z`} fill={c.inner} />
      ))}
    </>
  );
}

function MosquePattern({ c }) {
  return (
    <>
      <rect width="400" height="300" fill={c.field} />
      {[0, 1, 2, 3].map((i) => {
        const x = 12 + i * 96;
        return (
          <g key={i}>
            <rect x={x} y="16" width="88" height="268" fill={c.border} rx="4" />
            <path d={`M${x + 8} 276V96q0-52 36-66 36 14 36 66v180Z`} fill={c.field} />
            <path d={`M${x + 16} 268V104q0-42 28-54 28 12 28 54v164Z`} fill="none" stroke={c.accent} strokeWidth="2" />
            <path d={`M${x + 44} 70l6 10-6 10-6-10Z`} fill={c.accent} />
            <rect x={x + 24} y="200" width="40" height="52" fill={c.inner} fillOpacity="0.2" rx="3" />
          </g>
        );
      })}
    </>
  );
}

function ShaggyPattern({ c, id }) {
  return (
    <>
      <filter id={`${id}-fur`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9 0.06" numOctaves="3" seed="4" />
        <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.47  0 0 0 0 0.38  0 0 0 0.55 0" />
        <feComposite in2="SourceGraphic" operator="in" />
      </filter>
      <rect width="400" height="300" fill={c.field} />
      <rect width="400" height="300" fill={c.inner} filter={`url(#${id}-fur)`} />
      <ellipse cx="200" cy="150" rx="140" ry="95" fill="none" stroke={c.border} strokeWidth="10" strokeOpacity="0.6" />
      <ellipse cx="200" cy="150" rx="90" ry="58" fill="none" stroke={c.border} strokeWidth="6" strokeOpacity="0.45" />
    </>
  );
}

export default function CarpetArt({ variant = "rug", dirty = false, className = "", title }) {
  const raw = useId().replace(/:/g, "");
  const id = `ca${raw}${dirty ? "d" : "c"}`;
  const c = palettes[variant] ?? palettes.rug;

  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : "true"}
    >
      <defs>
        <filter id={`${id}-dull`}>
          <feColorMatrix
            type="matrix"
            values="0.55 0.3 0.12 0 0.04  0.45 0.4 0.12 0 0.03  0.35 0.3 0.15 0 0.01  0 0 0 1 0"
          />
        </filter>
        <filter id={`${id}-dust`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.24  0 0 0 0 0.16  0 0 0 0.7 -0.1" />
        </filter>
        <filter id={`${id}-blur`}>
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      <g filter={dirty ? `url(#${id}-dull)` : undefined}>
        {variant === "mosque" ? (
          <MosquePattern c={c} />
        ) : variant === "shaggy" ? (
          <ShaggyPattern c={c} id={id} />
        ) : (
          <RugPattern c={c} id={id} />
        )}
      </g>

      {dirty && (
        <g>
          <rect width="400" height="300" filter={`url(#${id}-dust)`} opacity="0.85" />
          <g filter={`url(#${id}-blur)`} fill="#3f2a14" opacity="0.5">
            <ellipse cx="120" cy="95" rx="42" ry="28" />
            <ellipse cx="290" cy="205" rx="55" ry="30" />
            <ellipse cx="250" cy="80" rx="20" ry="14" />
            <ellipse cx="80" cy="230" rx="30" ry="18" />
          </g>
          <rect width="400" height="300" fill="#57442c" opacity="0.18" />
        </g>
      )}

      {!dirty && (
        <g fill="#fff">
          <path d="M318 58l3.5 8 8 3.5-8 3.5-3.5 8-3.5-8-8-3.5 8-3.5Z" opacity="0.9" />
          <path d="M92 196l2.5 5.5 5.5 2.5-5.5 2.5-2.5 5.5-2.5-5.5-5.5-2.5 5.5-2.5Z" opacity="0.8" />
        </g>
      )}
    </svg>
  );
}
