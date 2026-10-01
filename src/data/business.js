// All business details live here — edit this file, not the components.
// Values marked TODO are placeholders and must be replaced before launch.

// Google Maps feature ID of the shop (from https://maps.app.goo.gl/cRHXvsk9FdyR3c7Y6).
const GOOGLE_FID = "0x31cde1f1078277b3:0x6b2225ea4f3044bf";
const GOOGLE_QUERY = "Cuci Cuci Senawang, Dobi Karpet Xpress";

export const business = {
  name: "Cuci-Cuci Senawang",
  shortName: "Cuci-Cuci",
  whatsapp: "60192762890", // international format, no "+" or dashes
  phone: "019-276 2890",
  phoneHref: "+60192762890", // used for tel: links
  email: "cucicucisenawang@gmail.com",
  owners: ["Herman", "Rizah"],

  // From the company profile / SSM certificate
  legalName: "Rizqiman Gemilang Legacy",
  registrationNo: "201903262495 (NS0229212-P)",
  founded: "2019-09-26",
  customersPerYear: 1400,
  turnaroundDays: "5–7",
  address: {
    street: "89-G, Jalan Bandar Senawang 5, Taipan 2, Pusat Bandar Senawang",
    city: "Senawang",
    postcode: "70450",
    locality: "Seremban",
    state: "Negeri Sembilan",
    country: "MY",
  },
  geo: { lat: 2.7035841, lng: 101.9906038 },
  pickupRadiusKm: 15, // free pickup & delivery radius; transport charge beyond
  coverage: "Negeri Sembilan",
  serviceAreas: ["Seremban", "Senawang", "Nilai", "Port Dickson", "Rembau", "Tampin", "Kuala Pilah", "Jempol", "Jelebu"],


  // Opening hours. day: 0 = Sunday … 6 = Saturday. Times are Malaysia time (24h).
  // Every day except Friday, 9 AM – 5:30 PM.
  hours: [{ days: [0, 1, 2, 3, 4, 6], open: "09:00", close: "17:30" }],
  timezone: "Asia/Kuala_Lumpur",

  // Google Maps → Share → Embed a map → copy the src="…" URL here for the exact
  // pin. Until then, an embed of the listing name is used.
  mapEmbedUrl: "",
  googleMapsUrl: "https://maps.app.goo.gl/cRHXvsk9FdyR3c7Y6",
  // Google Search opens the reviews panel (",1") / write-a-review dialog (",3")
  // for this listing. Google Maps hides reviews from signed-out visitors
  // ("limited view"), so these are more reliable. If you get the
  // g.page/r/…/review link from Google Business Profile → "Ask for reviews",
  // put it in googleWriteReviewUrl instead.
  googleReviewsUrl: `https://www.google.com/search?q=${encodeURIComponent(GOOGLE_QUERY)}#lrd=${GOOGLE_FID},1,,,`,
  googleWriteReviewUrl: `https://www.google.com/search?q=${encodeURIComponent(GOOGLE_QUERY)}#lrd=${GOOGLE_FID},3,,,`,

  // Empty values are hidden everywhere.
  social: {
    instagram: "https://www.instagram.com/cucicuci_senawang",
    threads: "https://www.threads.com/@cucicuci_senawang",
    tiktok: "https://www.tiktok.com/@cucicucisenawang_",
    facebook: "https://www.facebook.com/share/1EsvWXRktz/",
  },

  siteUrl: "https://cucicucisenawang.com",
};

export const hasSocials = Object.values(business.social).some(Boolean);

export const addressLine = [
  business.address.street,
  `${business.address.postcode} ${business.address.locality}`,
  business.address.state,
].join(", ");

export const mapEmbedSrc =
  business.mapEmbedUrl || `https://www.google.com/maps?q=${encodeURIComponent(GOOGLE_QUERY)}&ll=${business.geo.lat},${business.geo.lng}&z=16&output=embed`;

export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${business.geo.lat},${business.geo.lng}`;

export const wazeUrl = `https://waze.com/ul?ll=${business.geo.lat},${business.geo.lng}&navigate=yes`;

export const reviewsUrl = business.googleReviewsUrl;
export const writeReviewUrl = business.googleWriteReviewUrl;
