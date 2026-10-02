# Cuci-Cuci Senawang — Business Website

**Live:** [cucicucisenawang.com](https://cucicucisenawang.com)

A bilingual (Bahasa Melayu / English) marketing website for **Cuci-Cuci Senawang (Dobi Karpet Xpress)**, a carpet, mattress, sofa and car-seat cleaning business in Senawang, Negeri Sembilan, operated by Rizqiman Gemilang Legacy since 2019.

The site introduces the business and builds trust with customers through interactive 3D scenes, a gallery of real work, live Google reviews and verified certificates. Customers can send an enquiry straight to the business WhatsApp in one tap.

---

## Highlights

- **Interactive 3D hero.** A procedurally modelled company van, built in code with Three.js and wearing the real van's livery, drives on a small planet that visitors can drag to spin. When the van parks, its rear doors open to show carpets and cleaning machines.
- **More 3D across the page.** A free-pickup radius map plotted from real coordinates, animated "how it works" scenes, a gold award trophy, and an equipment turntable that visitors control by tapping any of 11 machine names.
- **Live Google reviews.** A serverless function proxies the Google Places API (New), so the API key never reaches the browser. Cost is kept at zero with a 12-hour CDN cache, a 30-requests-a-day quota cap, request validation and a budget alert.
- **WhatsApp enquiry flow.** A validated form (React Hook Form + Zod, including Malaysian phone numbers) builds a pre-filled WhatsApp message, with a live chat-bubble preview as the customer types.
- **Gallery of real work.** 44 photos and videos grouped by service, with a full-screen viewer (keyboard and swipe) and service filters linked from each service card.
- **Bilingual.** Every string is available in BM and English through a small translation layer, and the choice is remembered per browser.
- **Trust content.** Company story, timeline, vision and mission, an award, and six certificates (SSM, LHDN tax compliance, Sertu, training courses) shown as tappable documents, with personal ID numbers redacted.
- **Performance-minded.**
  - Three.js (about 245 KB gzipped) is lazy-loaded only for capable devices; others get a 2D fallback.
  - 3D scenes pause when off-screen.
  - Videos were re-encoded with ffmpeg from about 165 MB to about 69 MB (≈58% smaller), with generated poster frames.
- **Accessible and SEO-ready.**
  - Respects `prefers-reduced-motion`, keyboard navigation and focus states, and ARIA labels.
  - `LocalBusiness` JSON-LD, Open Graph link-preview image, sitemap and robots file.
- **Privacy.** Customer number plates and private phone numbers were blurred out of photos and video before publishing.

## Tech stack

| Area | Technology |
|---|---|
| Framework | React 19, Vite 8 |
| Styling | Tailwind CSS v4 (design tokens in `@theme`) |
| 3D | Three.js, React Three Fiber (procedural models, canvas-drawn textures) |
| Forms | React Hook Form, Zod |
| Icons | Lucide React + custom SVG |
| Backend | Vercel Serverless Function (Node) → Google Places API (New) |
| Hosting | Vercel (CDN, HTTPS, custom domain, CI/CD from GitHub) |
| Media tooling | ffmpeg (H.264 compression, posters, redaction), PowerShell scripts |
| Quality | ESLint (React Hooks rules), production builds checked on every change |

## Architecture

```
Browser ──► Vercel CDN ──► static React app (Vite build)
   │
   └─► /api/reviews?lang=ms|en ──► Vercel Function ──► Google Places API (New)
            (cached 12 h at the edge; key kept server-side; other queries rejected)

Enquiry form ──► wa.me link with a pre-filled message ──► business WhatsApp
                 (no customer data stored on the website)
```

## Project structure

```
api/reviews.js              Serverless proxy for Google reviews
public/gallery/             Compressed videos, posters and photos
public/images/              Logo, shop photos, certificates, equipment
scripts/compress-videos.ps1 Re-encodes videos and exports poster frames
scripts/find-place-id.mjs   Looks up the Google Place ID for the listing
src/components/             Page sections (Hero, About, Services, Gallery, Reviews, …)
src/components/van/         3D scenes: van model, planet, radius map, steps, trophy, equipment
src/data/                   Business details, services, gallery list, BM/EN copy
src/hooks/useReviews.js     Fetches and caches reviews per language
src/van3d.js                Decides 3D vs 2D (reduced motion, data saver, WebGL)
```

## Editing content

| What | Where |
|---|---|
| Phone, WhatsApp, address, hours, social links, company facts | `src/data/business.js` |
| Services | `src/data/services.js` |
| Gallery photos and videos | `src/data/gallery.js` |
| All text (BM + EN) | `src/data/i18n.js` |
| SEO meta and structured data | `index.html` |

### Adding photos and videos to the gallery

1. Put files in `public/gallery/`: photos as `.jpg`/`.webp`, videos as `.mp4`. Keep the full-size originals in `media-originals/` (not uploaded to GitHub).
2. Add an entry to `src/data/gallery.js` (`type: "photo"`, `"video"` or `"beforeAfter"`, plus a `service`). There are examples at the top of the file.
3. For videos, set `thumbAt` (the second to use as the thumbnail) and `poster`. Stop `npm run dev`, then run:

   ```bash
   powershell -ExecutionPolicy Bypass -File scripts/compress-videos.ps1
   ```

## Running locally

```bash
npm install
npm run dev     # http://localhost:5173 — /api/reviews also works locally
npm run lint
npm run build
```

Copy `.env.example` to `.env.local` and fill in `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID`. `.env.local` is git-ignored.

## Deployment

Every push to `main` is built and deployed automatically by Vercel to [cucicucisenawang.com](https://cucicucisenawang.com).

- Set `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID` in Vercel → Settings → Environment Variables, then redeploy.
- Google Cloud safeguards: the key is restricted to Places API (New), the daily quota is capped, and a budget alert is set.
- Previous deployments can be restored instantly from the Vercel dashboard.

---

© Cuci-Cuci Senawang · Rizqiman Gemilang Legacy. All rights reserved.
