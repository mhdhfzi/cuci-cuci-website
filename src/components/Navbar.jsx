import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useLang } from "../i18n";
import { business } from "../data/business";
import { whatsAppLink } from "../utils/whatsapp";
import { BrandLogo, WhatsAppIcon } from "./icons";
import SocialLinks from "./SocialLinks";

const links = [
  { href: "#services", key: "nav.services" },
  { href: "#why", key: "nav.why" },
  { href: "#gallery", key: "nav.gallery" },
  { href: "#reviews", key: "nav.reviews" },
  { href: "#location", key: "nav.location" },
];

function LangToggle({ dark }) {
  const { lang, toggle, t } = useLang();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("nav.lang")}
      className={`relative inline-flex h-11 items-center rounded-full p-1 text-xs font-bold transition-colors ${
        dark ? "bg-white/10 text-white ring-1 ring-white/25" : "bg-foam text-ink ring-1 ring-line"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-1 bottom-1 w-10 rounded-full shadow transition-transform duration-300 ease-out ${
          dark ? "bg-brand" : "bg-ink"
        } ${lang === "en" ? "translate-x-10" : "translate-x-0"}`}
      />
      {["ms", "en"].map((l) => (
        <span
          key={l}
          aria-hidden="true"
          className={`relative z-10 w-10 text-center transition-colors ${
            lang === l ? (dark ? "text-ink" : "text-brand") : ""
          }`}
        >
          {l === "ms" ? "BM" : "EN"}
        </span>
      ))}
    </button>
  );
}

export default function Navbar() {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef(null);
  const panel = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobile menu: lock scroll, close on Escape, move focus into the panel.
  useEffect(() => {
    if (!open) return;
    const button = menuButton.current;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector("a")?.focus();
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      button?.focus();
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300 ${
        solid ? "bg-white/85 shadow-soft backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-bold focus:text-ink"
      >
        {t("nav.skip")}
      </a>
      <nav className="container-page flex h-18 items-center justify-between gap-4" aria-label="Main">
        <a href="#top" className={`flex items-center rounded-xl ${solid ? "ring-1 ring-line" : ""}`} aria-label={business.name}>
          <BrandLogo className="h-13 sm:h-14" />
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                  solid ? "text-ink-soft hover:bg-foam hover:text-ink" : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                {t(l.key)}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <LangToggle dark={!solid} />
          <a
            href={whatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn ${solid ? "btn-whatsapp" : "btn-cta"} hidden !min-h-11 !px-5 text-sm sm:inline-flex`}
          >
            <WhatsAppIcon className={`size-4.5 ${solid ? "text-whatsapp" : ""}`} />
            {t("nav.whatsapp")}
          </a>
          <button
            ref={menuButton}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t("nav.close") : t("nav.menu")}
            className={`inline-flex size-11 items-center justify-center rounded-full lg:hidden ${
              solid ? "text-ink hover:bg-foam" : "text-white hover:bg-white/10"
            }`}
          >
            {open ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          ref={panel}
          className="h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-line bg-white px-4 pt-4 pb-10 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-14 items-center rounded-2xl px-4 font-display text-2xl font-bold text-ink hover:bg-foam"
                >
                  {t(l.key)}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={whatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp mt-6 w-full"
          >
            <WhatsAppIcon className="size-5 text-whatsapp" />
            {t("nav.whatsapp")}
          </a>
          <SocialLinks variant="light" className="mt-5 justify-center" />
        </div>
      )}
    </header>
  );
}
