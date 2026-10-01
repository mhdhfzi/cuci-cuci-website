import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/*
  Equipment showcase: a turntable showing one of our machines at a time
  (one model per machine in why.equipment). The parent picks `index` — by
  tapping a machine name or the auto-cycle. Drag to spin.
*/

const { damp } = THREE.MathUtils;

function Studio() {
  const gl = useThree((s) => s.gl);
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
    pmrem.dispose();
    return tex;
  }, [gl]);
  useEffect(() => () => env.dispose(), [env]);
  return <primitive object={env} attach="environment" />;
}

function useMats() {
  return useMemo(() => {
    const std = (o) => new THREE.MeshStandardMaterial(o);
    return {
      yellow: std({ color: "#facc15", metalness: 0.15, roughness: 0.35 }),
      anthracite: std({ color: "#2f3438", metalness: 0.3, roughness: 0.4 }),
      grey: std({ color: "#8a9199", metalness: 0.4, roughness: 0.35 }),
      black: std({ color: "#111111", roughness: 0.6 }),
      chrome: std({ color: "#dfe3e8", metalness: 1, roughness: 0.2 }),
      orange: std({ color: "#f97316", metalness: 0.1, roughness: 0.4 }),
      blue: std({ color: "#1d4ed8", metalness: 0.25, roughness: 0.35 }),
      clear: std({ color: "#bfe6ff", transparent: true, opacity: 0.45, roughness: 0.1 }),
      green: std({ color: "#15803d", metalness: 0.15, roughness: 0.4 }),
      red: std({ color: "#dc2626", metalness: 0.15, roughness: 0.4 }),
      steel: std({ color: "#c7ccd1", metalness: 0.9, roughness: 0.28 }),
      white: std({ color: "#f1f1ee", roughness: 0.45 }),
    };
  }, []);
}

// Kärcher Puzzi-style spray extraction machine
function Extractor({ m }) {
  const hose = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const a = (i / 60) * Math.PI * 5;
      pts.push(new THREE.Vector3(Math.cos(a) * 0.38, 0.95 + i * 0.006, Math.sin(a) * 0.38));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 200, 0.045, 8);
  }, []);
  return (
    <group>
      <mesh position={[0, 0.5, 0]} material={m.anthracite}>
        <cylinderGeometry args={[0.55, 0.5, 0.9, 40]} />
      </mesh>
      <mesh position={[0, 0.98, 0]} material={m.yellow}>
        <cylinderGeometry args={[0.58, 0.58, 0.1, 40]} />
      </mesh>
      <mesh position={[0, 1.08, 0]} material={m.clear}>
        <cylinderGeometry args={[0.36, 0.44, 0.12, 32]} />
      </mesh>
      <mesh geometry={hose} material={m.black} />
      {/* push handle: two yellow tubes + black grip */}
      {[0.22, -0.22].map((z) => (
        <mesh key={z} position={[-0.56, 1.3, z]} rotation={[0, 0, 0.18]} material={m.yellow}>
          <cylinderGeometry args={[0.035, 0.035, 0.8, 12]} />
        </mesh>
      ))}
      <mesh position={[-0.63, 1.68, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.black}>
        <cylinderGeometry args={[0.05, 0.05, 0.54, 12]} />
      </mesh>
      {/* wheels */}
      {[[0.42, 0.3], [0.42, -0.3], [-0.42, 0.3], [-0.42, -0.3]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.09, z]} rotation={[Math.PI / 2, 0, 0]} material={m.black}>
          <cylinderGeometry args={[0.09, 0.09, 0.06, 16]} />
        </mesh>
      ))}
      {/* upholstery hand tool leaning on the side */}
      <mesh position={[0.66, 0.7, 0.2]} rotation={[0.1, 0, -0.25]} material={m.chrome}>
        <cylinderGeometry args={[0.025, 0.025, 1.2, 10]} />
      </mesh>
      <mesh position={[0.82, 0.12, 0.25]} material={m.yellow}>
        <boxGeometry args={[0.14, 0.1, 0.34]} />
      </mesh>
    </group>
  );
}

