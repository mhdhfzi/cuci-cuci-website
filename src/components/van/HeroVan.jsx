import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import VanModel, { VAN_HEIGHT } from "./VanModel";
import { CARPET_PALETTES } from "./cargo";
import {
  makeGlobeTexture,
  makeRoadTexture,
  makeShopSignTexture,
  placeProps,
  REST_ANGLE,
  ROAD_HALF,
  shopPlacement,
  WORLD_R,
} from "./world";
import { useLang } from "../../i18n";

/*
  Hero: the company van on top of a little planet. Drag left/right to spin
  the world (with momentum); the van drives along the road that wraps around
  it, facing the direction of travel with its wheels rolling. When the world
  comes to rest the van turns to show its back and the rear doors open.
  Every few seconds of rest it takes another short drive on its own.
  Rendering pauses when the hero is scrolled out of view.
*/

const { damp, clamp } = THREE.MathUtils;
const WHEEL_R = 0.4;
const TILT = 0.32; // tip the world towards the camera so its top is visible
const PARK_TURN = 0.78; // yaw offset when parked (shows back + side)
const NEAR_DOOR_OPEN = 4.6;
const FAR_DOOR_OPEN = 1.85;
const DRAG_SENS = 0.0035; // radians of world turn per dragged pixel
const COAST = 1.3; // how fast a flicked world slows down (higher = stops sooner)
const START_OMEGA = 0.9; // opening drive speed
// the van's wheels sit on a curved surface; sink it a touch so none float
const VAN_SINK = WORLD_R - Math.sqrt(WORLD_R * WORLD_R - 1.5 * 1.5) - 0.02;

// World spin physics, shared by the pointer handlers and the render loop.
class WorldSpin {
  // start so the opening drive coasts to rest with our shop behind the van
  angle = REST_ANGLE - START_OMEGA / COAST;
  omega = START_OMEGA;
  dragging = false;
  touched = false;
  lastX = 0;
  lastT = 0;

  down(x) {
    this.dragging = true;
    this.touched = true;
    this.lastX = x;
    this.lastT = performance.now();
  }
  move(x) {
    if (!this.dragging) return;
    const now = performance.now();
    const dtS = Math.max((now - this.lastT) / 1000, 1 / 240);
    // dragging right moves the ground under the van to the right
    const dAngle = -(x - this.lastX) * DRAG_SENS;
    this.angle += dAngle;
    this.omega = clamp(dAngle / dtS, -2.5, 2.5);
    this.lastX = x;
    this.lastT = now;
  }
  up() {
    this.dragging = false;
    // released after holding still → no fling
    if (performance.now() - this.lastT > 120) this.omega = 0;
  }
  // advance momentum; `autoDrive` gives the idle van a nudge until the user drags
  step(dt, autoDrive) {
    if (!this.dragging) {
      this.omega = damp(this.omega, 0, COAST, dt);
      if (Math.abs(this.omega) < 0.004) this.omega = 0;
      if (autoDrive && !this.touched) this.omega = autoDrive;
    }
    this.angle += this.omega * dt;
  }
}

// fade the canvas out at the bottom and both sides so the big globe has no hard edges
const EDGE_FADE =
  "linear-gradient(to bottom, black 70%, transparent 97%), linear-gradient(to right, transparent 2%, black 16%, black 88%, transparent 99%)";

function Environment() {
  const gl = useThree((s) => s.gl);
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return texture;
  }, [gl]);
  useEffect(() => () => env.dispose(), [env]);
  return <primitive object={env} attach="environment" />;
}

