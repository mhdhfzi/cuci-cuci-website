import { lazy, Suspense, useState } from "react";
import { Award, BadgeCheck, Building2, Eye, FileCheck2, Medal, Plane, Target } from "lucide-react";
import { useLang } from "../i18n";
import { business } from "../data/business";
import { can3D } from "../van3d";
import CountUp from "./CountUp";
import DocViewer from "./DocViewer";
import Reveal from "./Reveal";

// Three.js is only downloaded when the 3D trophy will actually be shown.
const TrophyScene = lazy(() => import("./van/TrophyScene"));

const FOUNDED_YEAR = Number(business.founded.slice(0, 4));

const DOCS = {
  ssm: { src: "/images/about/sijil-ssm.jpg", width: 590, height: 867 },
  award: { src: "/images/about/anugerah-karcher-2024.jpg", width: 535, height: 839 },
};

function Stat({ value, label, suffix = "" }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-line">
      <p className="font-display text-4xl font-extrabold text-ink sm:text-5xl">
        <span className="bg-[linear-gradient(transparent_64%,var(--color-brand)_64%,var(--color-brand)_92%,transparent_92%)]">
          {value}
          {suffix}
        </span>
      </p>
      <p className="mt-2 text-sm font-medium text-ink-soft">{label}</p>
    </div>
  );
}