// Snail-shaped air mover / floor dryer
function AirMover({ m, body = "orange" }) {
  return (
    <group rotation={[0, 0.3, 0]}>
      <mesh position={[0, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]} material={m[body]}>
        <cylinderGeometry args={[0.62, 0.62, 0.6, 40]} />
      </mesh>
      <mesh position={[0.5, 0.42, 0]} material={m[body]}>
        <boxGeometry args={[0.8, 0.44, 0.6]} />
      </mesh>
      <mesh position={[0.92, 0.42, 0]} material={m.black}>
        <boxGeometry args={[0.04, 0.34, 0.5]} />
      </mesh>
      {/* grille */}
      {[0.31, -0.31].map((z) => (
        <group key={z}>
          <mesh position={[0, 0.72, z * 1.01]} rotation={[z > 0 ? 0 : Math.PI, 0, 0]} material={m.black}>
            <circleGeometry args={[0.44, 32]} />
          </mesh>
          {[0.14, 0.26, 0.38].map((r) => (
            <mesh key={r} position={[0, 0.72, z * 1.03]} material={m.grey}>
              <torusGeometry args={[r, 0.012, 6, 40]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* carry handle + feet */}
      <mesh position={[-0.1, 1.42, 0]} rotation={[0, 0, Math.PI / 2]} material={m.black}>
        <torusGeometry args={[0.2, 0.04, 10, 24, Math.PI]} />
      </mesh>
      <mesh position={[0.1, 0.08, 0]} material={m.black}>
        <boxGeometry args={[1.2, 0.16, 0.66]} />
      </mesh>
    </group>
  );
}

// Rotary floor scrubber (mosque & office carpets). `body` recolours the base.
function Scrubber({ m, body = "blue", size = 1 }) {
  return (
    <group scale={size}>
      <mesh position={[0, 0.1, 0]} material={m[body]}>
        <cylinderGeometry args={[0.62, 0.62, 0.2, 48]} />
      </mesh>
      <mesh position={[0, 0.02, 0]} material={m.black}>
        <cylinderGeometry args={[0.58, 0.58, 0.05, 48]} />
      </mesh>
      <mesh position={[0, 0.42, 0]} material={m.grey}>
        <cylinderGeometry args={[0.3, 0.36, 0.46, 32]} />
      </mesh>
      <mesh position={[0, 0.7, 0]} material={m.yellow}>
        <cylinderGeometry args={[0.2, 0.3, 0.12, 32]} />
      </mesh>
      {/* handle tube + bars */}
      <mesh position={[-0.55, 1.25, 0]} rotation={[0, 0, 0.55]} material={m.chrome}>
        <cylinderGeometry args={[0.035, 0.035, 1.9, 12]} />
      </mesh>
      <mesh position={[-1.02, 2.0, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.black}>
        <cylinderGeometry args={[0.045, 0.045, 0.9, 12]} />
      </mesh>
      {[0.42, -0.42].map((z) => (
        <mesh key={z} position={[-1.02, 2.0, z]} material={m.yellow}>
          <sphereGeometry args={[0.07, 12, 8]} />
        </mesh>
      ))}
    </group>
  );
}

// Upright carpet extractor (Bissell Big Green / Viper): tall body, clean-water
// tank on top, floor nozzle, loop handle.
function UprightExtractor({ m, body = "green", tank = "clear" }) {
  return (
    <group>
      <mesh position={[0, 0.62, 0]} material={m[body]}>
        <boxGeometry args={[0.62, 0.95, 0.5]} />
      </mesh>
      <mesh position={[0, 1.2, 0]} material={m[tank]}>
        <boxGeometry args={[0.52, 0.28, 0.4]} />
      </mesh>
      <mesh position={[0.08, 0.1, 0]} material={m.black}>
        <boxGeometry args={[0.85, 0.16, 0.62]} />
      </mesh>
      {[0.2, -0.2].map((z) => (
        <mesh key={z} position={[-0.26, 1.72, z]} rotation={[0, 0, 0.12]} material={m.chrome}>
          <cylinderGeometry args={[0.03, 0.03, 0.9, 10]} />
        </mesh>
      ))}
      <mesh position={[-0.32, 2.16, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.black}>
        <cylinderGeometry args={[0.05, 0.05, 0.46, 12]} />
      </mesh>
      {[0.28, -0.28].map((z) => (
        <mesh key={z} position={[-0.25, 0.14, z]} rotation={[Math.PI / 2, 0, 0]} material={m.black}>
          <cylinderGeometry args={[0.14, 0.14, 0.08, 16]} />
        </mesh>
      ))}
    </group>
  );
}

// Upright brush-type vacuum (Kärcher CV 38/2)
function UprightVacuum({ m, body = "yellow" }) {
  return (
    <group>
      <mesh position={[0.1, 0.1, 0]} material={m.anthracite}>
        <boxGeometry args={[0.55, 0.18, 0.7]} />
      </mesh>
      <mesh position={[-0.05, 0.7, 0]} rotation={[0, 0, 0.12]} material={m[body]}>
        <boxGeometry args={[0.3, 1.0, 0.36]} />
      </mesh>
      <mesh position={[-0.05, 0.72, 0.19]} rotation={[0, 0, 0.12]} material={m.anthracite}>
        <boxGeometry args={[0.2, 0.6, 0.02]} />
      </mesh>
      <mesh position={[-0.22, 1.6, 0]} rotation={[0, 0, 0.12]} material={m.chrome}>
        <cylinderGeometry args={[0.03, 0.03, 0.9, 10]} />
      </mesh>
      <mesh position={[-0.28, 2.05, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.black}>
        <torusGeometry args={[0.12, 0.035, 8, 20]} />
      </mesh>
    </group>
  );
}

// Wet & dry drum vacuum with hose and wand
function DrumVacuum({ m, drum = "yellow" }) {
  const hose = useMemo(() => {
    const pts = [[0.3, 0.9, 0], [0.7, 1.0, 0.1], [0.85, 0.6, 0.2], [0.75, 0.25, 0.25]].map(([x, y, z]) => new THREE.Vector3(x, y, z));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.045, 8);
  }, []);
  return (
    <group>
      <mesh position={[0, 0.45, 0]} material={m[drum]}>
        <cylinderGeometry args={[0.42, 0.38, 0.8, 36]} />
      </mesh>
      <mesh position={[0, 0.92, 0]} material={m.anthracite}>
        <cylinderGeometry args={[0.44, 0.44, 0.2, 36]} />
      </mesh>
      <mesh position={[0, 1.08, 0]} rotation={[0, 0, Math.PI / 2]} material={m.anthracite}>
        <torusGeometry args={[0.16, 0.035, 8, 20, Math.PI]} />
      </mesh>
      <mesh geometry={hose} material={m.black} />
      {[[0.3, 0.3], [0.3, -0.3], [-0.3, 0.3], [-0.3, -0.3]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.05, z]} material={m.black}>
          <sphereGeometry args={[0.06, 10, 8]} />
        </mesh>
      ))}
    </group>
  );
}

// Compact steam cleaner (Kärcher SC 2.500 C) with steam gun
function SteamCleaner({ m }) {
  return (
    <group>
      <mesh position={[0, 0.35, 0]} rotation={[0, 0, Math.PI / 2]} material={m.yellow}>
        <capsuleGeometry args={[0.28, 0.5, 8, 20]} />
      </mesh>
      <mesh position={[0.15, 0.66, 0]} material={m.anthracite}>
        <cylinderGeometry args={[0.1, 0.12, 0.1, 16]} />
      </mesh>
      {[[0.3, 0.26], [0.3, -0.26], [-0.3, 0.26], [-0.3, -0.26]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.07, z]} rotation={[Math.PI / 2, 0, 0]} material={m.black}>
          <cylinderGeometry args={[0.07, 0.07, 0.05, 14]} />
        </mesh>
      ))}
      {/* steam gun + lance leaning on it */}
      <mesh position={[-0.55, 0.6, 0.1]} rotation={[0, 0, -0.35]} material={m.chrome}>
        <cylinderGeometry args={[0.025, 0.025, 1.0, 10]} />
      </mesh>
      <mesh position={[-0.38, 1.05, 0.1]} rotation={[0, 0, -0.35]} material={m.yellow}>
        <boxGeometry args={[0.12, 0.3, 0.1]} />
      </mesh>
    </group>
  );
}

// Carpet spinner (JETspin CR-5500): long orange drum on a stand
function Spinner({ m }) {
  return (
    <group>
      <mesh position={[0, 0.72, 0]} rotation={[0, 0, Math.PI / 2]} material={m.orange}>
        <cylinderGeometry args={[0.36, 0.36, 2.1, 36]} />
      </mesh>
      {[1.06, -1.06].map((x) => (
        <mesh key={x} position={[x, 0.72, 0]} rotation={[0, 0, Math.PI / 2]} material={m.anthracite}>
          <cylinderGeometry args={[0.38, 0.38, 0.06, 36]} />
        </mesh>
      ))}
      {[0.8, -0.8].map((x) => (
        <mesh key={x} position={[x, 0.2, 0]} material={m.anthracite}>
          <boxGeometry args={[0.1, 0.4, 0.6]} />
        </mesh>
      ))}
      <mesh position={[0, 0.02, 0]} material={m.black}>
        <boxGeometry args={[2.0, 0.04, 0.7]} />
      </mesh>
      {/* black stripe (like the JETspin logo band) */}
      <mesh position={[0.1, 0.72, 0]} rotation={[0, 0, Math.PI / 2]} material={m.black}>
        <cylinderGeometry args={[0.365, 0.365, 0.5, 36]} />
      </mesh>
    </group>
  );
}

// One model per entry in why.equipment (same order).
const MODELS = [
  { C: Extractor }, // Kärcher Puzzi 10/1
  { C: UprightVacuum, props: { body: "white" } }, // Kärcher BRS 43/500 C (white upright brush machine)
  { C: SteamCleaner }, // Kärcher SC 2.500 C
  { C: UprightVacuum, props: { body: "grey" } }, // Kärcher CV 38/2
  { C: DrumVacuum, props: { drum: "steel" } }, // Kärcher Wet & Dry (stainless drum)
  { C: UprightExtractor, props: { body: "green", tank: "white" } }, // Bissell Big Green 86T3
  { C: UprightExtractor, props: { body: "black", tank: "black" } }, // Viper CEX410
  { C: Scrubber, props: { body: "blue" } }, // Tommy C18X
  { C: Scrubber, props: { body: "red", size: 0.75 } }, // Roots Wizzard
  { C: AirMover, props: { body: "red" } }, // Ogawa BF-534
  { C: Spinner, scale: 0.95 }, // JETspin CR-5500
];

function Turntable({ spin, index }) {
  const table = useRef(null);
  const items = useRef([]);
  const m = useMats();

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    items.current.forEach((g, i) => {
      if (!g) return;
      // selected machine pops in, the rest shrink away
      g.scale.setScalar(Math.max(damp(g.scale.x, i === index ? 1 : 0, 10, dt), 0.0001));
      g.visible = g.scale.x > 0.002;
    });
    spin.step(dt);
    if (table.current) table.current.rotation.y = spin.angle;
  });

  return (
    <group position={[0, -0.75, 0]}>
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[1.6, 1.7, 0.24, 64]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.6, 64]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>
      <group ref={table}>
        {MODELS.map(({ C, props, scale = 1.3 }, i) => (
          <group key={i} ref={(el) => (items.current[i] = el)} scale={0.0001}>
            <group scale={scale}>
              <C m={m} {...props} />
            </group>
          </group>
        ))}
      </group>
    </group>
  );
}
class Spin {
  angle = 0.4;
  omega = 0.5;
  dragging = false;
  lastX = 0;
  lastT = 0;
  down(x) {
    this.dragging = true;
    this.lastX = x;
    this.lastT = performance.now();
  }
  move(x) {
    if (!this.dragging) return;
    const now = performance.now();
    const d = (x - this.lastX) * 0.01;
    this.angle += d;
    this.omega = THREE.MathUtils.clamp(d / Math.max((now - this.lastT) / 1000, 1 / 240), -6, 6);
    this.lastX = x;
    this.lastT = now;
  }
  up() {
    this.dragging = false;
  }
  step(dt) {
    if (this.dragging) return;
    this.omega = damp(this.omega, 0.5, 1.5, dt); // settles back to a slow idle spin
    this.angle += this.omega * dt;
  }
}

export default function EquipmentScene({ index }) {
  const wrap = useRef(null);
  const [spin] = useState(() => new Spin());
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(wrap.current);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={wrap}
      className="absolute inset-0 cursor-grab select-none active:cursor-grabbing"
      style={{ touchAction: "pan-y" }}
      aria-hidden="true"
      onPointerDown={(e) => {
        spin.down(e.clientX);
        e.currentTarget.setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => spin.move(e.clientX)}
      onPointerUp={() => spin.up()}
      onPointerCancel={() => spin.up()}
    >
      <Canvas
        frameloop={inView ? "always" : "never"}
        camera={{ fov: 30, position: [0, 1.9, 9], near: 2, far: 30 }}
        onCreated={({ camera }) => camera.lookAt(0, 0.35, 0)}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <Studio />
        <hemisphereLight args={["#ffffff", "#333333", 0.7]} />
        <directionalLight position={[4, 7, 5]} intensity={1.8} />
        <directionalLight position={[-5, 3, -4]} intensity={0.6} color="#fff1c2" />
        <Turntable spin={spin} index={index} />
      </Canvas>
    </div>
  );
}
