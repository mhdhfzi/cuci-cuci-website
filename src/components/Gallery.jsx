import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeftRight, Expand, Images, Info, Play, X } from "lucide-react";
import { useLang } from "../i18n";
import { galleryCount, galleryItems } from "../data/gallery";
import { services } from "../data/services";
import { hasSocials } from "../data/business";
import CarpetArt from "./CarpetArt";
import SocialLinks from "./SocialLinks";
import Reveal from "./Reveal";

const PAGE_SIZE = 9;

const captionOf = (item, lang) =>
  typeof item.caption === "string" ? item.caption : item.caption?.[lang] ?? item.caption?.ms ?? "";

const canHoverPreview = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches;

// ---------- Media ----------

function Photo({ item, className = "", sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw", eager = false }) {
  if (item.demo) return <CarpetArt variant={item.demo} className={`size-full ${className}`} />;
  return (
    <img
      src={item.src}
      alt=""
      width={item.width}
      height={item.height}
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={`size-full object-cover ${className}`}
    />
  );
}

// ---------- Tiles ----------

function ServiceChip({ service }) {
  const { t } = useLang();
  if (!service) return null;
  return (
    <span className="rounded-full bg-brand px-2.5 py-1 text-[0.7rem] font-extrabold tracking-wide text-ink uppercase">
      {t(`services.${service}.title`)}
    </span>
  );
}

// Photo or video tile — a button that opens the lightbox.
function MediaTile({ item, onOpen }) {
  const { lang, t } = useLang();
  const videoRef = useRef(null);
  const caption = captionOf(item, lang);
  const isVideo = item.type === "video";

  const startPreview = () => {
    if (isVideo && canHoverPreview()) videoRef.current?.play().catch(() => {});
  };
  const stopPreview = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = item.thumbAt ?? 0.1;
  };

  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
      aria-label={`${isVideo ? t("gallery.playVideo") : t("gallery.open")}: ${caption}`}
      className="group relative block w-full overflow-hidden rounded-3xl bg-ink text-left shadow-soft ring-1 ring-line"
      style={{ aspectRatio: `${item.width} / ${item.height}` }}
    >
      <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.04]">
        {isVideo ? (
          <video
            ref={videoRef}
            src={item.poster ? item.src : `${item.src}#t=${item.thumbAt ?? 0.1}`}
            poster={item.poster}
            muted
            loop
            playsInline
            preload="metadata"
            className="size-full object-cover"
            aria-hidden="true"
            tabIndex={-1}
          />
        ) : (
          <Photo item={item} />
        )}
      </div>

      {/* Bottom gradient + caption */}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/40 to-transparent p-4 pt-16">
        <ServiceChip service={item.service} />
        {caption && <p className="mt-2 font-bold text-white">{caption}</p>}
      </div>

      {isVideo ? (
        <span className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand text-ink shadow-lift transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
          <Play className="ml-1 size-7 fill-current" />
        </span>
      ) : (
        <span className="absolute top-3 right-3 grid size-10 place-items-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true">
          <Expand className="size-4.5" />
        </span>
      )}
      {isVideo && (
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur" aria-hidden="true">
          <Play className="size-3 fill-current" /> {t("gallery.filters.video")}
        </span>
      )}
    </button>
  );
}

// Before/after comparison. A native range input drives the split, so it works
// with mouse, touch and keyboard (arrow keys, Home/End) out of the box.
function BeforeAfterTile({ item }) {
  const { lang, t } = useLang();
  const [pos, setPos] = useState(50);
  const caption = captionOf(item, lang);
  const layer = (which) =>
    item.demo ? (
      <CarpetArt variant={item.demo} dirty={which === "before"} className="size-full" />
    ) : (
      <img src={item[which]} alt="" width={item.width} height={item.height} loading="lazy" decoding="async" className="size-full object-cover" />
    );

  return (
    <figure className="group relative overflow-hidden rounded-3xl shadow-soft ring-1 ring-line select-none" style={{ aspectRatio: `${item.width} / ${item.height}` }}>
      <div className="absolute inset-0">{layer("after")}</div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {layer("before")}
      </div>

      <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-black/65 px-3 py-1 text-xs font-bold text-white uppercase backdrop-blur">
        {t("gallery.before")}
      </span>
      <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-brand px-3 py-1 text-xs font-bold text-ink uppercase">
        {t("gallery.after")}
      </span>

      <div className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_12px_rgb(0_0_0/0.4)]" style={{ left: `${pos}%` }} aria-hidden="true">
        <span className="absolute top-1/2 left-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand text-ink shadow-lift ring-4 ring-white/50 transition-transform group-has-[input:focus-visible]:scale-110 group-has-[input:focus-visible]:ring-white">
          <ChevronsLeftRight className="size-5" />
        </span>
      </div>

      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/40 to-transparent p-4 pt-16">
        <ServiceChip service={item.service} />
        <p className="mt-2 font-bold text-white">{caption}</p>
      </figcaption>

      <input
        type="range"
        min="0"
        max="100"
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`${t("gallery.slider")}: ${caption}`}
        aria-valuetext={`${pos}% ${t("gallery.before")}`}
        className="absolute inset-0 size-full cursor-ew-resize touch-pan-y opacity-0"
      />
    </figure>
  );
}

