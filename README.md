# Cuci-Cuci Senawang — Business Website

One-page marketing site for Cuci-Cuci Senawang (carpet, mattress, sofa and car seat cleaning in Senawang, Negeri Sembilan). React + Vite + Tailwind CSS v4, deployed on Vercel.

## Features

- BM / EN language toggle (default BM, remembered per browser) — copy lives in `src/data/i18n.js`
- Live Google reviews via `api/reviews.js` (Places API New), with a graceful fallback
- Enquiry form (React Hook Form + Zod) that opens WhatsApp with a pre-filled message, plus a live chat preview
- Before/after comparison sliders (mouse, touch and keyboard)
- Google Maps embed, "open now" status, directions + Waze links
- LocalBusiness JSON-LD, Open Graph tags, `robots.txt`, `sitemap.xml`
- Respects `prefers-reduced-motion`; all content visible without JS animations

## Editing content

| What | Where |
|---|---|
| Phone, WhatsApp, address, hours, map, social links | `src/data/business.js` |
| Services + gallery photos | `src/data/services.js` |
| All text (BM + EN) | `src/data/i18n.js` |
| SEO meta + structured data | `index.html` |

Search the project for `TODO` to find every placeholder that must be replaced before launch.

### Adding photos & videos to the Galeri

1. Put files in `public/gallery/` — photos as `.webp`/`.jpg`, videos as `.mp4` (H.264, 10–30 s, under ~8 MB).
2. Add an entry to `src/data/gallery.js` (`type: "photo"`, `"video"` or `"beforeAfter"`). Examples are in the comment at the top of that file.
3. For videos, give the entry a `thumbAt` (the second to use as its thumbnail) and a `poster: "/gallery/<name>.jpg"`, then run the compress script below — it shrinks the video and creates the poster. **Stop `npm run dev` first** (Windows file locks can crash it while files are being written).

   ```bash
   powershell -ExecutionPolicy Bypass -File scripts/compress-videos.ps1
   ```

4. Delete the `demo` entries. The "illustration" note disappears once none remain.

The `service` field groups each item under its service. Filter buttons (and the "Lihat hasil kerja" link on service cards) only appear for services that have items. Photos and videos open in a full-screen viewer (arrow keys / swipe to browse).

## Running locally

```bash
npm install
npm run dev          # frontend at http://localhost:5173 (reviews show the fallback)
vercel dev           # frontend + /api/reviews together (needs Vercel CLI + .env.local)
```

Copy `.env.example` to `.env.local` and fill in `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID`.

## Deploying

1. Push to GitHub and import the repo into Vercel.
2. Add `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID` in Vercel → Settings → Environment Variables.
3. Restrict the API key to Places API (New) and set a billing budget alert in Google Cloud.
4. Connect the domain, then update the URLs in `index.html`, `public/robots.txt`, `public/sitemap.xml` and `business.siteUrl`.
5. Add `public/og-image.jpg` (1200×630) for link previews.
