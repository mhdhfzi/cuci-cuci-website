import { forwardRef, useMemo } from "react";
import * as THREE from "three";
import { makeLiveryTextures, makeShadowTexture } from "./livery";
import { CARPET_PALETTES, carpetEndTexture, carpetSideTexture } from "./cargo";

// A stylised Hiace-style panel van built from primitives. Units ≈ metres.
// Origin: ground level, centre of the van. Forward = +x, left side = +z.
// The cargo area is a hollow shell with two rear barn doors (animated by the
// parent through `doorsRef`) and carpets + cleaning machines inside.
export const VAN_LENGTH = 4.95;
export const VAN_HEIGHT = 2.1;

const WIDTH = 1.8; // body width before bevel
const HALF = WIDTH / 2 + 0.08; // outer side surface (incl. bevel)
const WHEEL_R = 0.4;
const WHEELS = [
  [1.55, HALF - 0.12],
  [1.55, -(HALF - 0.12)],
  [-1.45, HALF - 0.12],
  [-1.45, -(HALF - 0.12)],
];

// Cargo shell (matches the extruded cab's outer surface incl. its 0.08 bevel)
const REAR_X = -2.28;
const SHELL_FRONT_X = -0.45; // overlaps into the cab body to hide the seam
const SHELL_LEN = SHELL_FRONT_X - REAR_X;
const SHELL_MID_X = (SHELL_FRONT_X + REAR_X) / 2;
const FLOOR_Y = 0.36;
const ROOF_Y = 2.16;
const WALL = 0.06;

// Side profile of the cab section (x = length, y = height). The cargo box
// behind it is built separately so the back can be open.
function cabShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.62, 0.32);
  s.lineTo(2.25, 0.32);
  s.quadraticCurveTo(2.42, 0.32, 2.42, 0.5);
  s.lineTo(2.4, 0.98);
  s.quadraticCurveTo(2.38, 1.14, 2.2, 1.17);
  s.lineTo(1.9, 1.22); // hood → base of windshield
  s.lineTo(1.4, 1.98); // windshield
  s.quadraticCurveTo(1.32, 2.08, 1.15, 2.08);
  s.lineTo(-0.62, 2.08); // roof (continues as the cargo roof)
  s.lineTo(-0.62, 0.32);
  return s;
}

