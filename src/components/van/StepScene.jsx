import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import VanModel from "./VanModel";
import { CARPET_PALETTES, carpetEndTexture, carpetSideTexture } from "./cargo";

/*
  Small looping 3D scenes for the three "How it works" steps:
    1 — a phone with a WhatsApp chat, bubbles popping out of the screen
    2 — the van outside a customer's house, a carpet roll going into it
    3 — a clean carpet unrolling, then sparkling
  Each tile is its own small canvas that only renders while on screen.
*/

const { clamp, smoothstep } = THREE.MathUtils;
const ease = (x) => smoothstep(clamp(x, 0, 1), 0, 1);

function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
}

function Platform({ radius = 4.2 }) {
  return (
    <group>
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[radius, radius + 0.1, 0.24, 64]} />
        <meshStandardMaterial color="#f1f0ec" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.08, radius, 64]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>
    </group>
  );
}

// ── Step 1: phone + WhatsApp chat ──────────────────────────────────────────

function chatTexture(lines) {
  const W = 400;
  const H = 820;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  const font = '"Plus Jakarta Sans", system-ui, sans-serif';
  const paint = () => {
    ctx.fillStyle = "#efeae2";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#075e54";
    ctx.fillRect(0, 0, W, 110);
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(52, 66, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0a0a0a";
    ctx.font = `800 20px ${font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("CC", 52, 67);
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 24px ${font}`;
    ctx.fillText("Cuci-Cuci Senawang", 92, 58);
    ctx.font = `500 17px ${font}`;
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillText("online", 92, 86);

    let y = 150;
    lines.forEach(([text, mine]) => {
      ctx.font = `600 22px ${font}`;
      const tw = Math.min(ctx.measureText(text).width, 260);
      const bw = tw + 36;
      const x = mine ? W - bw - 20 : 20;
      ctx.fillStyle = mine ? "#d9fdd3" : "#ffffff";
      ctx.beginPath();
      ctx.roundRect(x, y, bw, 58, 16);
      ctx.fill();
      ctx.fillStyle = "#111b21";
      ctx.fillText(text, x + 18, y + 30, 260);
      y += 80;
    });
    tex.needsUpdate = true;
  };
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  paint();
  document.fonts?.load(`700 24px "Plus Jakarta Sans"`).then(paint).catch(() => {});
  return tex;
}

function Bubble({ color, position, delay, dots = true }) {
  const ref = useRef(null);
  const geo = useMemo(() => {
    const s = roundedRect(1.5, 0.9, 0.3);
    // little tail
    const tail = new THREE.Shape();
    tail.moveTo(-0.45, -0.38);
    tail.lineTo(-0.7, -0.75);
    tail.lineTo(-0.1, -0.42);
    const g = new THREE.ExtrudeGeometry([s, tail], { depth: 0.18, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 3 });
    g.center();
    return g;
  }, []);
  useFrame(({ clock }) => {
    const t = (clock.elapsedTime + 4 - delay) % 4; // 4 s loop
    const pop = t < 0.45 ? ease(t / 0.45) * 1.08 : t < 0.6 ? 1.08 - (t - 0.45) * 0.53 : t > 3.5 ? 1 - ease((t - 3.5) / 0.5) : 1;
    const g = ref.current;
    if (!g) return;
    g.scale.setScalar(Math.max(pop, 0.001));
    g.position.y = position[1] + Math.sin(clock.elapsedTime * 2 + delay) * 0.08;
  });
  return (
    <group ref={ref} position={position}>
      <mesh geometry={geo}>
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {dots &&
        [-0.35, 0, 0.35].map((x) => (
          <mesh key={x} position={[x, 0.02, 0.17]}>
            <sphereGeometry args={[0.09, 12, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
    </group>
  );
}

function PhoneScene({ chat }) {
  const phone = useRef(null);
  const body = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(2.3, 4.5, 0.38), {
      depth: 0.22,
      bevelEnabled: true,
      bevelSize: 0.06,
      bevelThickness: 0.06,
      bevelSegments: 4,
    });
    g.translate(0, 0, -0.11);
    return g;
  }, []);
  const screen = useMemo(() => chatTexture(chat), [chat]);
  useFrame(({ clock }) => {
    const p = phone.current;
    if (!p) return;
    p.rotation.y = -0.35 + Math.sin(clock.elapsedTime * 0.6) * 0.18;
    p.position.y = 2.35 + Math.sin(clock.elapsedTime * 1.2) * 0.08;
  });
  return (
    <group>
      <Platform radius={3.4} />
      <group ref={phone} position={[-0.3, 2.35, 0]} rotation={[-0.12, -0.35, 0.06]}>
        <mesh geometry={body}>
          <meshStandardMaterial color="#111111" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.18]}>
          <planeGeometry args={[2.08, 4.2]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
        <mesh position={[0, 1.98, 0.19]}>
          <boxGeometry args={[0.6, 0.1, 0.02]} />
          <meshBasicMaterial color="#111111" />
        </mesh>
      </group>
      <Bubble color="#25d366" position={[1.75, 3.6, 0.9]} delay={0} />
      <Bubble color="#facc15" position={[-2.1, 2.2, 1.0]} delay={1.1} />
    </group>
  );
}

// ── Step 2: van picking up a carpet ────────────────────────────────────────

function House({ position, rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1.7, 1.4, 1.5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.72, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.35, 0.8, 4]} />
        <meshStandardMaterial color="#c2410c" roughness={0.7} flatShading />
      </mesh>
      <mesh position={[0.3, 0.45, 0.76]}>
        <planeGeometry args={[0.45, 0.85]} />
        <meshStandardMaterial color="#3f2a1a" />
      </mesh>
      <mesh position={[-0.45, 0.85, 0.76]}>
        <planeGeometry args={[0.4, 0.35]} />
        <meshStandardMaterial color="#2a3542" metalness={0.6} roughness={0.2} />
      </mesh>
    </group>
  );
}

