import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, CheckCheck, ChevronDown, Lock } from "lucide-react";
import { useLang } from "../i18n";
import { business } from "../data/business";
import { serviceOptions } from "../data/services";
import { buildEnquiryMessage, openWhatsApp, whatsAppLink } from "../utils/whatsapp";
import { BrandMark, WhatsAppIcon } from "./icons";
import Reveal from "./Reveal";

// Today's date (YYYY-MM-DD) in the shop's timezone, for the date input `min`.
function todayISO() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: business.timezone }).format(new Date());
}

// Malaysian mobile (01X…) or landline (0X…), optional +60/60 prefix.
const MY_PHONE = /^(?:\+?60|0)(?:1\d{8,9}|[3-9]\d{7,8})$/;

// Error messages are translation keys, resolved at render time so they follow
// the language toggle.
const schema = z.object({
  name: z.string().trim().min(1, "name"),
  phone: z
    .string()
    .trim()
    .refine((v) => MY_PHONE.test(v.replace(/[\s-]/g, "")), "phone"),
  area: z.string().trim().min(1, "area"),
  service: z.enum(serviceOptions, { error: "service" }),
  details: z.string().trim().optional(),
  date: z
    .string()
    .optional()
    .refine((v) => !v || v >= todayISO(), "date"),
  notes: z.string().trim().optional(),
});

const fieldBase =
  "mt-2 block w-full min-h-12 rounded-2xl bg-white px-4 text-base text-ink ring-1 transition-shadow placeholder:text-slate-400 focus:ring-2 focus:outline-none";

function Field({ id, label, optional, help, error, children }) {
  const { t } = useLang();
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold text-ink">
        {label}
        {optional ? (
          <span className="ml-1.5 font-medium text-ink-soft">({t("form.optional")})</span>
        ) : (
          <span className="ml-0.5 text-danger" aria-hidden="true">*</span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {t(`form.errors.${error}`)}
        </p>
      ) : (
        help && (
          <p id={`${id}-help`} className="mt-1.5 text-sm text-ink-soft">
            {help}
          </p>
        )
      )}
    </div>
  );
}

function formatDate(iso, lang) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(lang === "ms" ? "ms-MY" : "en-MY", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
}

