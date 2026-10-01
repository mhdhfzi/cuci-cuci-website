// Decides once, at load, whether to show the scroll-driven 3D van.
// Skipped for: reduced-motion users, data-saver, no WebGL, and very low-memory
// devices. Everyone else gets the 3D journey; the rest see the 2D site
// (hero carpet illustration etc.), so nothing is missing for them.
function detect() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const conn = navigator.connection;
  if (conn?.saveData) return false;
  if (navigator.deviceMemory && navigator.deviceMemory < 2) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export const can3D = detect();
