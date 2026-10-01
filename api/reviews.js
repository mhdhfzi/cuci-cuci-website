// Vercel serverless function: proxies Google Places API (New) → Place Details.
// The API key stays on the server. Reviews are fetched live (not stored) to
// respect Google's content-storage terms; the CDN caches briefly to keep
// costs down.

const LANGS = new Set(["ms", "en"]);

export default async function handler(req, res) {
  const { GOOGLE_PLACES_API_KEY: key, GOOGLE_PLACE_ID: placeId } = process.env;

  // Only ?lang=ms or ?lang=en is accepted. Anything else (extra or junk query
  // params) would create a new CDN cache entry and cost a Google API call, so
  // it is rejected without contacting Google.
  const params = Object.keys(req.query ?? {});
  if (params.length !== 1 || !LANGS.has(req.query.lang)) {
    return res.status(400).json({ error: "Use ?lang=ms or ?lang=en" });
  }

  if (!key || !placeId) {
    return res.status(500).json({ error: "Reviews are not configured" });
  }
  const lang = req.query.lang;
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=${lang}`;

  try {
    const response = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsUri",
      },
    });

    if (!response.ok) {
      console.error("Places API error", response.status, await response.text());
      return res.status(502).json({ error: "Could not load reviews" });
    }

    const data = await response.json();

    const reviews = (data.reviews ?? []).map((r) => ({
      author: r.authorAttribution?.displayName ?? "Google user",
      authorUrl: r.authorAttribution?.uri ?? null,
      photo: r.authorAttribution?.photoUri ?? null,
      rating: r.rating ?? null,
      time: r.relativePublishTimeDescription ?? "",
      text: r.text?.text ?? r.originalText?.text ?? "",
      googleMapsUri: r.googleMapsUri ?? null,
    }));

    // Cache at the edge for 12 hours (reviews change slowly; keeps Google API
    // calls — and cost — low) and serve the stale copy for 2 days while refreshing.
    res.setHeader("Cache-Control", "public, s-maxage=43200, stale-while-revalidate=172800");
    return res.status(200).json({
      rating: data.rating ?? null,
      count: data.userRatingCount ?? 0,
      googleMapsUri: data.googleMapsUri ?? null,
      reviews,
    });
  } catch (err) {
    console.error("Places API request failed", err);
    return res.status(502).json({ error: "Could not load reviews" });
  }
}
