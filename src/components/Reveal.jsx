import { useEffect, useRef } from "react";

// Fades children in when they scroll into view. Content stays visible if JS
// or IntersectionObserver is unavailable (the hidden state only applies once
// <html> has the `reveal-ready` class, added in main.jsx).
export default function Reveal({ as: Tag = "div", delay = 0, className = "", children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      el?.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ "--reveal-delay": `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}
