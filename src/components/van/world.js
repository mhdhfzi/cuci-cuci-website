import * as THREE from "three";

// Procedural mini-planet: an equirectangular land/sea texture, a road texture
// for the band the van drives on, and seeded prop placements (trees, houses,
// mosques, clouds) that stay off the road.

export const WORLD_R = 6; // globe radius (van is ~5 long)
export const ROAD_HALF = 1.05; // half-width of the road band (world units, along z)

// Small seeded RNG so the planet looks the same on every visit.
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function texture(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// Returns { map, isLand(dir) }.
export function makeGlobeTexture() {
  const W = 1024;
  const H = 512;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  const rand = rng(9);

  // sea
  const sea = ctx.createLinearGradient(0, 0, 0, H);
  sea.addColorStop(0, "#1e5fae");
  sea.addColorStop(0.5, "#2f86d6");
  sea.addColorStop(1, "#1e5fae");
  ctx.fillStyle = sea;
  ctx.fillRect(0, 0, W, H);

  // continents: clusters of blobs, drawn with wrap-around
  const blob = (x, y, r, color) => {
    ctx.fillStyle = color;
    for (const dx of [-W, 0, W]) {
      ctx.beginPath();
      ctx.arc(x + dx, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  const continents = Array.from({ length: 11 }, () => ({
    x: rand() * W,
    y: 60 + rand() * (H - 120),
    n: 10 + Math.floor(rand() * 18),
    spread: 40 + rand() * 70,
  }));
  const pieces = continents.flatMap((k) =>
    Array.from({ length: k.n }, () => ({
      x: k.x + (rand() - 0.5) * k.spread * 2,
      y: k.y + (rand() - 0.5) * k.spread,
      r: 14 + rand() * 32,
    })),
  );
  for (const p of pieces) blob(p.x, p.y, p.r + 12, "rgba(125,196,240,0.55)"); // shallows
  for (const p of pieces) blob(p.x, p.y, p.r + 5, "#ead9a8"); // beaches
  for (const p of pieces) blob(p.x, p.y, p.r, "#6cbf4b");
  for (const p of pieces) if (rand() < 0.45) blob(p.x + 4, p.y - 3, p.r * 0.55, "#4e9d39"); // forest
  for (const p of pieces) if (rand() < 0.12) blob(p.x - 5, p.y + 2, p.r * 0.35, "#9bd77a"); // meadows

  const data = ctx.getImageData(0, 0, W, H).data;
  // three.js SphereGeometry mapping: x = -cos(phi) sin(theta), y = cos(theta), z = sin(phi) sin(theta)
  const isLand = (dir) => {
    let phi = Math.atan2(dir.z, -dir.x);
    if (phi < 0) phi += Math.PI * 2;
    const theta = Math.acos(THREE.MathUtils.clamp(dir.y, -1, 1));
    const px = Math.min(W - 1, Math.floor((phi / (Math.PI * 2)) * W));
    const py = Math.min(H - 1, Math.floor((theta / Math.PI) * H));
    const i = (py * W + px) * 4;
    return data[i + 1] > data[i + 2]; // green beats blue
  };

  return { map: texture(c), isLand };
}

// Asphalt with a dashed yellow centre line; repeats around the ring.
export function makeRoadTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#1c1c1c";
  ctx.fillRect(0, 0, 256, 128);
  ctx.fillStyle = "#e5e5e5"; // edge lines
  ctx.fillRect(0, 8, 256, 5);
  ctx.fillRect(0, 115, 256, 5);
  ctx.fillStyle = "#facc15";
  ctx.fillRect(20, 60, 110, 8);
  const t = texture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.set(18, 1);
  return t;
}

// Prop placements on the sphere (unit directions), kept clear of the road band.
export function placeProps(isLand, avoid) {
  const rand = rng(21);
  const up = new THREE.Vector3(0, 1, 0);
  const minZ = (ROAD_HALF + 0.45) / WORLD_R;

  const randomDir = () => {
    const v = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1);
    return v.lengthSq() > 1 || v.lengthSq() < 0.01 ? null : v.normalize();
  };
  const tallZ = (ROAD_HALF + 1.3) / WORLD_R; // houses/mosques stay further from the road
  const place = (count, { land = true, clearZ = minZ } = {}) => {
    const out = [];
    let guard = 0;
    while (out.length < count && guard++ < count * 400) {
      const dir = randomDir();
      if (!dir || Math.abs(dir.z) < clearZ) continue;
      if (land && !isLand(dir)) continue;
      if (avoid && dir.dot(avoid) > Math.cos(4.2 / WORLD_R)) continue; // shop plot
      const q = new THREE.Quaternion().setFromUnitVectors(up, dir);
      q.multiply(new THREE.Quaternion().setFromAxisAngle(up, rand() * Math.PI * 2));
      out.push({ dir, q, s: 0.75 + rand() * 0.5 });
    }
    return out;
  };

  return {
    trees: place(60),
    houses: place(12, { clearZ: tallZ }),
    mosques: place(4, { clearZ: tallZ }),
    // clouds float above land or sea, well clear of the van
    clouds: place(16, { land: false, clearZ: 3.4 / WORLD_R }),
  };
}

// ── Our shop (Dobi Karpet Xpress) ──
// Placed just behind the road so that when the world settles after the
// opening drive (≈ REST_ANGLE of spin) the shop is right behind the van.
export const REST_ANGLE = 1.0;
const SHOP_OFFSET = 0.04; // radians; ≈ straight behind the parked van (its rooftop sign shows above it)
export const SHOP_BACK = ROAD_HALF + 2.2; // distance behind the road centre line

export function shopPlacement() {
  const up = new THREE.Vector3(0, 1, 0);
  const a = REST_ANGLE + SHOP_OFFSET;
  const zN = -SHOP_BACK / WORLD_R;
  const ring = Math.sqrt(1 - zN * zN);
  // inverse of the spin: the point that spin(a) brings to the top of the world
  const dir = new THREE.Vector3(Math.sin(a) * ring, Math.cos(a) * ring, zN).normalize();
  return { dir, q: new THREE.Quaternion().setFromUnitVectors(up, dir) };
}

export function makeShopSignTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 200;
  const ctx = c.getContext("2d");
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  const font = '"Bricolage Grotesque", "Plus Jakarta Sans", system-ui, sans-serif';

  const paint = () => {
    ctx.fillStyle = "#0b0b0b";
    ctx.fillRect(0, 0, 1024, 200);
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 1008, 184);
    ctx.textBaseline = "middle";
    ctx.font = `800 92px ${font}`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText("DOBI KARPET", 40, 88);
    const w = ctx.measureText("DOBI KARPET ").width;
    ctx.save();
    ctx.transform(1, 0, -0.18, 1, 0, 0);
    ctx.font = `800 104px ${font}`;
    ctx.fillStyle = "#facc15";
    ctx.fillText("XPRESS", 40 + w + 18, 86);
    ctx.restore();
    ctx.font = `700 30px "Plus Jakarta Sans", system-ui, sans-serif`;
    ctx.fillStyle = "#e5e5e5";
    ctx.fillText("CUCI-CUCI SENAWANG  •  019-276 2890", 44, 160);
    t.needsUpdate = true;
  };
  paint();
  document.fonts?.load(`800 92px "Bricolage Grotesque"`).then(paint).catch(() => {});
  return t;
}