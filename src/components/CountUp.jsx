import { useEffect, useRef, useState } from "react";

// Counts from 0 up to `to` once the number scrolls into view. With reduced
// motion (or no IntersectionObserver) it shows the final value immediately.
export default function CountUp({ to, duration = 1600, format = (n) => n.toLocaleString("en-MY") }) {
  const ref = useRef(null);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [value, setValue] = useState(reduced ? to : 0);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !("IntersectionObserver" in window)) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration, reduced]);

  return (
    <span ref={ref} className="tabular-nums">
      {format(value)}
    </span>
  );
}
