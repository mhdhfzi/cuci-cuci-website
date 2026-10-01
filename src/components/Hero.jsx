import { lazy, Suspense } from "react";
import { ArrowRight, Phone, Sparkles, Truck } from "lucide-react";
import { useLang } from "../i18n";
import { business, reviewsUrl } from "../data/business";
import { useReviews } from "../hooks/useReviews";
import CarpetArt from "./CarpetArt";
import { can3D } from "../van3d";

// Three.js is only downloaded when the 3D van will actually be shown.
const HeroVan = lazy(() => import("./van/HeroVan"));
import { GoogleIcon, Stars } from "./icons";

const bubbles = [
  { left: "6%", size: 14, delay: "0s", dur: "13s" },
  { left: "18%", size: 8, delay: "3s", dur: "11s" },
  { left: "34%", size: 20, delay: "6s", dur: "16s" },
  { left: "52%", size: 10, delay: "1s", dur: "12s" },
  { left: "68%", size: 16, delay: "8s", dur: "15s" },
  { left: "82%", size: 9, delay: "4s", dur: "10s" },
  { left: "93%", size: 18, delay: "10s", dur: "17s" },
];

function RatingChip() {
  const { lang, t } = useLang();
  const { data } = useReviews(lang);
  const hasRating = data?.rating != null;

  return (
    <a
      href={reviewsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex min-h-12 items-center gap-3 rounded-2xl bg-white/10 px-4 py-2 ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white/15"
    >
      <span className="grid size-8 place-items-center rounded-full bg-white">
        <GoogleIcon className="size-4.5" />
      </span>
      {hasRating ? (
        <span className="text-left">
          <span className="flex items-center gap-2">
            <span className="font-display text-lg font-bold text-white">{data.rating.toFixed(1)}</span>
            <Stars rating={data.rating} className="size-3.5" />
          </span>
          <span className="block text-xs text-ocean-100">
            {data.count} {t("hero.rating")}
          </span>
        </span>
      ) : (
        <span className="text-sm font-semibold text-white">{t("hero.ratingFallback")}</span>
      )}
      <ArrowRight className="size-4 text-white/70 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </a>
  );
}

function HeroVisual() {
  const { t } = useLang();
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      <div className="absolute -inset-6 rounded-[3rem] bg-linear-to-tr from-brand/25 via-brand/5 to-transparent blur-2xl" aria-hidden="true" />

      {can3D ? (
        // 3D mode: the van on a little planet you can spin (see components/van)
        <div className="relative aspect-square lg:aspect-[4/3.8]">
          <Suspense fallback={null}>
            <HeroVan />
          </Suspense>
        </div>
      ) : (
      <div className="hero-split relative aspect-[4/3.4] overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-white/20">
        {/* Clean carpet underneath, dirty half on top, split by an animated sweep line */}
        <CarpetArt variant="rug" className="absolute inset-0 size-full" />
        <div className="hero-dirty absolute inset-0" aria-hidden="true">
          <CarpetArt variant="rug" dirty className="size-full" />
        </div>
        <div className="hero-sweep absolute inset-y-0 w-1 bg-white shadow-[0_0_24px_6px_rgb(255_255_255/0.7)]" aria-hidden="true" />

        <span className="absolute top-4 left-4 rounded-full bg-black/55 px-3 py-1 text-xs font-bold tracking-wide text-white uppercase backdrop-blur">
          {t("hero.before")}
        </span>
        <span className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold tracking-wide text-ocean-800 uppercase backdrop-blur">
          {t("hero.after")}
        </span>
      </div>
      )}

      <div className="absolute -bottom-6 -left-2 flex animate-float items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-lift sm:-left-8">
        <span className="grid size-11 place-items-center rounded-xl bg-ink text-brand">
          <Truck className="size-5.5" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-sm font-bold text-ink">{t("hero.pickup")}</span>
          <span className="block text-xs text-ink-soft">{t("hero.pickupSub")}</span>
        </span>
      </div>

      <div
        // in 3D mode the top-right is taken by the shop's rooftop sign, so this
        // badge moves down beside the other one (no room for both on phones)
        className={`absolute ${can3D ? "-bottom-6 hidden sm:-right-6 sm:flex" : "-top-5 -right-2 flex sm:-right-6"} animate-float items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-lift [animation-delay:-3s]`}
      >
        <span className="grid size-11 place-items-center rounded-xl bg-ink text-brand">
          <Sparkles className="size-5.5" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-sm font-bold text-ink">{t("hero.deep")}</span>
          <span className="block text-xs text-ink-soft">{t("hero.deepSub")}</span>
        </span>
      </div>
    </div>
  );
}

export default function Hero() {
  const { t } = useLang();

  return (
    <section id="top" className="relative isolate overflow-hidden bg-ocean-900 pt-28 pb-24 sm:pt-36 lg:pb-32">
      {/* Background: deep water gradient, dot grain, rising bubbles */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,var(--color-ocean-600),transparent_55%),radial-gradient(ellipse_at_bottom_left,var(--color-ocean-800),var(--color-ocean-950)_70%)]" aria-hidden="true" />
      <div className="grain absolute inset-0 -z-10" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        {bubbles.map((b, i) => (
          <span
            key={i}
            className="absolute -bottom-8 animate-rise rounded-full border border-white/30 bg-white/10"
            style={{ left: b.left, width: b.size, height: b.size, animationDelay: b.delay, animationDuration: b.dur }}
          />
        ))}
      </div>

      <div className="container-page grid items-center gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div className="text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-ocean-100 ring-1 ring-white/15 backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-aqua opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-aqua" />
            </span>
            {t("hero.badge")}
          </p>

          <h1 className="mt-6 text-[2.6rem] leading-[1.05] font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            {t("hero.title1")}
            <span className="block text-brand">
              {t("hero.title2")}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ocean-100 lg:mx-0">{t("hero.subtitle")}</p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <a href="#enquiry" className="btn btn-cta group">
              {t("hero.book")}
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </a>
            <a href={`tel:${business.phoneHref}`} className="btn btn-ghost-light">
              <Phone className="size-5" aria-hidden="true" />
              {t("hero.call")}
            </a>
          </div>

          <div className="mt-8 flex justify-center lg:justify-start">
            <RatingChip />
          </div>
        </div>

        <HeroVisual />
      </div>

      {/* Wave into the next section */}
      <svg className="absolute inset-x-0 -bottom-px h-12 w-full text-mist sm:h-20" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path fill="currentColor" d="M0 48c160 24 320 36 480 24S800 20 960 20s320 36 480 44v16H0Z" />
      </svg>
    </section>
  );
}