// ---------- Lightbox ----------

function Lightbox({ items, index, onClose, onNavigate }) {
  const { lang, t } = useLang();
  const dialogRef = useRef(null);
  const touchX = useRef(null);
  const open = index != null;
  const item = open ? items[index] : null;
  const total = items.length;

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (step) => onNavigate((i) => (i + step + total) % total);

  const onKeyDown = (e) => {
    if (total < 2) return;
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  };

  const onPointerDown = (e) => {
    if (e.pointerType === "touch") touchX.current = e.clientX;
  };
  const onPointerUp = (e) => {
    if (touchX.current == null || total < 2) return;
    const dx = e.clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  const caption = item ? captionOf(item, lang) : "";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onKeyDown={onKeyDown}
      // Clicking the dark backdrop (the dialog itself, not its content) closes it.
      onClick={(e) => e.target === e.currentTarget && dialogRef.current.close()}
      aria-label={caption || t("gallery.eyebrow")}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-black/95 p-0 text-white backdrop:bg-black/80"
    >
      {item && (
        <div className="flex h-full flex-col" onClick={(e) => e.target === e.currentTarget && dialogRef.current.close()}>
          <div className="flex items-center justify-between gap-4 p-3 sm:p-5">
            <p className="text-sm font-semibold text-neutral-300" aria-live="polite">
              {t("gallery.counter", { n: index + 1, total })}
            </p>
            <button
              type="button"
              autoFocus
              onClick={() => dialogRef.current.close()}
              aria-label={t("gallery.close")}
              className="grid size-12 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-brand hover:text-ink"
            >
              <X className="size-6" aria-hidden="true" />
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-3 sm:px-20"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onClick={(e) => e.target === e.currentTarget && dialogRef.current.close()}
          >
            {item.type === "video" ? (
              <video
                key={item.id}
                src={item.src}
                poster={item.poster}
                controls
                autoPlay
                playsInline
                className="rounded-2xl bg-black"
                style={{
                  aspectRatio: `${item.width} / ${item.height}`,
                  width: `min(100%, calc((100dvh - 12rem) * ${item.width / item.height}))`,
                }}
              />
            ) : (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl"
                // Fit inside the stage (viewport minus header/caption) keeping the photo's shape.
                style={{
                  aspectRatio: `${item.width} / ${item.height}`,
                  width: `min(100%, calc((100dvh - 12rem) * ${item.width / item.height}))`,
                }}
              >
                <Photo item={item} sizes="100vw" eager className="object-contain" />
              </div>
            )}

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={t("gallery.prev")}
                  className="absolute left-2 grid size-12 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-brand hover:text-ink sm:left-5"
                >
                  <ChevronLeft className="size-7" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={t("gallery.next")}
                  className="absolute right-2 grid size-12 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-brand hover:text-ink sm:right-5"
                >
                  <ChevronRight className="size-7" aria-hidden="true" />
                </button>
              </>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center sm:p-6">
            <ServiceChip service={item.service} />
            {caption && <p className="text-lg font-bold">{caption}</p>}
          </div>
        </div>
      )}
    </dialog>
  );
}

// ---------- Section ----------

// "All" takes turns across services (carpet, mattress, sofa, …) so the first
// page shows a mix instead of one service's items in file order.
const mixedItems = (() => {
  const groups = services.map((s) => galleryItems.filter((i) => i.service === s.id));
  const other = galleryItems.filter((i) => !services.some((s) => s.id === i.service));
  const out = [];
  for (let n = 0; out.length < galleryItems.length - other.length; n++) {
    groups.forEach((g) => g[n] && out.push(g[n]));
  }
  return [...out, ...other];
})();

