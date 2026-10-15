import { useEffect, useState } from "react";
import { useLang } from "../i18n";
import { whatsAppLink } from "../utils/whatsapp";
import { WhatsAppIcon } from "./icons";

// The AI chat button ("Tanya kami", from widget.js in index.html) sits just above this
// button and invites questions, so there's no separate nudge bubble here.
export default function FloatingWhatsApp() {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);

  // Appear after the visitor scrolls past the hero.
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed right-4 z-40 flex flex-col items-end gap-3 transition-[opacity,transform] duration-300 sm:right-6 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
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
