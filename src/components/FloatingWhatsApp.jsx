import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useLang } from "../i18n";
import { whatsAppLink } from "../utils/whatsapp";
import { WhatsAppIcon } from "./icons";

const DISMISS_KEY = "cuci-bubble-dismissed";

function wasDismissed() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export default function FloatingWhatsApp() {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);
  const [bubble, setBubble] = useState(false);

  // Appear after the visitor scrolls past the hero; show a one-time nudge.
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const timer = wasDismissed() ? null : setTimeout(() => setBubble(true), 9000);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    setBubble(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* storage unavailable */
    }
  };

  return (
    <div
      className={`fixed right-4 z-40 flex flex-col items-end gap-3 transition-[opacity,transform] duration-300 sm:right-6 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      {bubble && visible && (
        <div className="relative max-w-60 rounded-2xl rounded-br-sm bg-white p-4 pr-10 text-sm font-medium text-ink shadow-lift ring-1 ring-line">
          {t("floating.bubble")}
          <button
            type="button"
            onClick={dismiss}
            aria-label={t("floating.dismiss")}
            className="absolute top-1 right-1 grid size-9 place-items-center rounded-full text-ink-soft hover:bg-foam hover:text-ink"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
      <a
        href={whatsAppLink(t("cta.quick"))}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("floating.label")}
        tabIndex={visible ? undefined : -1}
        className="relative grid size-16 place-items-center rounded-full bg-whatsapp text-white shadow-lg shadow-whatsapp/40 transition-transform hover:scale-105 active:scale-95"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-whatsapp opacity-30 [animation-duration:2.5s]" aria-hidden="true" />
        <WhatsAppIcon className="relative size-8" />
      </a>
    </div>
  );
}
