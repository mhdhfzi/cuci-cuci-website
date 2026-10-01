import * as THREE from "three";

// Canvas textures for the rolled carpets in the van: a patterned side (the
// rolled-up back of the rug) and a spiral end cap showing the layers.

function canvasTexture(draw, w = 256, h = 256) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// [base, accent, border] — Persian-style reds, a blue, a green, a beige
export const CARPET_PALETTES = [
  ["#8f1d2c", "#e7c27a", "#2c1a45"],
  ["#1f3a6e", "#e9dcc2", "#b8862f"],
  ["#2f5b3a", "#e0c066", "#6b2a1f"],
  ["#c9b28c", "#7a2b2b", "#3d3a5c"],
];

export function carpetSideTexture([base, accent, border]) {
  return canvasTexture(
    (ctx, w, h) => {
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);
      // borders along both ends of the roll
      ctx.fillStyle = border;
      ctx.fillRect(0, 0, w, h * 0.1);
      ctx.fillRect(0, h * 0.9, w, h * 0.1);
      ctx.fillStyle = accent;
      ctx.fillRect(0, h * 0.1, w, h * 0.025);
      ctx.fillRect(0, h * 0.875, w, h * 0.025);
      // repeating diamond medallions
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      for (let x = 0; x < w; x += 42) {
        for (let y = h * 0.18; y < h * 0.84; y += 46) {
          ctx.beginPath();
          ctx.moveTo(x + 21, y);
          ctx.lineTo(x + 38, y + 18);
          ctx.lineTo(x + 21, y + 36);
          ctx.lineTo(x + 4, y + 18);
          ctx.closePath();
          ctx.stroke();
          ctx.fillStyle = border;
          ctx.fillRect(x + 18, y + 15, 6, 6);
        }
      }
    },
    256,
    256,
  );
}

export function carpetEndTexture([base, accent]) {
  return canvasTexture((ctx, w, h) => {
    ctx.fillStyle = "#e9e2d0"; // backing
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = base;
    ctx.lineWidth = 7;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 14; a += 0.08) {
      const r = 6 + a * 2.7;
      const x = w / 2 + Math.cos(a) * r;
      const y = h / 2 + Math.sin(a) * r;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.stroke();
  }, 128, 128);
}
