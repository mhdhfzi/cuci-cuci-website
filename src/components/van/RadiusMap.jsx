import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import VanModel from "./VanModel";

/*
  3D "free pickup radius" map for the Why Choose Us card. Units are km,
  centred on our shop (x = east, −z = north). Place positions come from their
  real coordinates relative to the shop (2.7036 N, 101.9906 E); roads are
  stylised. The yellow disc is the 15 km free zone; outside it is dimmed.
*/

const MAP = 26; // half-size of the map tile (km)
const RADIUS = 15; // free pickup radius (km)
const VAN_SCALE = 0.75; // the mini van, exaggerated so it reads at map scale
const LABEL = 1.5; // label size multiplier

const SHOP = { lat: 2.7036, lng: 101.9906 };
const km = (lat, lng) => [(lng - SHOP.lng) * 110.9, (lat - SHOP.lat) * 111]; // [east, north]

const PLACES = [
  { name: "Seremban", at: km(2.7258, 101.9424), town: 20 },
  { name: "Sikamat", at: km(2.747, 101.958), town: 6 },
  { name: "Paroi", at: km(2.7446, 101.9894), town: 6 },
  { name: "Rahang", at: km(2.7, 101.95), town: 6 },
  { name: "Rantau", at: km(2.5833, 101.9667), town: 6 },
  { name: "Mantin", at: km(2.8167, 101.9), town: 6 },
  { name: "Labu", at: km(2.7545, 101.8255), town: 5 },
  { name: "Nilai", at: km(2.8167, 101.7985), town: 12 },
  { name: "Rembau", at: km(2.5897, 102.0958), town: 6 },
];

// Stylised roads (east, north) — expressway first
const EXPRESSWAY = [[-26, 16], [-20, 12.2], [-13, 7.5], [-7.5, 3], [-3.5, -0.8], [0.5, -4.5], [4.5, -10], [9, -16], [13, -22], [15, -26]];
const ROADS = [
  [[-5.4, 2.5], [-3.5, 1.5], [0, 0], [4, -1], [9, -2.5], [16, -3], [26, -4]], // Seremban–Senawang–Kuala Pilah
  [[-5.4, 2.5], [-7, 7], [-10, 12.6], [-12, 18], [-14, 26]], // to Mantin
  [[-5.4, 2.5], [-9, 3.8], [-14, 5], [-18.3, 5.6], [-26, 7]], // to Labu
  [[0, 0], [-1, -5], [-2.6, -13.3], [-3, -20], [-2, -26]], // to Rantau
  [[0, 0], [0, 4.5], [-3.6, 4.8], [-5.4, 2.5]], // Paroi – Sikamat
  [[4, -1], [7, -6], [11.7, -12.6], [18, -20]], // to Rembau
];
// Loop the van drives, all inside the free zone
const VAN_LOOP = [[0.6, -0.4], [3.5, 2], [1, 5], [-3.6, 4.8], [-6.2, 2.4], [-5, -1.5], [-2, -3.5]];

const toXZ = ([e, n], y = 0) => new THREE.Vector3(e, y, -n);

