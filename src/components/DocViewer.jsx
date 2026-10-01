import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useLang } from "../i18n";

// Full-screen viewer for certificate images. `doc` = { src, title, width, height } or null.
export default function DocViewer({ doc, onClose }) {
  const { t } = useLang();
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (doc && !d.open) d.showModal();
    if (!doc && d.open) d.close();
    document.body.style.overflow = doc ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [doc]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && ref.current.close()}
      aria-label={doc?.title}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-black/90 p-4 backdrop:bg-black/80 sm:p-8"
    >
      {doc && (
        <div className="flex h-full flex-col items-center justify-center gap-4" onClick={(e) => e.target === e.currentTarget && ref.current.close()}>
          <div className="flex w-full max-w-3xl items-center justify-between gap-4">
            <p className="font-bold text-white">{doc.title}</p>
            <button
              type="button"
              autoFocus
              onClick={() => ref.current.close()}
              aria-label={t("gallery.close")}
              className="grid size-12 shrink-0 place-items-center rounded-full bg-white/10 text-white hover:bg-brand hover:text-ink"
            >
              <X className="size-6" aria-hidden="true" />
            </button>
          </div>
          <img
            src={doc.src}
            alt={doc.title}
            width={doc.width}
            height={doc.height}
            className="max-h-[80dvh] w-auto max-w-full rounded-xl bg-white object-contain shadow-2xl"
          />
        </div>
      )}
    </dialog>
  );
}
