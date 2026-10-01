import { useLang } from "../i18n";
import { whatsAppLink } from "../utils/whatsapp";
import { WhatsAppIcon } from "./icons";
import Reveal from "./Reveal";
import SocialLinks from "./SocialLinks";

// Full-bleed closing call-to-action with a giant scrolling word marquee behind.
export default function ClosingCta() {
  const { t } = useLang();
  const words = t("marquee");

  return (
    <section className="relative isolate overflow-hidden bg-ocean-900 py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,var(--color-ocean-700),var(--color-ocean-950)_75%)]" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 flex flex-col justify-center gap-4 opacity-[0.07]" aria-hidden="true">
        {[0, 1].map((row) => (
          <div key={row} className="flex overflow-hidden">
            <div
              className="flex shrink-0 animate-marquee"
              style={{ "--marquee-duration": "60s", animationDirection: row ? "reverse" : "normal" }}
            >
              {[...words, ...words, ...words, ...words].map((w, i) => (
                <span key={i} className="pr-10 font-display text-7xl font-extrabold whitespace-nowrap text-white uppercase sm:text-9xl">
                  {w}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Reveal className="container-page text-center">
        <h2 className="mx-auto max-w-3xl text-4xl leading-tight font-extrabold tracking-tight text-white sm:text-6xl">{t("cta.title")}</h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ocean-100">{t("cta.subtitle")}</p>
        <a
          href={whatsAppLink(t("cta.quick"))}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-cta mt-10 !min-h-14 !px-9 text-lg"
        >
          <WhatsAppIcon className="size-6" />
          {t("cta.button")}
        </a>
        <p className="mt-10 text-sm font-semibold text-ocean-100">{t("footer.follow")}</p>
        <SocialLinks variant="dark" className="mt-3 justify-center" />
      </Reveal>
    </section>
  );
}
