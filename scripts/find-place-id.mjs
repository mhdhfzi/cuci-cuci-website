// Finds our Google Place ID using the API key in .env.local.
// Usage (from the project folder):  node scripts/find-place-id.mjs
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const key = env.GOOGLE_PLACES_API_KEY;
if (!key || key === "paste_your_key_here") {
  console.error("Put your API key in .env.local first (GOOGLE_PLACES_API_KEY=...).");
  process.exit(1);
}

const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": key,
    "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount",
  },
  body: JSON.stringify({ textQuery: "Cuci Cuci Senawang Dobi Karpet Xpress, Senawang" }),
});
const data = await res.json();
if (!res.ok) {
  console.error("Google returned an error:", data.error?.status, "-", data.error?.message);
  process.exit(1);
}
for (const p of data.places ?? []) {
  console.log(`${p.displayName?.text}\n  ${p.formattedAddress}\n  rating ${p.rating ?? "-"} (${p.userRatingCount ?? 0} reviews)\n  GOOGLE_PLACE_ID=${p.id}\n`);
}
if (!data.places?.length) console.log("No match found.");
