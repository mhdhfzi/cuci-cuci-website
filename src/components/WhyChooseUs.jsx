import { lazy, Suspense, useEffect, useState } from "react";
import { BadgeCheck, Droplets, HeartHandshake, MapPin, ShieldCheck, Smile, Timer, Users, Wrench } from "lucide-react";
import { useLang } from "../i18n";
import { business } from "../data/business";
import Reveal from "./Reveal";
import { can3D } from "../van3d";

// Three.js is only downloaded when the 3D map will actually be shown.
const RadiusMap = lazy(() => import("./van/RadiusMap"));
const EquipmentScene = lazy(() => import("./van/EquipmentScene"));

// Concentric "pickup radius" graphic for the large bento card.
function RadiusGraphic() {
  const { t } = useLang();
  return (
    <div className="relative mx-auto aspect-square w-full max-w-72" aria-hidden="true">
      {[100, 76, 52].map((s, i) => (
        <span
          key={s}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-white/5"
          style={{ width: `${s}%`, height: `${s}%`, animation: `float 6s ease-in-out ${i * -2}s infinite` }}
        />
      ))}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-aqua/40 p-6" />
      <span className="absolute top-1/2 left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand text-ink shadow-lift">
        <MapPin className="size-7" />
      </span>
      <span className="absolute right-0 bottom-3 rounded-full bg-brand px-3 py-1.5 text-sm font-extrabold text-ink shadow-lift">
        {business.pickupRadiusKm} km
      </span>
      <span className="absolute top-3 left-0 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">
        {t("why.radiusLabel")}
      </span>
    </div>
  );
}

function Card({ Icon, k, className = "", delay = 0, tone = "light" }) {
  const { t } = useLang();
  const light = tone === "light";
  return (
    <Reveal
      delay={delay}
      className={`group rounded-3xl p-7 ring-1 transition-shadow duration-300 hover:shadow-lift ${
        light ? "bg-white ring-line" : "bg-ink text-white ring-white/10"
      } ${className}`}
    >
      <span
        className={`grid size-12 place-items-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 ${
          light ? "bg-ink text-brand" : "bg-brand text-ink"
        }`}
      >
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h3 className={`mt-5 text-xl font-bold ${light ? "text-ink" : "text-white"}`}>{t(`why.${k}.title`)}</h3>
      <p className={`mt-2 leading-relaxed ${light ? "text-ink-soft" : "text-neutral-300"}`}>{t(`why.${k}.desc`)}</p>
    </Reveal>
  );
}

// Professional equipment: tap a machine name to show it on the 3D turntable.
// Without interaction it auto-cycles; a tap pauses the cycle for a while.
// Product photos from the company profile, same order as why.equipment.
const PHOTOS = [
  ["karcher-puzzi-10-1", 292, 219],
  ["karcher-brs-43-500c", 212, 212],
  ["karcher-sc-2500c", 282, 282],
  ["karcher-cv-38-2", 253, 253],
  ["karcher-wet-dry", 238, 238],
  ["bissell-big-green", 127, 210],
  ["viper-cex410", 200, 222],
  ["tommy-c18x", 210, 210],
  ["roots-wizzard", 314, 204],
  ["ogawa-bf534", 136, 225],
  ["jetspin-cr5500", 400, 300],
].map(([slug, width, height]) => ({ src: `/images/equipment/${slug}.jpg`, width, height }));

function MachinePhoto({ index, name, label, className = "" }) {
  const p = PHOTOS[index];
  return (
    <figure className={`overflow-hidden rounded-2xl bg-white p-2 shadow-lift ${className}`}>
      <img key={p.src} src={p.src} alt={name} width={p.width} height={p.height} loading="lazy" className="mx-auto min-h-0 w-full flex-1 animate-[pop_0.35s_ease-out] object-contain" />
      <figcaption className="mt-1 text-center text-[0.65rem] font-bold tracking-wide text-ink-soft uppercase">{label}</figcaption>
    </figure>
  );
}

const CYCLE_MS = 4500;
const PAUSE_MS = 15000;

