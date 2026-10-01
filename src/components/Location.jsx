import { useState } from "react";
import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import { useLang } from "../i18n";
import { addressLine, business, directionsUrl, mapEmbedSrc, wazeUrl } from "../data/business";
import Reveal from "./Reveal";

const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Current weekday + minutes-since-midnight in the shop's timezone.
function shopNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: business.timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return { day: WEEK.indexOf(get("weekday")), minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

function formatTime(hhmm, lang) {
  const [h, m] = hhmm.split(":").map(Number);
  return new Intl.DateTimeFormat(lang === "ms" ? "ms-MY" : "en-MY", { hour: "numeric", minute: "2-digit" }).format(
    new Date(2000, 0, 1, h, m),
  );
}

// Monday-first list of { day, slot } for display.
function weeklyHours() {
  return [1, 2, 3, 4, 5, 6, 0].map((day) => ({ day, slot: business.hours.find((h) => h.days.includes(day)) }));
}

export default function Location() {
  const { lang, t } = useLang();
  const days = t("location.days");
  const [now] = useState(shopNow);
  const today = business.hours.find((h) => h.days.includes(now.day));
  const isOpen = today && now.minutes >= toMinutes(today.open) && now.minutes < toMinutes(today.close);

  return (
    <section id="location" className="py-20 sm:py-28">
      <div className="container-page">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">{t("location.eyebrow")}</p>
          <h2 className="section-title">{t("location.title")}</h2>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Reveal className="relative min-h-80 overflow-hidden rounded-3xl bg-foam shadow-soft ring-1 ring-line lg:min-h-[32rem]">
            <iframe
              title={t("location.mapTitle")}
              src={mapEmbedSrc}
              className="absolute inset-0 size-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </Reveal>

          <Reveal delay={120} className="flex flex-col gap-6 rounded-3xl bg-white p-7 shadow-soft ring-1 ring-line sm:p-8">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold tracking-wide text-ocean-600 uppercase">
                <MapPin className="size-4" aria-hidden="true" />
                {t("location.address")}
              </h3>
              <address className="mt-2 text-lg leading-relaxed font-semibold text-ink not-italic">
                {business.name}
                <br />
                {addressLine}
              </address>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-sm font-bold tracking-wide text-ocean-600 uppercase">
                  <Clock className="size-4" aria-hidden="true" />
                  {t("location.hours")}
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    isOpen ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${isOpen ? "bg-emerald-600" : "bg-rose-600"}`} aria-hidden="true" />
                  {isOpen ? t("location.openNow") : t("location.closedNow")}
                </span>
              </div>
              <dl className="mt-3 divide-y divide-line">
                {weeklyHours().map(({ day, slot }) => (
                  <div
                    key={day}
                    className={`flex justify-between gap-4 py-2 text-sm ${day === now.day ? "font-bold text-ink" : "text-ink-soft"}`}
                  >
                    <dt>
                      {days[day]}
                      {day === now.day && <span className="sr-only"> ({t("location.today")})</span>}
                    </dt>
                    <dd>{slot ? `${formatTime(slot.open, lang)} – ${formatTime(slot.close, lang)}` : t("location.closed")}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold tracking-wide text-ocean-600 uppercase">
                <Phone className="size-4" aria-hidden="true" />
                {t("location.phone")}
              </h3>
              <a href={`tel:${business.phoneHref}`} className="mt-2 inline-block text-lg font-semibold text-ink hover:text-ocean-600">
                {business.phone}
              </a>
            </div>

            <div className="mt-auto flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-cta flex-1">
                <Navigation className="size-5" aria-hidden="true" />
                {t("location.directions")}
              </a>
              <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline flex-1">
                {t("location.waze")}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
