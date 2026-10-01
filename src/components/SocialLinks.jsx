import { business } from "../data/business";
import { FacebookIcon, InstagramIcon, ThreadsIcon, TikTokIcon } from "./icons";

// Our social accounts (only those with a URL in business.js). Order = display order.
const socials = [
  { key: "instagram", label: "Instagram", handle: "@cucicuci_senawang", Icon: InstagramIcon },
  { key: "tiktok", label: "TikTok", handle: "@cucicucisenawang_", Icon: TikTokIcon },
  { key: "threads", label: "Threads", handle: "@cucicuci_senawang", Icon: ThreadsIcon },
  { key: "facebook", label: "Facebook", handle: "", Icon: FacebookIcon },
].filter((s) => business.social[s.key]);

const variants = {
  // round icon buttons on dark backgrounds (footer, closing banner)
  dark: "grid size-12 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition-colors hover:bg-brand hover:text-ink",
  // round icon buttons on light backgrounds (mobile menu)
  light: "grid size-12 place-items-center rounded-full bg-foam text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-brand",
  // labelled pills (gallery)
  pill: "inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-neutral-800",
};

export default function SocialLinks({ variant = "dark", className = "" }) {
  if (!socials.length) return null;
  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`}>
      {socials.map(({ key, label, handle, Icon }) => (
        <li key={key}>
          <a
            href={business.social[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label}${handle ? ` ${handle}` : ""}`}
            title={`${label}${handle ? ` · ${handle}` : ""}`}
            className={variants[variant]}
          >
            <Icon className={variant === "pill" ? "size-4" : "size-5"} />
            {variant === "pill" && label}
          </a>
        </li>
      ))}
    </ul>
  );
}