function rng(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mapTexture() {
  const S = 2048;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d");
  const px = ([e, n]) => [((e + MAP) / (MAP * 2)) * S, ((MAP - n) / (MAP * 2)) * S];
  const rand = rng(4);

  ctx.fillStyle = "#151515";
  ctx.fillRect(0, 0, S, S);
  // terrain patches (hills / plantations)
  for (let i = 0; i < 70; i++) {
    ctx.fillStyle = rand() < 0.6 ? "rgba(52,78,44,0.35)" : "rgba(34,52,30,0.45)";
    ctx.beginPath();
    ctx.ellipse(rand() * S, rand() * S, 30 + rand() * 120, 20 + rand() * 80, rand() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // river
  ctx.strokeStyle = "rgba(56,120,170,0.55)";
  ctx.lineWidth = 7;
  ctx.beginPath();
  [[-26, -2], [-15, -3], [-8, -1], [-4, -6], [2, -9], [8, -14], [14, -24]].forEach((p, i) => ctx[i ? "lineTo" : "moveTo"](...px(p)));
  ctx.stroke();
  // grid
  ctx.strokeStyle = "rgba(255,255,255,0.045)";
  ctx.lineWidth = 2;
  for (let i = 0; i <= S; i += S / 26) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(S, i); ctx.stroke();
  }
  // roads
  const line = (pts, width, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = ctx.lineCap = "round";
    ctx.beginPath();
    pts.forEach((p, i) => ctx[i ? "lineTo" : "moveTo"](...px(p)));
    ctx.stroke();
  };
  ROADS.forEach((r) => line(r, 9, "#4a4a4a"));
  line([...VAN_LOOP, VAN_LOOP[0]], 9, "#5a5a5a");
  line(EXPRESSWAY, 16, "#6b6b6b");
  line(EXPRESSWAY, 4, "#facc15");
  // dim everything outside the free zone
  const [cx, cy] = px([0, 0]);
  const r = (RADIUS / (MAP * 2)) * S;
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  ctx.rect(0, 0, S, S);
  ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
  ctx.fill("evenodd");
  // soft fade at the tile edges
  const g = ctx.createRadialGradient(S / 2, S / 2, S * 0.3, S / 2, S / 2, S * 0.52);
  g.addColorStop(0, "rgba(10,10,10,0)");
  g.addColorStop(1, "rgba(10,10,10,1)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function labelTexture(text, { fg = "#ffffff", bg = "rgba(10,10,10,0.78)", bold = 700 } = {}) {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  const font = `${bold} 44px "Plus Jakarta Sans", system-ui, sans-serif`;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 48;
  c.width = w;
  c.height = 76;
  ctx.font = font;
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(0, 0, w, 76, 38);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textBaseline = "middle";
  ctx.fillText(text, 24, 40);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return { map: t, aspect: w / 76 };
}

function Label({ text, position, size = 1.3, style }) {
  const { map, aspect } = useMemo(() => labelTexture(text, style), [text, style]);
  return (
    <sprite position={position} scale={[size * LABEL * aspect, size * LABEL, 1]} renderOrder={10}>
      <spriteMaterial map={map} depthTest={false} transparent />
    </sprite>
  );
}

function Buildings() {
  const ref = useRef(null);
  const count = PLACES.reduce((s, p) => s + p.town, 0) + 14;
  useEffect(() => {
    const rand = rng(12);
    const m = new THREE.Matrix4();
    let i = 0;
    const add = ([e, n], spread, k) => {
      for (let j = 0; j < k; j++) {
        const h = 0.4 + rand() * (spread > 1.5 ? 1.6 : 0.9);
        const w = 0.35 + rand() * 0.45;
        m.compose(
          new THREE.Vector3(e + (rand() - 0.5) * spread * 2, h / 2, -(n + (rand() - 0.5) * spread * 2)),
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * 1.5),
          new THREE.Vector3(w, h, w),
        );
        ref.current.setMatrixAt(i++, m);
      }
    };
    PLACES.forEach((p) => add(p.at, p.town > 10 ? 2 : 1.1, p.town));
    add([1.2, 1], 1.4, 14); // Senawang around the shop
    ref.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <boxGeometry />
      <meshStandardMaterial color="#3a3a3a" roughness={0.7} />
    </instancedMesh>
  );
}

function Pin() {
  const ref = useRef(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = 1.6 + Math.sin(clock.elapsedTime * 2) * 0.25;
  });
  return (
    <group ref={ref} scale={1.35}>
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.9, 24, 16]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.62, 1.5, 24]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 1.1, 0.78]}>
        <circleGeometry args={[0.36, 20]} />
        <meshBasicMaterial color="#0a0a0a" />
      </mesh>
    </group>
  );
}

function Zone() {
  const pulse = useRef(null);
  const edge = useRef(null);
  useFrame(({ clock }) => {
    const t = (clock.elapsedTime % 3.2) / 3.2;
    if (pulse.current) {
      pulse.current.scale.setScalar(0.05 + t * 0.95);
      pulse.current.material.opacity = 0.55 * (1 - t);
    }
    if (edge.current) edge.current.material.opacity = 0.75 + Math.sin(clock.elapsedTime * 2.4) * 0.2;
  });
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
      <mesh>
        <circleGeometry args={[RADIUS, 96]} />
        <meshBasicMaterial color="#facc15" transparent opacity={0.07} depthWrite={false} />
      </mesh>
      <mesh ref={edge} position={[0, 0, 0.01]}>
        <ringGeometry args={[RADIUS - 0.18, RADIUS + 0.18, 128]} />
        <meshBasicMaterial color="#facc15" transparent opacity={0.9} depthWrite={false} />
      </mesh>
      <mesh ref={pulse} position={[0, 0, 0.02]}>
        <ringGeometry args={[RADIUS - 0.5, RADIUS, 128]} />
        <meshBasicMaterial color="#facc15" transparent opacity={0.5} depthWrite={false} />
      </mesh>
    </group>
  );
}