// Our shop — a two-storey shoplot like the real one: white walls, black
// "DOBI KARPET XPRESS" rooftop billboard, glass front with the shutter half up, red
// louvres upstairs and customers' carpets leaning outside. Front faces +z
// (towards the road).
function Shop() {
  const m = useMemo(() => {
    const std = (o) => new THREE.MeshStandardMaterial(o);
    return {
      wall: std({ color: "#f3f1ec", roughness: 0.8 }),
      trim: std({ color: "#3a3a3a", roughness: 0.6 }),
      glass: std({ color: "#1c2733", metalness: 0.8, roughness: 0.12, envMapIntensity: 1.3 }),
      shutter: std({ color: "#9aa0a6", metalness: 0.6, roughness: 0.4 }),
      louvre: std({ color: "#b4452f", roughness: 0.6 }),
      floor: std({ color: "#c9c4b8", roughness: 0.9 }),
      sign: std({ map: makeShopSignTexture(), roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
      carpets: CARPET_PALETTES.map(([base]) => std({ color: base, roughness: 0.95 })),
    };
  }, []);
  const F = 1.1; // front face z
  return (
    <group>
      {/* building */}
      <mesh position={[0, 1.55, 0]} material={m.wall}>
        <boxGeometry args={[4.2, 3.1, 2.2]} />
      </mesh>
      <mesh position={[0, 3.16, 0]} material={m.trim}>
        <boxGeometry args={[4.32, 0.14, 2.32]} />
      </mesh>
      {/* pavement in front */}
      <mesh position={[0, 0.04, F + 0.35]} material={m.floor}>
        <boxGeometry args={[4.4, 0.08, 0.7]} />
      </mesh>
      {/* glass shopfront + frames */}
      <mesh position={[0, 0.82, F + 0.01]} material={m.glass}>
        <planeGeometry args={[3.8, 1.36]} />
      </mesh>
      {[-1.9, -0.63, 0.63, 1.9].map((x) => (
        <mesh key={x} position={[x, 0.82, F + 0.03]} material={m.trim}>
          <boxGeometry args={[0.06, 1.4, 0.04]} />
        </mesh>
      ))}
      {/* roller shutter, half up */}
      <mesh position={[-1.26, 1.26, F + 0.05]} material={m.shutter}>
        <boxGeometry args={[1.2, 0.5, 0.05]} />
      </mesh>
      {/* fascia band over the shopfront */}
      <mesh position={[0, 1.72, F + 0.04]} material={m.trim}>
        <boxGeometry args={[4.08, 0.16, 0.06]} />
      </mesh>
      {/* rooftop billboard, tall enough to show above the van parked in front */}
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} position={[x, 3.55, F - 0.3]} material={m.trim}>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
        </mesh>
      ))}
      <mesh position={[0, 4.2, F - 0.3]} material={m.trim}>
        <boxGeometry args={[4.5, 0.96, 0.1]} />
      </mesh>
      <mesh position={[0, 4.2, F - 0.245]} material={m.sign}>
        <planeGeometry args={[4.4, 0.86]} />
      </mesh>
      {/* upstairs windows + red louvres */}
      {[-1.45, -0.5].map((x) => (
        <mesh key={x} position={[x, 2.72, F + 0.01]} material={m.glass}>
          <planeGeometry args={[0.8, 0.5]} />
        </mesh>
      ))}
      {[0.55, 0.8, 1.05, 1.3, 1.55, 1.8].map((x) => (
        <mesh key={x} position={[x, 2.72, F + 0.06]} material={m.louvre}>
          <boxGeometry args={[0.1, 0.72, 0.1]} />
        </mesh>
      ))}
      {/* carpets waiting outside */}
      {[
        [1.25, 0.14, 0],
        [1.5, -0.12, 1],
        [1.72, 0.1, 2],
        [-1.9, -0.1, 3],
      ].map(([x, lean, c]) => (
        <mesh key={x} position={[x, 0.66, F + 0.42]} rotation={[0.18, 0, lean]} material={m.carpets[c]}>
          <cylinderGeometry args={[0.12, 0.12, 1.3, 14]} />
        </mesh>
      ))}
    </group>
  );
}

