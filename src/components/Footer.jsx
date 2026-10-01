import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useLang } from "../i18n";
import { addressLine, business, hasSocials } from "../data/business";
import { whatsAppLink } from "../utils/whatsapp";
import { BrandLogo, WhatsAppIcon } from "./icons";
import SocialLinks from "./SocialLinks";

// "Every day except Friday, 09:00 – 17:30" when there is a single time slot;
// otherwise one "Mon – Thu, 09:00 – 17:30" line per slot.
function hoursSummary(t) {
  const days = t("location.days");
  if (business.hours.length === 1) {
    const [{ days: open, open: from, close: to }] = business.hours;
    const closed = [0, 1, 2, 3, 4, 5, 6].filter((d) => !open.includes(d));
    const when = closed.length ? t("location.dailyExcept", { days: closed.map((d) => days[d]).join(", ") }) : null;
    if (when) return `${when}, ${from} – ${to}`;
  }
  return business.hours.map((h) => `${days[h.days[0]]} – ${days[h.days.at(-1)]}, ${h.open} – ${h.close}`).join(" · ");
}

export default function Footer() {
  const { t } = useLang();
  const year = new Date().getFullYear();

  const links = [
    ["#services", "nav.services"],
    ["#why", "nav.why"],
    ["#gallery", "nav.gallery"],
    ["#reviews", "nav.reviews"],
    ["#location", "nav.location"],
    ["#enquiry", "form.eyebrow"],
  ];

  return (
    <footer className="bg-ocean-950 pt-16 pb-28 text-ocean-100 sm:pb-12">
      <div className="container-page grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <BrandLogo className="h-20" />
          <p className="mt-4 max-w-sm leading-relaxed">{t("footer.tagline")}</p>

          {hasSocials && (
            <div className="mt-6">
              <p className="text-sm font-bold text-white">{t("footer.follow")}</p>
              <SocialLinks variant="dark" className="mt-3" />
            </div>
          )}
        </div>

        <nav aria-label={t("footer.explore")}>
          <p className="font-bold text-white">{t("footer.explore")}</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 md:grid-cols-1">
            {links.map(([href, key]) => (
              <li key={href}>
                <a href={href} className="inline-flex min-h-10 items-center hover:text-brand">
                  {t(key)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="font-bold text-white">{t("footer.contact")}</p>
          <ul className="mt-4 space-y-3">
            <li>
              <a href={whatsAppLink()} target="_blank" rel="noopener noreferrer" className="flex min-h-10 items-center gap-3 hover:text-brand">
                <WhatsAppIcon className="size-5 text-whatsapp" />
                WhatsApp
              </a>
            </li>
            <li>
              <a href={`tel:${business.phoneHref}`} className="flex min-h-10 items-center gap-3 hover:text-brand">
                <Phone className="size-5 text-brand" aria-hidden="true" />
                {business.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${business.email}`} className="flex min-h-10 items-center gap-3 break-all hover:text-brand">
                <Mail className="size-5 shrink-0 text-brand" aria-hidden="true" />
                {business.email}
              </a>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
              <span>{addressLine}</span>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
              <span>{hoursSummary(t)}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-page mt-14 border-t border-white/10 pt-6 text-sm text-ocean-300">
        © {year} {business.name} · {business.legalName} ({business.registrationNo}). {t("footer.rights")}
      </div>
    </footer>
  );
}
