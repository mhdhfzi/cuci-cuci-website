import { MessageCircle, PackageCheck, Truck } from "lucide-react";
import { useLang } from "../i18n";
import { lazy, Suspense } from "react";
import Reveal from "./Reveal";
import { can3D } from "../van3d";

// Three.js is only downloaded when the 3D scenes will actually be shown.
const StepScene = lazy(() => import("./van/StepScene"));

const steps = [
  { key: "s1", Icon: MessageCircle },
  { key: "s2", Icon: Truck },
  { key: "s3", Icon: PackageCheck },
];

export default function HowItWorks() {
  const { t } = useLang();

  return (
    <section className="py-20 sm:py-28" aria-labelledby="process-title">
      <div className="container-page">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">{t("process.eyebrow")}</p>
          <h2 id="process-title" className="section-title">{t("process.title")}</h2>
        </Reveal>

        <ol className="relative mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
          {/* Connecting line on desktop (runs behind the icons / through the 3D tiles) */}
          <div
            className={`absolute right-[16%] left-[16%] hidden h-0.5 bg-linear-to-r from-ocean-300 via-aqua to-ocean-300 md:block ${can3D ? "top-[34%] border-t-2 border-dashed border-brand bg-none" : "top-8"}`}
            aria-hidden="true"
          />
          {steps.map(({ key, Icon }, i) => (
            <Reveal as="li" key={key} delay={i * 120} className={`relative flex gap-5 md:flex-col md:items-center md:text-center ${can3D ? "flex-col" : ""}`}>
              {can3D ? (
                // animated 3D scene for the step
                <span className="relative z-10 block aspect-[4/3] w-full overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_50%_40%,#fff7d6,#ffffff_60%)] shadow-lift ring-1 ring-line md:max-w-sm">
                  <Suspense fallback={null}>
                    <StepScene step={i + 1} chat={i === 0 ? t("process.chat") : undefined} />
                  </Suspense>
                  <span className="absolute top-3 left-3 grid size-9 place-items-center rounded-full bg-brand text-sm font-extrabold text-ink ring-2 ring-white">
                    {i + 1}
                  </span>
                </span>
              ) : (
              <span className="relative z-10 grid size-16 shrink-0 place-items-center rounded-2xl bg-white text-ocean-600 shadow-lift ring-1 ring-line">
                <Icon className="size-7" aria-hidden="true" />
                <span className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full bg-brand text-xs font-extrabold text-ink ring-2 ring-white">
                  {i + 1}
                </span>
              </span>
              )}
              <div>
                <h3 className="text-xl font-bold text-ink md:mt-6">{t(`process.${key}.title`)}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft md:mx-auto md:max-w-xs">{t(`process.${key}.desc`)}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
