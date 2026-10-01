import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "./data/i18n";
import { business } from "./data/business";

const LangContext = createContext(null);
const STORAGE_KEY = "cuci-lang";

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "ms" || saved === "en") return saved;
  } catch {
    /* storage unavailable */
  }
  return "ms";
}

function lookup(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage unavailable */
    }
  }, [lang]);

  // t("hero.subtitle", { count: 5 }) — {km} is always filled from business data.
  const t = useCallback(
    (key, vars = {}) => {
      const value = lookup(translations[lang], key);
      if (typeof value !== "string") return value ?? key;
      const all = { km: business.pickupRadiusKm, ...vars };
      return value.replace(/\{(\w+)\}/g, (_, k) => (k in all ? all[k] : `{${k}}`));
    },
    [lang],
  );

  const value = useMemo(
    () => ({ lang, setLang, t, toggle: () => setLang((l) => (l === "ms" ? "en" : "ms")) }),
    [lang, t],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
  return ctx;
}