function Equipment() {
  const { t } = useLang();
  const machines = t("why.equipment");
  const [current, setCurrent] = useState(0);
  const [taps, setTaps] = useState(0); // bumps on every tap → restarts the timer below

  useEffect(() => {
    if (!can3D) return;
    let id;
    // after a tap, wait PAUSE_MS before cycling again
    const start = setTimeout(
      () => {
        id = setInterval(() => setCurrent((i) => (i + 1) % machines.length), CYCLE_MS);
      },
      taps ? PAUSE_MS : 0,
    );
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, [taps, machines.length]);

  const choose = (i) => {
    setCurrent(i);
    setTaps((n) => n + 1);
  };
  return (
    <Reveal className="relative mt-5 overflow-hidden rounded-[2rem] bg-ink text-white">
      <div className="grain absolute inset-0" aria-hidden="true" />
      <div className="relative grid lg:grid-cols-[1fr_1.05fr]">
        <div className="p-7 sm:p-10">
          <p className="inline-flex items-center gap-2 text-xs font-bold tracking-wide text-brand uppercase">
            <Wrench className="size-4" aria-hidden="true" /> {t("why.equipEyebrow")}
          </p>
          <h3 className="mt-3 font-display text-2xl leading-tight font-bold sm:text-3xl">{t("why.equipTitle")}</h3>
          <p className="mt-3 leading-relaxed text-neutral-300">{t("why.equipText")}</p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label={t("why.equipEyebrow")}>
            {machines.map((mc, i) => {
              const active = i === current;
              return (
                <li key={mc.name}>
                  <button
                    type="button"
                    onClick={() => choose(i)}
                    aria-pressed={active}
                    className={`min-h-9 rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 transition-colors ${
                      active ? "bg-brand text-ink ring-brand" : "bg-white/8 text-white ring-white/15 hover:bg-white/15 hover:ring-white/40"
                    }`}
                  >
                    {mc.name}
                  </button>
                </li>
              );
            })}
          </ul>
          {!can3D && <p className="mt-3 text-sm text-brand">{machines[current].role}</p>}

          <h4 className="mt-8 text-sm font-bold text-white">{t("why.qualityTitle")}</h4>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {t("why.quality").map((q) => (
              <li key={q} className="flex items-start gap-2 text-sm text-neutral-300">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" /> {q}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative min-h-[27rem] border-t border-white/10 sm:min-h-[26rem] lg:border-t-0 lg:border-l">
          {can3D ? (
            <>
              <Suspense fallback={null}>
                <EquipmentScene index={current} />
              </Suspense>
              <MachinePhoto
                index={current}
                name={machines[current].name}
                label={t("why.photoLabel")}
                className="pointer-events-none absolute top-4 left-4 flex h-28 w-24 flex-col sm:h-44 sm:w-40"
              />
              <div className="pointer-events-none absolute inset-x-4 bottom-5 flex flex-col items-center text-center" aria-live="polite">
                <p className="font-display text-xl font-bold text-white">{machines[current].name}</p>
                <p className="text-sm text-brand">{machines[current].role}</p>
                <p className="mt-2 text-xs font-semibold text-white/50 tabular-nums">
                  {current + 1} / {machines.length}
                </p>
              </div>
              <span className="pointer-events-none absolute top-4 right-4 hidden rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 sm:inline">
                ⇆ {t("why.equipHint")}
              </span>
            </>
          ) : (
            <div className="absolute inset-0 grid place-items-center p-8">
              <MachinePhoto index={current} name={machines[current].name} label={machines[current].name} className="flex h-64 w-56 flex-col" />
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}

export default function WhyChooseUs() {
  const { t } = useLang();

  return (
    <section id="why" className="bg-white py-20 sm:py-28">
      <div className="container-page">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">{t("why.eyebrow")}</p>
          <h2 className="section-title">{t("why.title")}</h2>
        </Reveal>

        {/* Bento grid */}
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Reveal className="relative overflow-hidden rounded-3xl bg-ocean-900 p-7 text-white md:col-span-2 lg:row-span-2">
            <div className="grain absolute inset-0" aria-hidden="true" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,var(--color-ocean-600),transparent_60%)]" aria-hidden="true" />
            {can3D ? (
              // 3D map of the free pickup zone, bleeding to the card edges
              <div className="relative flex h-full flex-col gap-4">
                <div className="relative z-10">
                  <h3 className="font-display text-2xl font-bold sm:text-3xl">{t("why.pickup.title")}</h3>
                  <p className="mt-3 max-w-sm leading-relaxed text-ocean-100">{t("why.pickup.desc")}</p>
                </div>
                <div className="relative -mx-7 -mt-10 -mb-7 h-80 sm:h-[26rem] lg:h-auto lg:min-h-[24rem] lg:flex-1">
                  <Suspense fallback={null}>
                    <RadiusMap shopLabel={t("why.shopLabel")} />
                  </Suspense>
                  <div className="pointer-events-none absolute bottom-5 left-6 flex flex-wrap gap-2 text-xs font-bold">
                    <span className="flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-ink">
                      <span className="size-2 rounded-full bg-ink" /> {t("why.freeZone")}
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-white/80 backdrop-blur">{t("why.outside")}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative flex h-full flex-col gap-8 sm:flex-row sm:items-center lg:flex-col lg:items-stretch">
                <div className="sm:flex-1">
                  <h3 className="font-display text-2xl font-bold sm:text-3xl">{t("why.pickup.title")}</h3>
                  <p className="mt-3 max-w-sm leading-relaxed text-ocean-100">{t("why.pickup.desc")}</p>
                </div>
                <div className="sm:flex-1 lg:flex lg:flex-1 lg:items-center">
                  <RadiusGraphic />
                </div>
              </div>
            )}
          </Reveal>

          <Card Icon={Timer} k="ontime" delay={80} tone="dark" />
          <Card Icon={Users} k="staff" delay={160} />
          <Card Icon={Droplets} k="safe" delay={240} />
          <Card Icon={BadgeCheck} k="price" delay={320} />
          <Card Icon={HeartHandshake} k="friendly" delay={80} className="md:col-span-1 lg:col-span-2" />
          <Card Icon={Smile} k="satisfaction" delay={160} tone="dark" className="md:col-span-1 lg:col-span-2" />
        </div>

        {/* Trusted by */}
        <Reveal className="mt-5 flex flex-col gap-4 rounded-3xl bg-foam p-6 sm:flex-row sm:items-center sm:p-7">
          <p className="shrink-0 text-sm font-bold tracking-wide text-ink uppercase">{t("why.trustedTitle")}</p>
          <ul className="flex flex-wrap gap-2">
            {t("why.trusted").map((x) => (
              <li key={x} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-ink ring-1 ring-line">
                <BadgeCheck className="size-4 text-ink" aria-hidden="true" /> {x}
              </li>
            ))}
          </ul>
        </Reveal>

        <Equipment />
      </div>
    </section>
  );
}