function MiniVan() {
  const van = useRef(null);
  const wheels = useRef([]);
  const doors = useRef([]);
  const light = useRef(null);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(VAN_LOOP.map((p) => toXZ(p)), true, "catmullrom", 0.5), []);
  const st = useRef({ u: 0 });
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const len = curve.getLength();
    const speed = 2.2; // km/s on the map
    st.current.u = (st.current.u + (speed * dt) / len) % 1;
    const p = curve.getPointAt(st.current.u);
    const tan = curve.getTangentAt(st.current.u);
    const g = van.current;
    if (!g) return;
    g.position.set(p.x, 0.05, p.z);
    g.rotation.y = Math.atan2(-tan.z, tan.x);
    for (const w of wheels.current) if (w) w.rotation.z -= (speed * dt) / VAN_SCALE / 0.4; // map km → van units → wheel turns
  });
  return (
    <group ref={van} scale={VAN_SCALE}>
      <VanModel spinRef={wheels} doorsRef={doors} lightRef={light} />
    </group>
  );
}

function Rig({ pointer }) {
  const camera = useThree((s) => s.camera);
  const aspect = useThree((s) => s.size.width / s.size.height);
  const t = useRef(0);
  // aim a little south of the shop so the zone sits higher in the card
  const target = useMemo(() => new THREE.Vector3(-1, 0, 4.5), []);
  useFrame((_, dt) => {
    t.current += Math.min(dt, 0.05);
    const az = -0.35 + Math.sin(t.current * 0.18) * 0.28 + pointer.current.x * 0.18;
    const polar = 0.86 - pointer.current.y * 0.06; // radians from vertical
    // pull back on narrower cards so the whole 15 km ring stays in view
    const dist = 50 / Math.min(1, aspect / 1.3);
    camera.position.set(
      target.x + Math.sin(az) * Math.sin(polar) * dist,
      Math.cos(polar) * dist,
      target.z + Math.cos(az) * Math.sin(polar) * dist,
    );
    camera.lookAt(target);
  });
  return null;
}

export default function RadiusMap({ shopLabel }) {
  const wrap = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [inView, setInView] = useState(true);
  const texture = useMemo(() => mapTexture(), []);

  useEffect(() => {
    const el = wrap.current;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = wrap.current.getBoundingClientRect();
    pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
  };

  return (
    <div ref={wrap} className="absolute inset-0" onPointerMove={onMove} aria-hidden="true">
      <Canvas
        frameloop={inView ? "always" : "never"}
        camera={{ fov: 36, position: [0, 30, 30], near: 5, far: 140 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <hemisphereLight args={["#ffffff", "#222222", 1.1]} />
        <directionalLight position={[10, 25, 12]} intensity={1.6} />
        <Rig pointer={pointer} />

        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[MAP * 2, MAP * 2]} />
          <meshStandardMaterial map={texture} roughness={0.95} />
        </mesh>
        <Zone />
        <Buildings />
        <MiniVan />
        <Pin />

        <Label text={shopLabel} position={[3.2, 6.2, 0.6]} size={1.4} style={{ fg: "#0a0a0a", bg: "#facc15", bold: 800 }} />
        <Label text="15 km" position={toXZ([RADIUS * 0.55, -RADIUS * 0.83], 0.9)} size={1.4} style={{ fg: "#0a0a0a", bg: "#facc15", bold: 800 }} />
        {PLACES.map((p) => {
          const outside = Math.hypot(...p.at) > RADIUS;
          return (
            <Label
              key={p.name}
              text={p.name}
              position={toXZ(p.at, 3)}
              size={p.town > 10 ? 1.25 : 1.05}
              style={outside ? { fg: "#a3a3a3", bg: "rgba(10,10,10,0.6)", bold: 600 } : undefined}
            />
          );
        })}
      </Canvas>
    </div>
  );
}