// `filter` is "all" or a service id. It lives in App so a service card's
// "See our work" link can open the gallery pre-filtered.
export default function Gallery({ filter, onFilterChange }) {
  const { t } = useLang();
  // Paging is remembered per filter, so switching filters starts at page 1.
  const [page, setPage] = useState({ filter, count: PAGE_SIZE });
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const visible = page.filter === filter ? page.count : PAGE_SIZE;
  const filterRow = useRef(null);

  // Keep the active filter button visible in the sideways-scrolling row on phones
  // (e.g. after arriving from a service card's "See our work" link).
  useEffect(() => {
    const row = filterRow.current;
    const active = row?.querySelector('[aria-pressed="true"]');
    if (row && active && row.scrollWidth > row.clientWidth) {
      row.scrollTo({ left: active.offsetLeft - row.clientWidth / 2 + active.offsetWidth / 2, behavior: "smooth" });
    }
  }, [filter]);

  // One filter per service that has work to show, in the same order as the services list.
  const filters = useMemo(
    () => [
      { id: "all", count: galleryItems.length },
      ...services.map((s) => ({ id: s.id, count: galleryCount(s.id) })).filter((f) => f.count > 0),
    ],
    [],
  );

  const filtered = filter === "all" ? mixedItems : galleryItems.filter((i) => i.service === filter);
  const shown = filtered.slice(0, visible);
  // The lightbox browses photos + videos (before/after sliders are interactive in place).
  const viewable = filtered.filter((i) => i.type !== "beforeAfter");
  const hasDemo = galleryItems.some((i) => i.demo);

  return (
    <section id="gallery" className="py-20 sm:py-28">
      <div className="container-page">
        <Reveal className="flex flex-col items-start gap-8">
          <div className="max-w-2xl">
            <p className="eyebrow">{t("gallery.eyebrow")}</p>
            <h2 className="section-title">{t("gallery.title")}</h2>
            <p className="mt-4 text-lg text-ink-soft">{t("gallery.subtitle")}</p>
          </div>

          {filters.length > 2 && (
            // Scrolls sideways on phones, wraps on larger screens.
            <div
              ref={filterRow}
              role="group"
              aria-label={t("gallery.filterLabel")}
              className="relative -mx-4 flex w-[calc(100%+2rem)] gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:w-auto sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
            >
              {filters.map((f) => {
                const active = filter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onFilterChange(f.id)}
                    className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-bold whitespace-nowrap transition-colors ${
                      active ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-line hover:ring-ink"
                    }`}
                  >
                    {f.id === "all" ? t("gallery.filters.all") : t(`services.${f.id}.title`)}
                    <span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-brand text-ink" : "bg-foam text-ink-soft"}`}>
                      {f.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </Reveal>

        {shown.length === 0 ? (
          <p className="mt-14 flex items-center justify-center gap-2 rounded-3xl bg-white p-10 text-ink-soft ring-1 ring-line">
            <Images className="size-5" aria-hidden="true" />
            {t("gallery.empty")}
          </p>
        ) : (
          // Masonry via CSS columns — mixed portrait/landscape media pack naturally.
          <ul className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3">
            {shown.map((item, i) => (
              <li key={item.id} className="mb-5 break-inside-avoid">
                <Reveal delay={(i % 3) * 80}>
                  {item.type === "beforeAfter" ? (
                    <BeforeAfterTile item={item} />
                  ) : (
                    <MediaTile item={item} onOpen={() => setLightboxIndex(viewable.indexOf(item))} />
                  )}
                </Reveal>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex flex-col items-center gap-5">
          {filtered.length > visible && (
            <button type="button" onClick={() => setPage({ filter, count: visible + PAGE_SIZE })} className="btn btn-outline">
              {t("gallery.loadMore")} ({filtered.length - visible})
            </button>
          )}

          {hasSocials && (
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-semibold text-ink-soft">
              {t("gallery.more")}
              <SocialLinks variant="pill" className="justify-center" />
            </div>
          )}

          {hasDemo && (
            <p className="flex items-center justify-center gap-2 text-sm text-ink-soft">
              <Info className="size-4" aria-hidden="true" />
              {t("gallery.demoNote")}
            </p>
          )}
        </div>
      </div>

      <Lightbox items={viewable} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
    </section>
  );
}