function PickupScene() {
  const wheels = useRef([]);
  const doors = useRef([]);
  const light = useRef(null);
  const roll = useRef(null);
  const rollMats = useMemo(() => {
    const p = CARPET_PALETTES[0];
    const end = new THREE.MeshStandardMaterial({ map: carpetEndTexture(p) });
    return [new THREE.MeshStandardMaterial({ map: carpetSideTexture(p), roughness: 0.95 }), end, end];
  }, []);
  // path from the house door to the van's open back
  const path = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.9, 0.18, 0.2),
        new THREE.Vector3(-1.0, 0.22, 1.1),
        new THREE.Vector3(0.2, 0.4, 1.6),
        new THREE.Vector3(1.05, 0.62, 1.35),
      ]),
    [],
  );
  useFrame(({ clock }) => {
    if (doors.current[0]) doors.current[0].rotation.y = 4.6;
    if (doors.current[1]) doors.current[1].rotation.y = -1.85;
    if (light.current) light.current.intensity = 5;
    const t = clock.elapsedTime % 3.4;
    const r = roll.current;
    if (!r) return;
    const appear = ease(t / 0.4);
    const move = ease((t - 0.4) / 1.9);
    const gone = ease((t - 2.3) / 0.5);
    r.position.copy(path.getPointAt(move));
    r.scale.setScalar(Math.max(appear * (1 - gone), 0.001));
  });
  return (
    <group rotation={[0, -0.25, 0]}>
      <Platform radius={4.2} />
      {/* driveway */}
      <mesh position={[1.1, 0.01, 0.8]} rotation={[-Math.PI / 2, 0, 0.75]}>
        <planeGeometry args={[4.6, 1.5]} />
        <meshStandardMaterial color="#2b2b2b" roughness={0.95} />
      </mesh>
      <House position={[-2.2, 0, -0.9]} rotation={0.35} />
      {[
        [-3.2, 0.8],
        [2.9, -1.9],
        [-0.6, -2.6],
      ].map(([x, z]) => (
        <group key={x} position={[x, 0, z]}>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 0.5, 6]} />
            <meshStandardMaterial color="#7c5a3a" />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <icosahedronGeometry args={[0.42, 0]} />
            <meshStandardMaterial color="#4f9a3a" flatShading />
          </mesh>
        </group>
      ))}
      {/* van, rear towards the house, doors open */}
      <group position={[2.1, 0, 0.6]} rotation={[0, 0.75, 0]} scale={0.56}>
        <VanModel spinRef={wheels} doorsRef={doors} lightRef={light} />
      </group>
      {/* carpet roll being carried in */}
      <mesh ref={roll} rotation={[Math.PI / 2, 0, 0]} material={rollMats}>
        <cylinderGeometry args={[0.17, 0.17, 1.2, 20]} />
      </mesh>
    </group>
  );
}

