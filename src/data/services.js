// Service list. `id` is also the value sent in the WhatsApp enquiry.
// Text lives in src/data/i18n.js under services.<id>.
export const services = [
  { id: "carpet", icon: "rug" },
  { id: "mattress", icon: "bed" },
  { id: "sofa", icon: "sofa" },
  { id: "carseat", icon: "car" },
  { id: "mosque", icon: "mosque" },
  { id: "office", icon: "office" },
];

export const serviceOptions = [...services.map((s) => s.id), "other"];

// Gallery photos/videos live in src/data/gallery.js.