function Planet() {
  const { map, props, road, shop } = useMemo(() => {
    const g = makeGlobeTexture();
    const shop = shopPlacement();
    return { map: g.map, props: placeProps(g.isLand, shop.dir), road: makeRoadTexture(), shop };
  }, []);
  const mat = useMemo(() => {
    const std = (o) => new THREE.MeshStandardMaterial(o);
    return {
      trunk: std({ color: "#7c5a3a", roughness: 0.9 }),
      leaf: std({ color: "#3f8f35", roughness: 0.85, flatShading: true }),
      leafLight: std({ color: "#62b34a", roughness: 0.85, flatShading: true }),
      wall: std({ color: "#f5f2ea", roughness: 0.8 }),
      roof: std({ color: "#c2410c", roughness: 0.7, flatShading: true }),
      dome: std({ color: "#facc15", metalness: 0.5, roughness: 0.3 }),
      cloud: std({ color: "#ffffff", roughness: 1, flatShading: true }),
    };
  }, []);

  const at = (p, lift = 0) => p.dir.clone().multiplyScalar(WORLD_R - 0.03 + lift);

  return (
    <group>
      <mesh>
        <sphereGeometry args={[WORLD_R, 96, 64]} />
        <meshStandardMaterial map={map} roughness={0.75} metalness={0.05} />
      </mesh>

      {/* road ring the van drives on (a band around the z axis) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[WORLD_R + 0.03, WORLD_R + 0.03, ROAD_HALF * 2, 128, 1, true]} />
        <meshStandardMaterial map={road} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      <group position={shop.dir.clone().multiplyScalar(WORLD_R - 0.06)} quaternion={shop.q}>
        <Shop />
      </group>

      {props.trees.map((p, i) => (
        <group key={`t${i}`} position={at(p)} quaternion={p.q} scale={p.s}>
          <mesh position={[0, 0.2, 0]} material={mat.trunk}>
            <cylinderGeometry args={[0.07, 0.09, 0.4, 6]} />
          </mesh>
          <mesh position={[0, 0.7, 0]} material={i % 3 ? mat.leaf : mat.leafLight}>
            {i % 2 ? <coneGeometry args={[0.34, 0.8, 7]} /> : <icosahedronGeometry args={[0.36, 0]} />}
          </mesh>
        </group>
      ))}

      {props.houses.map((p, i) => (
        <group key={`h${i}`} position={at(p)} quaternion={p.q} scale={p.s}>
          <mesh position={[0, 0.25, 0]} material={mat.wall}>
            <boxGeometry args={[0.7, 0.5, 0.55]} />
          </mesh>
          <mesh position={[0, 0.66, 0]} rotation={[0, Math.PI / 4, 0]} material={mat.roof}>
            <coneGeometry args={[0.56, 0.36, 4]} />
          </mesh>
        </group>
      ))}

      {props.mosques.map((p, i) => (
        <group key={`m${i}`} position={at(p)} quaternion={p.q} scale={p.s * 1.1}>
          <mesh position={[0, 0.3, 0]} material={mat.wall}>
            <boxGeometry args={[0.8, 0.6, 0.8]} />
          </mesh>
          <mesh position={[0, 0.6, 0]} material={mat.dome}>
            <sphereGeometry args={[0.32, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <mesh position={[0.52, 0.55, 0.3]} material={mat.wall}>
            <cylinderGeometry args={[0.07, 0.08, 1.1, 8]} />
          </mesh>
          <mesh position={[0.52, 1.15, 0.3]} material={mat.dome}>
            <coneGeometry args={[0.1, 0.22, 8]} />
          </mesh>
        </group>
      ))}

      {props.clouds.map((p, i) => (
        <group key={`c${i}`} position={at(p, 0.9 + (i % 3) * 0.25)} quaternion={p.q} scale={p.s}>
          {[
            [0, 0, 0, 0.42],
            [0.42, -0.06, 0.05, 0.32],
            [-0.4, -0.08, -0.04, 0.3],
            [0.1, 0.2, -0.1, 0.3],
          ].map(([x, y, z, r], k) => (
            <mesh key={k} position={[x, y, z]} material={mat.cloud}>
              <icosahedronGeometry args={[r, 1]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Scene({ motion }) {
  const world = useRef(null);
  const spin = useRef(null);
  const vanRef = useRef(null);
  const wheels = useRef([]);
  const doors = useRef([]);
  const light = useRef(null);
  const viewport = useThree((s) => s.viewport);
  const st = useRef({ t: 0, still: 0, open: 0, dir: 1, yaw: 0 });

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = st.current;
    const m = motion;
    s.t += dt;

    // world spin: drag sets velocity, momentum decays; after a rest the van
    // takes another short drive on its own
    m.step(dt, s.still > 9 ? 0.55 * s.dir : 0);
    if (spin.current) spin.current.rotation.z = m.angle;

    const moving = Math.abs(m.omega) > 0.02;
    s.still = moving ? 0 : s.still + dt;
    // ω > 0 turns the top of the world towards −x, so the van drives towards +x
    if (moving) s.dir = m.omega > 0 ? 1 : -1;

    // van heading: face the direction of travel; turn to show the back when parked
    const parked = s.still > 0.4;
    const heading = s.dir > 0 ? 0 : Math.PI;
    const target = parked ? (s.dir > 0 ? PARK_TURN : Math.PI - PARK_TURN) : heading;
    let diff = ((target - s.yaw + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (diff < -Math.PI) diff += Math.PI * 2;
    s.yaw += diff * (1 - Math.exp(-(parked ? 2.2 : 7) * dt));

    // doors open once the van has settled
    const wantOpen = s.still > 1.1 ? 1 : 0;
    s.open = damp(s.open, wantOpen, wantOpen ? 2.2 : 9, dt);
    const open = clamp(s.open, 0, 1);
    if (doors.current[0]) doors.current[0].rotation.y = open * NEAR_DOOR_OPEN;
    if (doors.current[1]) doors.current[1].rotation.y = -open * FAR_DOOR_OPEN;
    if (light.current) light.current.intensity = open * 6;

    const v = vanRef.current;
    if (v) {
      v.rotation.y = s.yaw;
      const bump = moving ? Math.sin(s.t * 20) * 0.015 : Math.sin(s.t * 2.2) * 0.008;
      v.position.y = WORLD_R - VAN_SINK + bump;
    }
    // wheels roll with the ground speed under the van
    const ground = m.omega * WORLD_R * dt;
    const along = ground * Math.cos(s.yaw);
    for (const w of wheels.current) if (w) w.rotation.z -= along / WHEEL_R;

    const g = world.current;
    if (g) {
      // big world, only its top in view (like a horizon), van near the upper third
      const k = Math.min((viewport.width * 0.66) / WORLD_R, (viewport.height * 0.62) / WORLD_R);
      g.scale.setScalar(k);
      g.position.y = viewport.height * 0.24 - (WORLD_R + VAN_HEIGHT) * k * Math.cos(TILT);
    }
  });

  return (
    <group ref={world} rotation={[TILT, 0, 0]}>
      <group ref={spin}>
        <Planet />
      </group>
      <VanModel ref={vanRef} spinRef={wheels} doorsRef={doors} lightRef={light} />
    </group>
  );
}

export default function HeroVan() {
  const { t } = useLang();
  const wrap = useRef(null);
  const [motion] = useState(() => new WorldSpin());
  const [inView, setInView] = useState(true);
  const [hint, setHint] = useState(true);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onDown = (e) => {
    motion.down(e.clientX);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setHint(false);
  };
  const onMove = (e) => motion.move(e.clientX);
  const onUp = () => motion.up();

  return (
    <div
      ref={wrap}
      className="absolute cursor-grab select-none active:cursor-grabbing"
      style={{
        inset: "-8% -18% -26% -18%",
        touchAction: "pan-y",
        maskImage: EDGE_FADE,
        WebkitMaskImage: EDGE_FADE,
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
      }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      role="img"
      aria-label={t("hero.worldLabel")}
    >
      <Canvas
        frameloop={inView ? "always" : "never"}
        camera={{ fov: 30, position: [0, 0, 60], near: 30, far: 90 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Environment />
        <hemisphereLight args={["#ffffff", "#3a3a3a", 0.95]} />
        <directionalLight position={[8, 14, 10]} intensity={1.7} />
        <directionalLight position={[-10, 4, -6]} intensity={0.5} color="#fff3c4" />
        <Scene motion={motion} />
      </Canvas>

      {hint && (
        <div className="pointer-events-none absolute right-[21%] bottom-[33%] flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur sm:hidden">
          <span aria-hidden="true">⇆</span> {t("hero.dragShort")}
        </div>
      )}
      {hint && (
        <div className="pointer-events-none absolute top-[12%] left-[20%] hidden flex-col items-start text-sm font-semibold text-white/80 sm:flex">
          {t("hero.drag")}
          <svg viewBox="0 0 80 70" className="mt-1 ml-10 h-12 w-14 text-white/60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M8 4c30 2 56 22 62 56" />
            <path d="M62 52l8 10 8-10" />
          </svg>
        </div>
      )}
    </div>
  );
}
