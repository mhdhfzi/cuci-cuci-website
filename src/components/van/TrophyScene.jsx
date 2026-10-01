import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/*
  Gold trophy for the Kärcher "Excellence in Cleaning Services Award 2024".
  Slowly turns, tilts towards the mouse, sparkles; pauses off-screen.
*/

function Studio() {
  const gl = useThree((s) => s.gl);
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.02).texture;
    pmrem.dispose();
    return tex;
  }, [gl]);
  useEffect(() => () => env.dispose(), [env]);
  return <primitive object={env} attach="environment" />;
}

function plateTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 256;
  const ctx = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const paint = () => {
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "#fde68a");
    g.addColorStop(0.5, "#facc15");
    g.addColorStop(1, "#ca8a04");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 256);
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = 8;
    ctx.strokeRect(14, 14, 996, 228);
    ctx.fillStyle = "#0a0a0a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 64px "Bricolage Grotesque", "Plus Jakarta Sans", system-ui, sans-serif`;
    ctx.fillText("EXCELLENCE IN CLEANING", 512, 92);
    ctx.font = `700 50px "Plus Jakarta Sans", system-ui, sans-serif`;
    ctx.fillText("KÄRCHER · 2024", 512, 172);
    tex.needsUpdate = true;
  };
  paint();
  document.fonts?.load(`800 64px "Bricolage Grotesque"`).then(paint).catch(() => {});
  return tex;
}

function Trophy({ pointer }) {
  const group = useRef(null);
  const sparkles = useRef([]);
  const gold = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#f5c542", metalness: 1, roughness: 0.18, envMapIntensity: 1.4 }),
    [],
  );
  const cup = useMemo(() => {
    // profile of the cup (radius, height), revolved around the y axis
    const pts = [
      [0.0, 0], [0.34, 0], [0.34, 0.08], [0.12, 0.16], [0.1, 0.62], [0.2, 0.74],
      [0.62, 0.95], [0.9, 1.35], [1.02, 1.85], [1.06, 2.1], [0.98, 2.12], [0.92, 1.88],
      [0.8, 1.4], [0.55, 1.08], [0, 1.02],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 64);
  }, []);
  const star = useMemo(() => {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 0.14 : 0.32;
      const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
      s[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r);
    }
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 });
    g.center();
    return g;
  }, []);
  const plate = useMemo(() => plateTexture(), []);
  const spots = useMemo(
    () => [
      [-1.25, 2.6, 0.4, 0],
      [1.3, 2.2, 0.2, 0.4],
      [0.95, 3.25, -0.3, 0.8],
      [-0.8, 1.5, 0.6, 1.2],
      [1.45, 1.1, 0.5, 1.6],
    ],
    [],
  );

  useFrame(({ clock }, dt) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime;
    g.rotation.y += Math.min(dt, 0.05) * 0.45;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, pointer.current.y * 0.12, 3, dt);
    g.position.y = Math.sin(t * 1.3) * 0.05;
    sparkles.current.forEach((s, i) => {
      if (!s) return;
      const k = Math.sin(((t * 0.7 + spots[i][3]) % 1) * Math.PI); // 0 → 1 → 0 twinkle
      s.scale.set(k * 0.09, k * 0.24, k * 0.09);
      s.rotation.y = t * 2;
    });
  });

  return (
    <group position={[0, -1.7, 0]}>
      <group ref={group}>
        {/* base */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[1.9, 0.6, 1.3]} />
          <meshStandardMaterial color="#111111" metalness={0.4} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.3, 0.651]}>
          <planeGeometry args={[1.76, 0.44]} />
          <meshStandardMaterial map={plate} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.66, 0]}>
          <boxGeometry args={[1.3, 0.12, 0.9]} />
          <meshStandardMaterial color="#1c1c1c" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* cup */}
        <mesh geometry={cup} material={gold} position={[0, 0.72, 0]} />
        {/* handles */}
        {[1, -1].map((s) => (
          <mesh key={s} position={[s * 0.98, 2.22, 0]} rotation={[0, 0, s * 0.25]} material={gold}>
            <torusGeometry args={[0.32, 0.055, 12, 32, Math.PI * 1.35]} />
          </mesh>
        ))}
        {/* star on top */}
        <mesh geometry={star} material={gold} position={[0, 3.2, 0]} />
        <mesh position={[0, 2.95, 0]} material={gold}>
          <cylinderGeometry args={[0.05, 0.08, 0.2, 12]} />
        </mesh>
      </group>
      {spots.map(([x, y, z], i) => (
        <mesh key={i} ref={(el) => (sparkles.current[i] = el)} position={[x, y, z]}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={i % 2 ? "#ffffff" : "#fde68a"} />
        </mesh>
      ))}
    </group>
  );
}

export default function TrophyScene() {
  const wrap = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(wrap.current);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={wrap}
      className="absolute inset-0"
      aria-hidden="true"
      onPointerMove={(e) => {
        const r = wrap.current.getBoundingClientRect();
        pointer.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
      }}
    >
      <Canvas
        frameloop={inView ? "always" : "never"}
        camera={{ fov: 30, position: [0, 0.6, 9], near: 2, far: 30 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <Studio />
        <hemisphereLight args={["#ffffff", "#333333", 0.6]} />
        <directionalLight position={[4, 6, 5]} intensity={2} />
        <directionalLight position={[-5, 3, -3]} intensity={0.8} color="#fff1c2" />
        <Trophy pointer={pointer} />
      </Canvas>
    </div>
  );
}
