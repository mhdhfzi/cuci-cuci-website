import { useEffect, useState } from "react";

// One request per language, shared by every component that needs reviews
// (hero rating chip + Reviews section).
const cache = new Map();

function load(lang) {
  if (!cache.has(lang)) {
    const p = fetch(`/api/reviews?lang=${lang}`)
      .then((r) => {
        const isJson = r.headers.get("content-type")?.includes("application/json");
        if (!r.ok || !isJson) throw new Error(`Reviews unavailable (${r.status})`);
        return r.json();
      })
      .catch((err) => {
        cache.delete(lang); // allow a retry on the next mount
        throw err;
      });
    cache.set(lang, p);
  }
  return cache.get(lang);
}

export function useReviews(lang) {
  const [state, setState] = useState({ status: "loading", data: null, lang });

  // Language changed: mark as loading but keep showing the previous reviews
  // until the translated ones arrive (adjusting state during render).
  if (state.lang !== lang) setState({ status: "loading", data: state.data, lang });

  useEffect(() => {
    let active = true;
    load(lang).then(
      (data) => active && setState({ status: "ready", data, lang }),
      () => active && setState({ status: "error", data: null, lang }),
    );
    return () => {
      active = false;
    };
  }, [lang]);

  return state;
}