export default function About() {
  const { t } = useLang();
  const [doc, setDoc] = useState(null);
  const years = new Date().getFullYear() - FOUNDED_YEAR;
  const openDoc = (key) => setDoc({ ...DOCS[key], title: t(`about.creds.${key}.title`) });

  return (
    <section id="about" className="py-20 sm:py-28">
      <div className="container-page">
        {/* ── Story + photos ── */}
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow">{t("about.eyebrow")}</p>
            <h2 className="section-title">{t("about.title")}</h2>
            <p className="mt-6 text-lg leading-relaxed font-medium text-ink">{t("about.lead")}</p>
            <div className="mt-4 space-y-4 leading-relaxed text-ink-soft">
              <p>{t("about.p1")}</p>
              <p>{t("about.p2")}</p>
            </div>

            {/* founders */}
            <div className="mt-8 flex gap-4 rounded-3xl bg-ink p-5 text-white sm:p-6">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand text-ink">
                <Plane className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-lg font-bold">{t("about.founders.title")}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-300">{t("about.founders.text")}</p>
                <p className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-brand">{t("about.founders.tag")}</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className="relative">
            <figure className="overflow-hidden rounded-[2rem] shadow-lift ring-1 ring-line">
              <img
                src="/images/about/kedai-kami.jpg"
                alt={t("about.shopCaption")}
                width="796"
                height="636"
                loading="lazy"
                className="aspect-[5/4] w-full object-cover"
              />
            </figure>
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-ink/85 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
              <Building2 className="size-3.5 text-brand" aria-hidden="true" /> {t("about.shopCaption")}
            </span>
            <figure className="absolute -bottom-8 -left-3 w-40 overflow-hidden rounded-2xl bg-white p-1.5 shadow-lift ring-1 ring-line sm:-left-8 sm:w-52">
              <img
                src="/images/about/pasukan-peralatan.jpg"
                alt={t("about.teamCaption")}
                width="291"
                height="219"
                loading="lazy"
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
              <figcaption className="px-1.5 pt-1.5 pb-0.5 text-xs font-bold text-ink">{t("about.teamCaption")}</figcaption>
            </figure>
          </Reveal>
        </div>

        {/* ── Numbers ── */}
        <Reveal className="mt-20 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat value={<CountUp to={FOUNDED_YEAR} format={String} />} label={t("about.stats.since")} />
          <Stat value={<CountUp to={business.customersPerYear} />} suffix="+" label={t("about.stats.customers")} />
          <Stat value={business.turnaroundDays} label={t("about.stats.turnaround")} />
          <Stat value={<CountUp to={years} />} suffix="+" label={t("about.stats.years")} />
        </Reveal>

        {/* ── Timeline ── */}
        <Reveal className="mt-16">
          <h3 className="text-sm font-bold tracking-wide text-ink-soft uppercase">{t("about.timelineTitle")}</h3>
          <ol className="relative mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="absolute top-[9px] right-0 left-0 hidden h-0.5 bg-linear-to-r from-brand via-brand to-line lg:block" aria-hidden="true" />
            {t("about.timeline").map((step, i) => (
              <li key={step.year} className="relative pl-8 lg:pt-8 lg:pl-0">
                <span
                  className={`absolute top-0 left-0 grid size-5 place-items-center rounded-full ring-4 ring-mist ${i === 3 ? "bg-ink" : "bg-brand"}`}
                  aria-hidden="true"
                >
                  <span className={`size-1.5 rounded-full ${i === 3 ? "bg-brand" : "bg-ink"}`} />
                </span>
                <p className="font-display text-2xl font-extrabold text-ink">{step.year}</p>
                <p className="mt-1 font-bold text-ink">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{step.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* ── Award + vision/mission ── */}
        <div className="mt-16 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <Reveal className="relative overflow-hidden rounded-[2rem] bg-ink text-white">
            <div className="grain absolute inset-0" aria-hidden="true" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,rgb(250_204_21/0.22),transparent_60%)]" aria-hidden="true" />
            <div className="relative grid sm:grid-cols-[1fr_0.9fr]">
              <div className="p-7 sm:p-9">
                <p className="inline-flex items-center gap-2 text-xs font-bold tracking-wide text-brand uppercase">
                  <Award className="size-4" aria-hidden="true" /> {t("about.awardEyebrow")}
                </p>
                <h3 className="mt-3 font-display text-2xl leading-tight font-bold sm:text-3xl">{t("about.awardTitle")}</h3>
                <p className="mt-1 text-sm font-semibold text-neutral-300">{t("about.awardBy")}</p>
                <p className="mt-4 leading-relaxed text-neutral-300">{t("about.awardText")}</p>
                <button type="button" onClick={() => openDoc("award")} className="btn btn-cta mt-6 !min-h-11 !px-5 text-sm">
                  <Eye className="size-4" aria-hidden="true" /> {t("about.viewDoc")}
                </button>
              </div>
              <div className="relative min-h-64 sm:min-h-0">
                {can3D ? (
                  <Suspense fallback={null}>
                    <TrophyScene />
                  </Suspense>
                ) : (
                  <div className="grid h-full place-items-center">
                    <Medal className="size-28 text-brand" aria-hidden="true" />
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                ["vision", Eye],
                ["mission", Target],
              ].map(([k, Icon]) => (
                <div key={k} className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-line">
                  <span className="grid size-11 place-items-center rounded-2xl bg-ink text-brand">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-ink">{t(`about.${k}Title`)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t(`about.${k}`)}</p>
                </div>
              ))}
            </div>
            <div className="rounded-3xl bg-brand p-6 text-ink sm:p-7">
              <p className="text-xs font-bold tracking-wide uppercase">{t("about.mottoTitle")}</p>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-display text-3xl font-extrabold tracking-tight uppercase sm:text-4xl">
                {t("about.motto").map((w, i) => (
                  <span key={w} className="flex items-center gap-4">
                    {i > 0 && <span className="size-2.5 rounded-full bg-ink" aria-hidden="true" />}
                    {w}
                  </span>
                ))}
              </p>
            </div>
          </Reveal>
        </div>

        {/* ── Credentials ── */}
        <Reveal className="mt-5 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-line sm:p-7">
          <h3 className="flex items-center gap-2 text-sm font-bold tracking-wide text-ink-soft uppercase">
            <BadgeCheck className="size-4 text-ink" aria-hidden="true" /> {t("about.credTitle")}
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {["ssm", "award"].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => openDoc(k)}
                className="group flex items-center gap-4 rounded-2xl p-3 text-left ring-1 ring-line transition-colors hover:bg-foam hover:ring-ink"
              >
                <img
                  src={DOCS[k].src}
                  alt=""
                  width={DOCS[k].width}
                  height={DOCS[k].height}
                  loading="lazy"
                  className="h-24 w-[4.2rem] shrink-0 rounded-lg object-cover object-top shadow-soft ring-1 ring-line"
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 font-bold text-ink">
                    <FileCheck2 className="size-4 shrink-0" aria-hidden="true" /> {t(`about.creds.${k}.title`)}
                  </span>
                  <span className="mt-1 block text-sm text-ink-soft">{t(`about.creds.${k}.text`, { reg: business.registrationNo })}</span>
                  <span className="mt-2 inline-block text-sm font-bold text-ink underline decoration-brand decoration-2 underline-offset-4">
                    {t("about.viewDoc")}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      <DocViewer doc={doc} onClose={() => setDoc(null)} />
    </section>
  );
}
