import { useState } from "react";
import { ExternalLink, Pause, PenLine, Play, Quote } from "lucide-react";
import { useLang } from "../i18n";
import { reviewsUrl, writeReviewUrl } from "../data/business";
import { useReviews } from "../hooks/useReviews";
import { GoogleIcon, Stars } from "./icons";
import Reveal from "./Reveal";

const CLAMP = 180;

function ReviewCard({ review }) {
  const { t } = useLang();
  const [expanded, setExpanded] = useState(false);
  const long = review.text.length > CLAMP;
  const text = expanded || !long ? review.text : `${review.text.slice(0, CLAMP).trimEnd()}…`;

  return (
    <article className="flex w-[19rem] shrink-0 flex-col rounded-3xl bg-white p-6 shadow-soft ring-1 ring-line sm:w-[22rem]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {review.photo ? (
            <img
              src={review.photo}
              alt=""
              width="44"
              height="44"
              loading="lazy"
              referrerPolicy="no-referrer"
              className="size-11 rounded-full object-cover"
            />
          ) : (
            <span className="grid size-11 place-items-center rounded-full bg-ocean-100 font-bold text-ocean-700" aria-hidden="true">
              {review.author.charAt(0)}
            </span>
          )}
          <div>
            {review.authorUrl ? (
              <a href={review.authorUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-ink hover:underline">
                {review.author}
              </a>
            ) : (
              <p className="font-bold text-ink">{review.author}</p>
            )}
            <p className="text-sm text-ink-soft">{review.time}</p>
          </div>
        </div>
        <GoogleIcon className="size-5 shrink-0" />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Stars rating={review.rating ?? 5} />
        <span className="sr-only">{review.rating} / 5</span>
      </div>
      <p className="mt-3 flex-1 leading-relaxed whitespace-pre-line text-ink-soft">{text}</p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="mt-3 min-h-11 self-start rounded-full text-sm font-bold text-ocean-600 hover:text-ocean-800"
        >
          {expanded ? t("reviews.readLess") : t("reviews.readMore")}
        </button>
      )}
    </article>
  );
}

function Skeleton() {
  return (
    <div className="flex gap-5 overflow-hidden" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-60 w-[19rem] shrink-0 animate-pulse rounded-3xl bg-white p-6 ring-1 ring-line sm:w-[22rem]">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-full bg-foam" />
            <div className="space-y-2">
              <div className="h-3 w-28 rounded bg-foam" />
              <div className="h-3 w-16 rounded bg-foam" />
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="h-3 rounded bg-foam" />
            <div className="h-3 rounded bg-foam" />
            <div className="h-3 w-2/3 rounded bg-foam" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Auto-scrolling marquee. Pauses on hover/focus and via an explicit button;
// with reduced motion it becomes a plain horizontally-scrollable row.
function ReviewMarquee({ reviews }) {
  const { t } = useLang();
  const [paused, setPaused] = useState(false);
  const loop = reviews.length >= 3;
  const items = loop ? [...reviews, ...reviews] : reviews;

  if (!loop) {
    return (
      <div className="flex flex-wrap justify-center gap-5">
        {reviews.map((r, i) => (
          <ReviewCard key={i} review={r} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="mask-fade-x overflow-hidden motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]">
        <div
          className={`flex w-max py-2 motion-safe:animate-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] ${
            paused ? "[animation-play-state:paused]" : ""
          }`}
          style={{ "--marquee-duration": `${reviews.length * 12}s` }}
        >
          {items.map((r, i) => (
            <div key={i} className="flex pr-5" aria-hidden={i >= reviews.length ? "true" : undefined} inert={i >= reviews.length ? true : undefined}>
              <ReviewCard review={r} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-center motion-reduce:hidden">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-ink-soft hover:bg-white hover:text-ink"
        >
          {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
          {paused ? t("reviews.play") : t("reviews.pause")}
        </button>
      </div>
    </div>
  );
}

function ReviewButtons() {
  const { t } = useLang();
  return (
    <div className="container-page mt-10 flex flex-col justify-center gap-3 sm:flex-row">
      <a href={reviewsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
        <GoogleIcon />
        {t("reviews.seeAll")}
        <ExternalLink className="size-4 text-ink-soft" aria-hidden="true" />
      </a>
      <a href={writeReviewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-cta">
        <PenLine className="size-5" aria-hidden="true" />
        {t("reviews.write")}
      </a>
    </div>
  );
}

export default function Reviews() {
  const { lang, t } = useLang();
  const { status, data } = useReviews(lang);
  const hasReviews = data?.reviews?.length > 0;

  return (
    <section id="reviews" className="overflow-hidden bg-foam py-20 sm:py-28">
      <div className="container-page">
        <Reveal className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow">{t("reviews.eyebrow")}</p>
            <h2 className="section-title">{t("reviews.title")}</h2>
          </div>

          {data?.rating != null && (
            <div className="flex items-center gap-4 rounded-3xl bg-white p-5 pr-7 shadow-soft ring-1 ring-line">
              <GoogleIcon className="size-10" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-4xl font-extrabold text-ink">{data.rating.toFixed(1)}</span>
                  <Stars rating={data.rating} className="size-5" />
                </div>
                <p className="text-sm text-ink-soft">{t("reviews.basedOn", { count: data.count })}</p>
              </div>
            </div>
          )}
        </Reveal>
      </div>

      <div className="mt-12" aria-live="polite" aria-busy={status === "loading" && !data}>
        {status === "loading" && !data && (
          <div className="container-page">
            <span className="sr-only">{t("reviews.loading")}</span>
            <Skeleton />
          </div>
        )}

        {hasReviews && <ReviewMarquee reviews={data.reviews} />}

        {status === "error" && (
          <div className="container-page">
            <div className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl bg-white p-10 text-center shadow-soft ring-1 ring-line">
              <span className="grid size-16 place-items-center rounded-2xl bg-foam">
                <Quote className="size-7 text-ocean-600" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-2xl font-bold text-ink">{t("reviews.fallbackTitle")}</h3>
              <p className="mt-2 text-ink-soft">{t("reviews.fallbackText")}</p>
            </div>
          </div>
        )}
      </div>

      <ReviewButtons />
    </section>
  );
}
