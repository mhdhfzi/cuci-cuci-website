import { business } from "../data/business";

export function whatsAppLink(text) {
  const base = `https://wa.me/${business.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

// Builds the enquiry message. `labels` comes from the current language so the
// business receives the message in the language the customer used.
export function buildEnquiryMessage(form, labels) {
  return [
    labels.greeting,
    "",
    `*${labels.name}:* ${form.name}`,
    `*${labels.phone}:* ${form.phone}`,
    `*${labels.area}:* ${form.area}`,
    `*${labels.service}:* ${form.serviceLabel}`,
    form.details ? `*${labels.details}:* ${form.details}` : null,
    form.date ? `*${labels.date}:* ${form.date}` : null,
    form.notes ? `*${labels.notes}:* ${form.notes}` : null,
  ]
    .filter((line) => line !== null) // keep "" — it's the blank line after the greeting
    .join("\n");
}

export function buildWhatsAppLink(form, labels) {
  return whatsAppLink(buildEnquiryMessage(form, labels));
}

// Opens WhatsApp in a new tab; falls back to same-tab navigation if a popup
// blocker stops it (common on iOS Safari after async validation).
export function openWhatsApp(url) {
  const w = window.open(url, "_blank");
  if (w) w.opener = null;
  else window.location.href = url;
}