// Live WhatsApp-style chat preview of the message that will be sent.
function ChatPreview({ message }) {
  const { t } = useLang();
  const time = useMemo(
    () => new Intl.DateTimeFormat("en-MY", { hour: "numeric", minute: "2-digit", timeZone: business.timezone }).format(new Date()),
    [],
  );

  return (
    <div className="relative mx-auto w-full max-w-sm" aria-label={t("form.preview")} role="region">
      <div className="absolute -inset-4 rounded-[3rem] bg-linear-to-br from-whatsapp/25 to-ocean-400/20 blur-2xl" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-[2.25rem] border-[10px] border-ink bg-ink shadow-2xl">
        <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3 text-white">
          <BrandMark className="size-9" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{business.name}</p>
            <p className="truncate text-xs text-white/75">{t("form.online")}</p>
          </div>
        </div>
        <div
          className="flex min-h-[26rem] flex-col justify-end bg-[#efeae2] p-3"
          style={{
            backgroundImage:
              "radial-gradient(rgb(0 0 0 / 0.04) 1.5px, transparent 1.5px), radial-gradient(rgb(0 0 0 / 0.03) 1px, transparent 1px)",
            backgroundSize: "18px 18px, 11px 11px",
          }}
        >
          <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-[#d9fdd3] px-3 pt-2 pb-1.5 text-[0.9rem] leading-snug text-[#111b21] shadow-sm">
            {message ? (
              <p className="break-words whitespace-pre-line">
                {message.split(/(\*[^*]+\*)/g).map((part, i) =>
                  part.startsWith("*") && part.endsWith("*") ? <strong key={i}>{part.slice(1, -1)}</strong> : part,
                )}
              </p>
            ) : (
              <p className="text-[#667781] italic">{t("form.previewEmpty")}</p>
            )}
            <p className="mt-1 flex items-center justify-end gap-1 text-[0.68rem] text-[#667781]">
              {time}
              <CheckCheck className="size-3.5 text-[#53bdeb]" aria-hidden="true" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EnquiryForm({ selectedService }) {
  const { lang, t } = useLang();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, submitCount },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { name: "", phone: "", area: "", service: "", details: "", date: "", notes: "" },
  });

  // Pre-select the service chosen from a service card.
  useEffect(() => {
    if (selectedService?.id) setValue("service", selectedService.id, { shouldValidate: submitCount > 0 });
  }, [selectedService, setValue, submitCount]);

  const values = useWatch({ control });

  const toMessage = (v) =>
    buildEnquiryMessage(
      {
        ...v,
        serviceLabel: v.service ? t(`services.${v.service}.title`) : "",
        date: formatDate(v.date, lang),
      },
      t("form.message"),
    );

  const anyFilled = ["name", "phone", "area", "service", "details", "date", "notes"].some((k) => values[k]);
  const preview = anyFilled ? toMessage(values) : "";

  // On invalid submit react-hook-form focuses the first invalid field; the
  // summary below is announced via role="alert".
  const onSubmit = (data) => openWhatsApp(whatsAppLink(toMessage(data)));

  const errorCount = Object.keys(errors).length;
  const aria = (name) => ({
    "aria-invalid": errors[name] ? "true" : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });
  const ring = (name) => (errors[name] ? "ring-danger focus:ring-danger" : "ring-line focus:ring-ocean-500");

  return (
    <section id="enquiry" className="relative overflow-hidden bg-white py-20 sm:py-28">
      <div className="absolute top-0 right-0 size-[40rem] translate-x-1/3 -translate-y-1/3 rounded-full bg-ocean-100/60 blur-3xl" aria-hidden="true" />
      <div className="container-page relative grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <Reveal>
          <p className="eyebrow">{t("form.eyebrow")}</p>
          <h2 className="section-title">{t("form.title")}</h2>
          <p className="mt-4 text-lg text-ink-soft">{t("form.subtitle")}</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-10 space-y-5">
            {submitCount > 0 && errorCount > 0 && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-danger ring-1 ring-red-200"
              >
                <AlertCircle className="size-5 shrink-0" aria-hidden="true" />
                {t("form.errorSummary", { count: errorCount })}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="name" label={t("form.name")} error={errors.name?.message}>
                <input id="name" type="text" autoComplete="name" placeholder={t("form.namePh")} className={`${fieldBase} ${ring("name")}`} {...aria("name")} {...register("name")} />
              </Field>
              <Field id="phone" label={t("form.phone")} help={t("form.phoneHelp")} error={errors.phone?.message}>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={t("form.phonePh")}
                  className={`${fieldBase} ${ring("phone")}`}
                  {...aria("phone")}
                  aria-describedby={errors.phone ? "phone-error" : "phone-help"}
                  {...register("phone")}
                />
              </Field>
            </div>

            <Field id="area" label={t("form.area")} help={t("form.areaHelp")} error={errors.area?.message}>
              <input
                id="area"
                type="text"
                autoComplete="street-address"
                placeholder={t("form.areaPh")}
                className={`${fieldBase} ${ring("area")}`}
                {...aria("area")}
                aria-describedby={errors.area ? "area-error" : "area-help"}
                {...register("area")}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="service" label={t("form.service")} error={errors.service?.message}>
                <div className="relative">
                  <select id="service" className={`${fieldBase} appearance-none pr-11 ${ring("service")} ${values.service ? "" : "text-slate-400"}`} {...aria("service")} {...register("service")}>
                    <option value="" disabled>
                      {t("form.servicePh")}
                    </option>
                    {serviceOptions.map((id) => (
                      <option key={id} value={id} className="text-ink">
                        {t(`services.${id}.title`)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-4 mt-1 size-5 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
                </div>
              </Field>
              <Field id="date" label={t("form.date")} optional error={errors.date?.message}>
                <input id="date" type="date" min={todayISO()} className={`${fieldBase} ${ring("date")}`} {...aria("date")} {...register("date")} />
              </Field>
            </div>

            <Field id="details" label={t("form.details")} optional>
              <input id="details" type="text" placeholder={t("form.detailsPh")} className={`${fieldBase} ring-line focus:ring-ocean-500`} {...register("details")} />
            </Field>

            <Field id="notes" label={t("form.notes")} optional>
              <textarea id="notes" rows={3} placeholder={t("form.notesPh")} className={`${fieldBase} resize-y py-3 ring-line focus:ring-ocean-500`} {...register("notes")} />
            </Field>

            <button type="submit" className="btn btn-whatsapp w-full text-lg sm:w-auto sm:px-10">
              <WhatsAppIcon className="size-6 text-whatsapp" />
              {t("form.submit")}
            </button>

            <p className="flex items-start gap-2 text-sm text-ink-soft">
              <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {t("form.privacy")}
            </p>
          </form>
        </Reveal>

        <Reveal delay={150} className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-5 text-center text-sm font-bold tracking-wide text-ink-soft uppercase">{t("form.preview")}</p>
          <ChatPreview message={preview} />
        </Reveal>
      </div>
    </section>
  );
}