// ── Step 3: clean carpet unrolling + sparkles ──────────────────────────────

const RUG_L = 5.4;
const RUG_W = 3.0;

function DeliveredScene() {
  const rug = useRef(null);
  const roll = useRef(null);
  const sparkles = useRef([]);
  const tex = useMemo(() => {
    const t = carpetSideTexture(CARPET_PALETTES[1]);
    t.wrapS = THREE.ClampToEdgeWrapping;
    return t;
  }, []);
  const rollMats = useMemo(() => {
    const p = CARPET_PALETTES[1];
    const end = new THREE.MeshStandardMaterial({ map: carpetEndTexture(p) });
    return [new THREE.MeshStandardMaterial({ map: carpetSideTexture(p), roughness: 0.95 }), end, end];
  }, []);
  const spots = useMemo(
    () => [
      [-1.8, 1.1, 0.6, 0],
      [0.3, 1.6, -0.8, 0.7],
      [1.9, 1.0, 0.8, 1.4],
      [-0.4, 2.2, 0.4, 2.1],
      [1.4, 2.4, -0.3, 0.35],
      [-1.2, 1.8, -0.9, 1.05],
    ],
    [],
  );
  useFrame(({ clock }) => {
    const t = clock.elapsedTime % 6;
    // unroll 0–2 s, hold + sparkle 2–5 s, roll back up 5–6 s
    const p = t < 2 ? ease(t / 2) : t < 5 ? 1 : 1 - ease((t - 5) / 1);
    const x0 = -RUG_L / 2;
    const r = rug.current;
    if (r) {
      r.scale.x = Math.max(p, 0.001);
      r.position.x = x0 + (RUG_L * p) / 2;
      tex.repeat.set(Math.max(p, 0.001), 1);
    }
    const radius = THREE.MathUtils.lerp(0.42, 0.1, p);
    const c = roll.current;
    if (c) {
      c.position.set(x0 + RUG_L * p, radius + 0.02, 0);
      c.scale.set(radius / 0.42, 1, radius / 0.42);
      c.rotation.z = -p * 12; // rolls about its own axis as it travels
    }
    const shine = t > 2 && t < 5 ? 1 : 0;
    sparkles.current.forEach((s, i) => {
      if (!s) return;
      const ph = (clock.elapsedTime * 1.6 + spots[i][3]) % 1;
      const k = shine * Math.sin(ph * Math.PI);
      s.scale.set(k * 0.3, k * 0.7, k * 0.3);
      s.rotation.y = clock.elapsedTime * 2;
    });
  });
  return (
    <group rotation={[0, -0.35, 0]}>
      <Platform radius={4.1} />
      {/* rug lying flat; grows from its left edge */}
      <mesh ref={rug} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[RUG_L, RUG_W]} />
        <meshStandardMaterial map={tex} roughness={0.95} />
      </mesh>
      {/* the roll that shrinks as it unrolls (axis across the rug, along z) */}
      <group ref={roll}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={rollMats}>
          <cylinderGeometry args={[0.42, 0.42, RUG_W, 24]} />
        </mesh>
      </group>
      {spots.map(([x, y, z], i) => (
        <mesh key={i} ref={(el) => (sparkles.current[i] = el)} position={[x, y, z]}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={i % 2 ? "#ffffff" : "#facc15"} emissive={i % 2 ? "#ffffff" : "#facc15"} emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// ── Tile ───────────────────────────────────────────────────────────────────

export default function StepScene({ step, chat }) {
  const wrap = useRef(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden="true">
      <Canvas
        frameloop={inView ? "always" : "never"}
        camera={{ fov: 32, position: [0, 5.2, 11], near: 3, far: 40 }}
        onCreated={({ camera }) => camera.lookAt(0, step === 1 ? 1.9 : 0.7, 0)}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <hemisphereLight args={["#ffffff", "#b5b5b5", 1.3]} />
        <directionalLight position={[5, 9, 6]} intensity={1.6} />
        {step === 1 && <PhoneScene chat={chat} />}
        {step === 2 && <PickupScene />}
        {step === 3 && <DeliveredScene />}
      </Canvas>
    </div>
  );
}
