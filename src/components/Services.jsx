import { ArrowUpRight, BedDouble, Building2, Car, Images, Sofa } from "lucide-react";
import { useLang } from "../i18n";
import { services } from "../data/services";
import { galleryCount } from "../data/gallery";
import { MosqueIcon, RugIcon } from "./icons";
import Reveal from "./Reveal";

const icons = { rug: RugIcon, bed: BedDouble, sofa: Sofa, car: Car, mosque: MosqueIcon, office: Building2 };

export default function Services({ onSelect, onViewWork }) {
  const { t } = useLang();

  return (
    <section id="services" className="bg-white py-20 sm:py-28">
      <div className="container-page">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">{t("services.eyebrow")}</p>
          <h2 className="section-title">{t("services.title")}</h2>
          <p className="mt-4 text-lg text-ink-soft">{t("services.subtitle")}</p>
        </Reveal>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const Icon = icons[s.icon];
            return (
              <Reveal as="li" key={s.id} delay={(i % 3) * 80}>
                {/* White card that inverts to black on hover/focus — the signature look */}
                <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white p-7 ring-1 ring-line transition-[background-color,box-shadow,transform] duration-300 focus-within:bg-ink hover:-translate-y-1 hover:bg-ink hover:shadow-lift">
                  <span
                    className="absolute top-5 right-6 font-display text-5xl font-extrabold text-foam transition-colors duration-300 group-focus-within:text-brand/15 group-hover:text-brand/15"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="relative grid size-14 place-items-center rounded-2xl bg-ink text-brand transition-colors duration-300 group-focus-within:bg-brand group-focus-within:text-ink group-hover:bg-brand group-hover:text-ink">
                    <Icon className="size-7" aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 text-xl font-bold text-ink transition-colors group-focus-within:text-white group-hover:text-white">
                    {t(`services.${s.id}.title`)}
                  </h3>
                  <p className="mt-2 flex-1 leading-relaxed text-ink-soft transition-colors group-focus-within:text-neutral-300 group-hover:text-neutral-300">
                    {t(`services.${s.id}.desc`)}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-1.5" aria-label={t(`services.${s.id}.title`)}>
                    {t(`services.${s.id}.tags`).map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full px-3 py-1 text-xs font-semibold text-ink ring-1 ring-line transition-colors group-focus-within:text-white group-focus-within:ring-white/25 group-hover:text-white group-hover:ring-white/25"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1">
                    <a
                      href="#enquiry"
                      onClick={() => onSelect(s.id)}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-full font-bold text-ink underline decoration-brand decoration-[3px] underline-offset-4 transition-colors group-focus-within:text-brand group-hover:text-brand"
                    >
                      {t("services.cta")}
                      <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                    </a>
                    {galleryCount(s.id) > 0 && (
                      <a
                        href="#gallery"
                        onClick={() => onViewWork(s.id)}
                        aria-label={`${t("services.viewWork")}: ${t(`services.${s.id}.title`)}`}
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-full text-sm font-semibold text-ink-soft transition-colors group-focus-within:text-neutral-300 group-hover:text-neutral-300 hover:!text-brand"
                      >
                        <Images className="size-4" aria-hidden="true" />
                        {t("services.viewWork")} ({galleryCount(s.id)})
                      </a>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