function useMaterials() {
  return useMemo(() => {
    const livery = makeLiveryTextures();
    // rear-door graphic split across the two doors
    const rearLeft = livery.rear.clone();
    const rearRight = livery.rear.clone();
    rearLeft.repeat.set(0.5, 1);
    rearRight.repeat.set(0.5, 1);
    rearRight.offset.set(0.5, 0);
    rearLeft.needsUpdate = rearRight.needsUpdate = true;

    const std = (o) => new THREE.MeshStandardMaterial(o);
    return {
      paint: std({ color: "#f4f4f2", metalness: 0.25, roughness: 0.32 }),
      lining: std({ color: "#d9d9d6", metalness: 0.05, roughness: 0.8 }),
      floor: std({ color: "#2b2b2b", roughness: 0.95 }),
      trim: std({ color: "#111111", metalness: 0.2, roughness: 0.6 }),
      glass: std({ color: "#2a3542", metalness: 0.9, roughness: 0.05, envMapIntensity: 1.4 }),
      tire: std({ color: "#161616", roughness: 0.92 }),
      rim: std({ color: "#c9cdd2", metalness: 0.85, roughness: 0.3 }),
      hub: std({ color: "#facc15", metalness: 0.4, roughness: 0.35 }),
      headlight: std({ color: "#fffbe6", emissive: "#fff3c4", emissiveIntensity: 1.2 }),
      taillight: std({ color: "#b91c1c", emissive: "#7f1d1d", emissiveIntensity: 0.8 }),
      side: std({ map: livery.side, metalness: 0.2, roughness: 0.35, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
      // wheel arches sit on top of the side graphic
      arch: std({ color: "#111111", metalness: 0.2, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
      doorLeft: std({ map: rearLeft, metalness: 0.2, roughness: 0.35 }),
      doorRight: std({ map: rearRight, metalness: 0.2, roughness: 0.35 }),
      shadow: new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false }),
      // machines
      machineGrey: std({ color: "#5b6169", metalness: 0.3, roughness: 0.45 }),
      machineYellow: std({ color: "#facc15", metalness: 0.2, roughness: 0.4 }),
      machineBlue: std({ color: "#1d4ed8", metalness: 0.3, roughness: 0.4 }),
      machineOrange: std({ color: "#f97316", metalness: 0.15, roughness: 0.45 }),
      chrome: std({ color: "#d4d8dd", metalness: 0.9, roughness: 0.25 }),
      white: std({ color: "#f1f1ee", roughness: 0.5 }),
      carpets: CARPET_PALETTES.map((p) => [
        std({ map: carpetSideTexture(p), roughness: 0.95 }),
        std({ map: carpetEndTexture(p), roughness: 0.95 }),
      ]),
    };
  }, []);
}

function Wheel({ position, m, spinRef, index }) {
  return (
    <group position={[position[0], WHEEL_R, position[1]]}>
      <group ref={(el) => (spinRef.current[index] = el)}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={m.tire}>
          <cylinderGeometry args={[WHEEL_R, WHEEL_R, 0.28, 32]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={m.rim}>
          <cylinderGeometry args={[0.25, 0.25, 0.29, 20]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={m.hub}>
          <cylinderGeometry args={[0.08, 0.08, 0.3, 12]} />
        </mesh>
        {[0, 1, 2].map((k) => (
          <mesh key={k} rotation={[0, 0, (k * Math.PI) / 3]} material={m.trim}>
            <boxGeometry args={[0.46, 0.05, 0.295]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Hollow cargo box: two walls, roof, floor, interior lining. Open at the back.
function CargoShell({ m }) {
  const wallH = ROOF_Y - 0.24;
  const wallY = 0.24 + wallH / 2;
  return (
    <group>
      {[1, -1].map((side) => (
        <group key={side}>
          <mesh position={[SHELL_MID_X, wallY, side * (HALF - WALL / 2)]} material={m.paint}>
            <boxGeometry args={[SHELL_LEN, wallH, WALL]} />
          </mesh>
          {/* interior lining so the inside reads as a cargo area */}
          <mesh position={[SHELL_MID_X, wallY, side * (HALF - WALL - 0.002)]} rotation={[0, side > 0 ? Math.PI : 0, 0]} material={m.lining}>
            <planeGeometry args={[SHELL_LEN, wallH]} />
          </mesh>
        </group>
      ))}
      <mesh position={[SHELL_MID_X, ROOF_Y - WALL / 2, 0]} material={m.paint}>
        <boxGeometry args={[SHELL_LEN, WALL, HALF * 2]} />
      </mesh>
      <mesh position={[SHELL_MID_X, ROOF_Y - WALL - 0.002, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.lining}>
        <planeGeometry args={[SHELL_LEN, HALF * 2 - WALL * 2]} />
      </mesh>
      <mesh position={[SHELL_MID_X, (0.24 + FLOOR_Y) / 2, 0]} material={m.floor}>
        <boxGeometry args={[SHELL_LEN, FLOOR_Y - 0.24, HALF * 2 - WALL * 2]} />
      </mesh>
      {/* bulkhead behind the cab seats */}
      <mesh position={[SHELL_FRONT_X - 0.05, (FLOOR_Y + ROOF_Y) / 2, 0]} rotation={[0, Math.PI / 2, 0]} material={m.lining}>
        <planeGeometry args={[HALF * 2 - WALL * 2, ROOF_Y - FLOOR_Y]} />
      </mesh>
      {/* black door-frame seal around the opening */}
      <mesh position={[REAR_X + 0.01, ROOF_Y - 0.05, 0]} material={m.trim}>
        <boxGeometry args={[0.04, 0.1, HALF * 2]} />
      </mesh>
    </group>
  );
}

// Two barn doors hinged on the outer rear edges. doorsRef.current[0|1] are the
// hinge groups; the parent rotates them (left door +y, right door −y) to open.
function RearDoors({ m, doorsRef }) {
  const doorH = ROOF_Y - FLOOR_Y - 0.08;
  const doorW = HALF - 0.01;
  return [1, -1].map((side, i) => (
    <group key={side} position={[REAR_X, 0, side * (HALF + 0.03)]} ref={(el) => (doorsRef.current[i] = el)}>
      <mesh position={[-0.025, FLOOR_Y + 0.04 + doorH / 2, -side * (doorW / 2)]} material={m.paint}>
        <boxGeometry args={[0.05, doorH, doorW]} />
      </mesh>
      {/* outer face graphic (half of the rear livery each) */}
      <mesh
        position={[-0.052, FLOOR_Y + 0.04 + doorH * 0.52, -side * (doorW / 2)]}
        rotation={[0, -Math.PI / 2, 0]}
        material={side > 0 ? m.doorRight : m.doorLeft}
      >
        <planeGeometry args={[doorW, doorW * (430 / 400)]} />
      </mesh>
      <mesh position={[-0.06, FLOOR_Y + doorH * 0.45, -side * (doorW - 0.12)]} material={m.trim}>
        <boxGeometry args={[0.04, 0.22, 0.05]} />
      </mesh>
    </group>
  ));
}

function CarpetRoll({ x, y, z, r, len, carpet }) {
  // cylinder groups: [side, top cap, bottom cap]
  return (
    <mesh position={[x, y, z]} rotation={[0, 0, Math.PI / 2]} material={[carpet[0], carpet[1], carpet[1]]}>
      <cylinderGeometry args={[r, r, len, 28]} />
    </mesh>
  );
}

// A full load: customers' carpets stacked three high on the left, folded rugs,
// sofa cushions and a mattress, and machines for all six services on the right.
// Cargo area spans x −2.2 … −0.5, z −0.9 … 0.9, y FLOOR_Y … ~2.0.
function Cargo({ m }) {
  const f = FLOOR_Y;
  const c = m.carpets;
  return (
    <group>
      {/* ── rolled carpets, left side, three layers ── */}
      <CarpetRoll x={-1.55} y={f + 0.17} z={0.72} r={0.17} len={1.28} carpet={c[0]} />
      <CarpetRoll x={-1.55} y={f + 0.16} z={0.39} r={0.16} len={1.28} carpet={c[1]} />
      <CarpetRoll x={-1.55} y={f + 0.47} z={0.56} r={0.16} len={1.28} carpet={c[2]} />
      <CarpetRoll x={-1.55} y={f + 0.45} z={0.24} r={0.15} len={1.28} carpet={c[0]} />
      <CarpetRoll x={-1.55} y={f + 0.75} z={0.7} r={0.14} len={1.28} carpet={c[3]} />
      <CarpetRoll x={-1.55} y={f + 0.74} z={0.41} r={0.14} len={1.28} carpet={c[1]} />
      <CarpetRoll x={-1.55} y={f + 1.0} z={0.56} r={0.12} len={1.28} carpet={c[2]} />

      {/* two tall rolls standing upright at the back corner */}
      {[
        [-0.72, 0.74, 0.13, c[1]],
        [-0.74, 0.47, 0.12, c[2]],
      ].map(([x, z, r, carpet]) => (
        <mesh key={z} position={[x, f + 0.78, z]} material={[carpet[0], carpet[1], carpet[1]]}>
          <cylinderGeometry args={[r, r, 1.56, 24]} />
        </mesh>
      ))}

      {/* folded rugs, stacked flat in the middle */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-1.0, f + 0.05 + i * 0.1, -0.1]} rotation={[0, i * 0.08, 0]} material={c[i % 4][0]}>
          <boxGeometry args={[0.6, 0.09, 0.44]} />
        </mesh>
      ))}

      {/* sofa cushions (cucian sofa) on top of the folded rugs */}
      {[
        [-0.98, f + 0.5, -0.1, 0.25, "#8a7f73"],
        [-0.9, f + 0.62, 0.02, -0.2, "#4b5563"],
      ].map(([x, y, z, rot, col]) => (
        <mesh key={col} position={[x, y, z]} rotation={[0.2, rot, 0.1]}>
          <boxGeometry args={[0.46, 0.12, 0.4]} />
          <meshStandardMaterial color={col} roughness={0.95} />
        </mesh>
      ))}

      {/* single mattress standing against the bulkhead (cucian tilam) */}
      <group position={[-0.62, f + 0.8, -0.35]} rotation={[0, 0, 0.06]}>
        <mesh material={m.white}>
          <boxGeometry args={[0.16, 1.5, 0.9]} />
        </mesh>
        <mesh position={[-0.081, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.82, 1.42]} />
          <meshStandardMaterial color="#dfe6ee" roughness={0.9} />
        </mesh>
      </group>

      {/* ── machines, right side ── */}
      {/* upright carpet extractor — karpet, tilam, sofa, seat kereta */}
      <group position={[-1.92, f, -0.58]}>
        <mesh position={[0, 0.3, 0]} material={m.machineGrey}>
          <boxGeometry args={[0.36, 0.6, 0.4]} />
        </mesh>
        <mesh position={[0, 0.66, 0]} material={m.machineYellow}>
          <boxGeometry args={[0.38, 0.14, 0.42]} />
        </mesh>
        <mesh position={[0.02, 0.06, 0]} material={m.trim}>
          <boxGeometry args={[0.42, 0.12, 0.46]} />
        </mesh>
        {[-0.14, 0.14].map((z) => (
          <mesh key={z} position={[0.12, 1.0, z]} material={m.chrome}>
            <cylinderGeometry args={[0.018, 0.018, 0.6, 8]} />
          </mesh>
        ))}
        <mesh position={[0.12, 1.3, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.trim}>
          <cylinderGeometry args={[0.03, 0.03, 0.34, 8]} />
        </mesh>
      </group>

      {/* hand-tool upholstery wand leaning on the extractor */}
      <mesh position={[-2.02, f + 0.55, -0.24]} rotation={[0.35, 0, 0.1]} material={m.chrome}>
        <cylinderGeometry args={[0.02, 0.02, 1.0, 8]} />
      </mesh>

      {/* wet/dry vacuum with hose */}
      <group position={[-1.4, f, -0.64]}>
        <mesh position={[0, 0.24, 0]} material={m.machineGrey}>
          <cylinderGeometry args={[0.2, 0.18, 0.48, 24]} />
        </mesh>
        <mesh position={[0, 0.51, 0]} material={m.machineYellow}>
          <cylinderGeometry args={[0.21, 0.21, 0.08, 24]} />
        </mesh>
        <mesh position={[0, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.trim}>
          <torusGeometry args={[0.16, 0.028, 8, 28]} />
        </mesh>
      </group>

      {/* second vacuum on top of a crate */}
      <mesh position={[-1.42, f + 0.9, -0.62]} material={m.trim}>
        <boxGeometry args={[0.46, 0.22, 0.42]} />
      </mesh>
      <group position={[-1.42, f + 1.01, -0.62]}>
        <mesh position={[0, 0.2, 0]} material={m.machineBlue}>
          <cylinderGeometry args={[0.17, 0.15, 0.4, 20]} />
        </mesh>
        <mesh position={[0, 0.43, 0]} material={m.machineGrey}>
          <cylinderGeometry args={[0.18, 0.18, 0.07, 20]} />
        </mesh>
      </group>

      {/* rotary scrubber — masjid & pejabat carpets */}
      <group position={[-1.0, f, -0.6]}>
        <mesh position={[0, 0.06, 0]} material={m.machineBlue}>
          <cylinderGeometry args={[0.26, 0.26, 0.12, 28]} />
        </mesh>
        <mesh position={[0, 0.24, 0]} material={m.machineGrey}>
          <cylinderGeometry args={[0.14, 0.16, 0.26, 20]} />
        </mesh>
        <mesh position={[-0.25, 0.75, 0]} rotation={[0, 0, 0.5]} material={m.chrome}>
          <cylinderGeometry args={[0.022, 0.022, 1.2, 8]} />
        </mesh>
      </group>

      {/* two orange air-mover dryers stacked */}
      {[0, 1].map((i) => (
        <group key={i} position={[-1.95, f + i * 0.37, -0.02]} rotation={[0, 0.4 - i * 0.3, 0]}>
          <mesh position={[0, 0.18, 0]} material={m.machineOrange}>
            <boxGeometry args={[0.34, 0.34, 0.3]} />
          </mesh>
          <mesh position={[-0.172, 0.18, 0]} rotation={[0, 0, Math.PI / 2]} material={m.trim}>
            <cylinderGeometry args={[0.12, 0.12, 0.01, 20]} />
          </mesh>
        </group>
      ))}

      {/* bucket + sprayer */}
      <mesh position={[-1.58, f + 0.13, -0.24]} material={m.machineYellow}>
        <cylinderGeometry args={[0.13, 0.11, 0.26, 18]} />
      </mesh>
      <mesh position={[-1.62, f + 0.15, 0.02]} material={m.white}>
        <cylinderGeometry args={[0.07, 0.07, 0.3, 14]} />
      </mesh>

      {/* coiled hoses hanging on the right wall */}
      {[
        [-1.7, 1.55, "#1f2937"],
        [-1.15, 1.6, "#facc15"],
      ].map(([x, y, col]) => (
        <mesh key={x} position={[x, y, -HALF + WALL + 0.05]}>
          <torusGeometry args={[0.2, 0.035, 8, 28]} />
          <meshStandardMaterial color={col} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function SidePanels({ m }) {
  const w = 3.15;
  const h = w / (1600 / 472);
  const x = -0.55;
  const y = 0.34 + h / 2 + 0.06;
  return (
    <>
      <mesh position={[x, y, HALF + 0.01]} material={m.side}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <mesh position={[x, y, -HALF - 0.01]} rotation={[0, Math.PI, 0]} material={m.side}>
        <planeGeometry args={[w, h]} />
      </mesh>
    </>
  );
}

function Windows({ m }) {
  // windshield plane follows the slanted profile edge (1.9,1.22) → (1.4,1.98)
  const lean = Math.atan2(0.5, 0.76);
  return (
    <>
      <group position={[1.66, 1.6, 0]} rotation={[0, 0, lean]}>
        <mesh position={[0.085, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={m.glass}>
          <planeGeometry args={[1.72, 0.86]} />
        </mesh>
      </group>
      {[1, -1].map((side) => (
        <group key={side} rotation={[0, side > 0 ? 0 : Math.PI, 0]}>
          <mesh position={[side * 1.12, 1.66, HALF + 0.012]} material={m.glass}>
            <planeGeometry args={[0.62, 0.58]} />
          </mesh>
          {[-1.35, -0.05].map((wx) => (
            <mesh key={wx} position={[side * wx, 1.72, HALF + 0.012]} material={m.glass}>
              <planeGeometry args={[1.18, 0.46]} />
            </mesh>
          ))}
          {[1.55, -1.45].map((wx) => (
            <mesh key={wx} position={[side * wx, WHEEL_R, HALF + 0.022]} material={m.arch}>
              <circleGeometry args={[0.5, 32, 0, Math.PI]} />
            </mesh>
          ))}
          <mesh position={[side * 1.5, 1.45, HALF + 0.12]} material={m.trim}>
            <boxGeometry args={[0.1, 0.24, 0.16]} />
          </mesh>
        </group>
      ))}
    </>
  );
}

const VanModel = forwardRef(function VanModel({ spinRef, doorsRef, lightRef }, ref) {
  const m = useMaterials();
  const cab = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(cabShape(), {
      depth: WIDTH,
      bevelEnabled: true,
      bevelSize: 0.08,
      bevelThickness: 0.08,
      bevelSegments: 4,
      curveSegments: 16,
    });
    g.translate(0, 0, -WIDTH / 2);
    return g;
  }, []);

  return (
    <group ref={ref}>
      <mesh geometry={cab} material={m.paint} />
      <CargoShell m={m} />
      <Cargo m={m} />
      <RearDoors m={m} doorsRef={doorsRef} />
      <SidePanels m={m} />
      <Windows m={m} />

      {/* warm cargo light, brightened by the parent as the doors open */}
      <pointLight ref={lightRef} position={[-1.3, 1.85, 0]} color="#ffe2a8" intensity={0} distance={3.2} decay={1.4} />

      {/* front: grille, headlights, bumper */}
      <mesh position={[2.49, 0.78, 0]} material={m.trim}>
        <boxGeometry args={[0.04, 0.26, 1.0]} />
      </mesh>
      {[0.66, -0.66].map((z) => (
        <mesh key={z} position={[2.47, 0.84, z]} material={m.headlight}>
          <boxGeometry args={[0.06, 0.2, 0.4]} />
        </mesh>
      ))}
      <mesh position={[2.5, 0.42, 0]} material={m.trim}>
        <boxGeometry args={[0.2, 0.26, 2.0]} />
      </mesh>

      {/* rear: tail lights on the body corners, bumper step */}
      {[1, -1].map((side) => (
        <mesh key={side} position={[REAR_X - 0.03, 1.0, side * (HALF - 0.04)]} material={m.taillight}>
          <boxGeometry args={[0.05, 0.5, 0.1]} />
        </mesh>
      ))}
      <mesh position={[REAR_X, 0.38, 0]} material={m.trim}>
        <boxGeometry args={[0.24, 0.2, 2.0]} />
      </mesh>

      {WHEELS.map((p, i) => (
        <Wheel key={i} index={i} position={p} m={m} spinRef={spinRef} />
      ))}

      <mesh position={[-0.2, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.shadow}>
        <planeGeometry args={[7, 3.8]} />
      </mesh>
    </group>
  );
});

export default VanModel;
