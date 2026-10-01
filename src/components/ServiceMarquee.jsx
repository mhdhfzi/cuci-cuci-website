import { Sparkle } from "lucide-react";
import { useLang } from "../i18n";

// Decorative scrolling strip of service names under the hero.
export default function ServiceMarquee() {
  const { t } = useLang();
  const items = t("marquee");

  return (
    <div className="relative -mt-2 overflow-hidden py-6" aria-hidden="true">
      <div className="mask-fade-x flex">
        <div className="flex shrink-0 animate-marquee items-center [--marquee-duration:35s]">
          {[...items, ...items, ...items, ...items].map((item, i) => (
            <span key={i} className="flex items-center gap-6 pr-6 font-display text-2xl font-bold whitespace-nowrap text-ocean-800/80 sm:text-3xl">
              {item}
              <Sparkle className="size-5 fill-aqua text-aqua" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
