import * as THREE from "three";
import { business } from "../../data/business";

// Van livery drawn on <canvas> and used as textures — recreates the real van's
// wrap (white body, italic black/yellow "CUCI-CUCI SENAWANG", yellow phone
// badge, black lower panel) without shipping extra image files.

const YELLOW = "#facc15";
const INK = "#0a0a0a";
const DISPLAY = '"Bricolage Grotesque", "Plus Jakarta Sans", system-ui, sans-serif';
const BODY = '"Plus Jakarta Sans", system-ui, sans-serif';

function makeTexture(canvas) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// Italic look: skew the context horizontally while drawing text.
function italic(ctx, draw) {
  ctx.save();
  ctx.transform(1, 0, -0.18, 1, 0, 0);
  draw();
  ctx.restore();
}

function pill(ctx, x, y, w, h, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

let logoImage = null;

function drawSide(ctx, w, h) {
  ctx.fillStyle = "#f7f7f5";
  ctx.fillRect(0, 0, w, h);

  // Black lower panel (gently rising towards the front) + yellow speed line
  const panel = (inset) => {
    ctx.beginPath();
    ctx.moveTo(0, h * (0.84 - inset));
    ctx.bezierCurveTo(w * 0.4, h * (0.84 - inset), w * 0.7, h * (0.8 - inset), w, h * (0.74 - inset));
  };
  panel(0);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = INK;
  ctx.fill();
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = h * 0.02;
  panel(0.035);
  ctx.stroke();

  // The rear wheel arch covers roughly the first third of the lower half, so the
  // lettering starts after it (between the wheels, like the real wrap) and the
  // RL emblem sits above the rear wheel.
  if (logoImage?.complete && logoImage.naturalWidth) {
    const size = h * 0.42;
    ctx.drawImage(logoImage, w * 0.07, h * 0.04, size, size);
  }

  // CUCI-CUCI
  italic(ctx, () => {
    ctx.font = `800 ${h * 0.2}px ${DISPLAY}`;
    ctx.fillStyle = INK;
    ctx.textBaseline = "alphabetic";
    ctx.fillText("CUCI-CUCI", w * 0.39, h * 0.24);
  });

  // SENAWANG — big yellow with a thick black outline
  italic(ctx, () => {
    ctx.font = `800 ${h * 0.36}px ${DISPLAY}`;
    ctx.lineJoin = "round";
    ctx.lineWidth = h * 0.045;
    ctx.strokeStyle = INK;
    ctx.strokeText("SENAWANG", w * 0.37, h * 0.58);
    ctx.fillStyle = YELLOW;
    ctx.fillText("SENAWANG", w * 0.37, h * 0.58);
  });

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // DOBI KARPET XPRESS tag, tucked under the name
  pill(ctx, w * 0.4, h * 0.63, w * 0.29, h * 0.095, YELLOW);
  ctx.font = `800 ${h * 0.062}px ${BODY}`;
  ctx.fillStyle = INK;
  ctx.fillText("DOBI KARPET XPRESS", w * 0.545, h * 0.68);

  // Phone badge, top right
  pill(ctx, w * 0.745, h * 0.075, w * 0.235, h * 0.125, YELLOW);
  ctx.font = `800 ${h * 0.078}px ${BODY}`;
  ctx.fillStyle = INK;
  ctx.fillText(business.phone, w * 0.8625, h * 0.14);

  // Tagline + services on the black panel (front half, clear of the rear arch)
  ctx.font = `700 ${h * 0.052}px ${BODY}`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText("BERSIH  •  WANGI  •  CEPAT SIAP", w * 0.53, h * 0.93);
  ctx.fillStyle = YELLOW;
  ctx.fillText("KARPET • TILAM • SOFA • SEAT KERETA", w * 0.83, h * 0.93);

  ctx.textAlign = "left";
}

function drawRear(ctx, w, h) {
  ctx.fillStyle = "#f7f7f5";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = INK;
  ctx.fillRect(0, h * 0.72, w, h * 0.28);
  ctx.textAlign = "center";
  italic(ctx, () => {
    ctx.font = `800 ${h * 0.16}px ${DISPLAY}`;
    ctx.fillStyle = INK;
    ctx.fillText("CUCI-CUCI", w * 0.56, h * 0.28);
    ctx.font = `800 ${h * 0.2}px ${DISPLAY}`;
    ctx.lineWidth = h * 0.03;
    ctx.strokeStyle = INK;
    ctx.strokeText("SENAWANG", w * 0.56, h * 0.52);
    ctx.fillStyle = YELLOW;
    ctx.fillText("SENAWANG", w * 0.56, h * 0.52);
  });
  ctx.font = `800 ${h * 0.12}px ${BODY}`;
  ctx.fillStyle = YELLOW;
  ctx.textBaseline = "middle";
  ctx.fillText(business.phone, w / 2, h * 0.86);
}

// Soft round shadow for under the van.
export function makeShadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, "rgba(0,0,0,0.55)");
  g.addColorStop(0.6, "rgba(0,0,0,0.25)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// Returns { side, rear } textures. They're drawn immediately with fallback
// fonts, then redrawn once the web fonts are ready.
export function makeLiveryTextures() {
  const side = document.createElement("canvas");
  side.width = 1600;
  side.height = 472;
  const rear = document.createElement("canvas");
  rear.width = 800;
  rear.height = 430;

  const textures = { side: makeTexture(side), rear: makeTexture(rear) };
  const paint = () => {
    drawSide(side.getContext("2d"), side.width, side.height);
    drawRear(rear.getContext("2d"), rear.width, rear.height);
    textures.side.needsUpdate = true;
    textures.rear.needsUpdate = true;
  };
  paint();
  logoImage = new Image();
  const logoReady = new Promise((resolve) => {
    logoImage.onload = logoImage.onerror = resolve;
  });
  logoImage.src = "/images/logo-mark.jpg";
  Promise.all([
    document.fonts.load(`800 100px "Bricolage Grotesque"`),
    document.fonts.load(`800 60px "Plus Jakarta Sans"`),
    logoReady,
  ])
    .then(paint)
    .catch(() => {});
  return textures;
}
