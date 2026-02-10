import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useNavStore } from "../../store/useNavStore";

const TOTAL_COUNT = 120;
const VARIANT_COUNT = 4;
const PER_VARIANT = Math.ceil(TOTAL_COUNT / VARIANT_COUNT);

const ASTEROID_COLORS = [
  "#5a5a5a",
  "#6e6e6e",
  "#4a4a4a",
  "#6b5b4b",
  "#5a4a3a",
  "#7a6a5a",
  "#6a5555",
  "#7a6060",
  "#5a4848",
  "#555050",
  "#857565",
  "#4e4642",
];

function noise3d(x: number, y: number, z: number): number {
  return (
    Math.sin(x * 1.7 + y * 2.3) * 0.3 +
    Math.sin(y * 2.1 + z * 1.9) * 0.25 +
    Math.sin(z * 1.5 + x * 2.7) * 0.2 +
    Math.sin(x * 3.1 + y * 1.3 + z * 2.5) * 0.15 +
    Math.sin(x * 4.7 - z * 3.3) * 0.1
  );
}

function createDeformedGeometry(seed: number): THREE.BufferGeometry {
  const base = new THREE.IcosahedronGeometry(1, 3);
  const pos = base.attributes.position;
  const rng = mulberry32(seed);

  const stretchX = 0.65 + rng() * 0.7;
  const stretchY = 0.65 + rng() * 0.7;
  const stretchZ = 0.65 + rng() * 0.7;
  const offsetX = rng() * 10;
  const offsetY = rng() * 10;
  const offsetZ = rng() * 10;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    x *= stretchX;
    y *= stretchY;
    z *= stretchZ;

    const len = Math.sqrt(x * x + y * y + z * z) || 1;
    const nx = x / len;
    const ny = y / len;
    const nz = z / len;

    const noiseVal = noise3d(
      nx * 2.5 + offsetX,
      ny * 2.5 + offsetY,
      nz * 2.5 + offsetZ,
    );

    const displacement = 1.0 + noiseVal * 0.35;
    x *= displacement;
    y *= displacement;
    z *= displacement;

    pos.setXYZ(i, x, y, z);
  }

  base.computeVertexNormals();
  return base;
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const dummy = new THREE.Object3D();
const tmpColor = new THREE.Color();

function AsteroidVariant({
  geometry,
  startIndex,
  count,
}: {
  geometry: THREE.BufferGeometry;
  startIndex: number;
  count: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const { currentSystem, warpStatus } = useNavStore();

  const { positionData, rotationData, scaleData } = useMemo(() => {
    const pData = new Float32Array(count * 3);
    const rData = new Float32Array(count * 3);
    const sData = new Float32Array(count);
    const rng = mulberry32(startIndex * 7919);

    for (let i = 0; i < count; i++) {
      const r = 4 + rng() * 20;
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);

      pData[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pData[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pData[i * 3 + 2] = r * Math.cos(phi);

      rData[i * 3] = (rng() - 0.5) * 0.6;
      rData[i * 3 + 1] = (rng() - 0.5) * 0.6;
      rData[i * 3 + 2] = (rng() - 0.5) * 0.6;

      sData[i] = 0.15 + rng() * 0.6;
    }

    return { positionData: pData, rotationData: rData, scaleData: sData };
  }, [count, startIndex]);

  useFrame(() => {
    if (!meshRef.current) return;

    const hazard = currentSystem?.hazardLevel ?? 0;
    const visible =
      hazard > 5 && warpStatus !== "jumping" && warpStatus !== "charging";
    meshRef.current.visible = visible;
    if (!visible) return;

    const time = performance.now() * 0.001;

    for (let i = 0; i < count; i++) {
      dummy.position.set(
        positionData[i * 3],
        positionData[i * 3 + 1],
        positionData[i * 3 + 2],
      );

      dummy.rotation.set(
        rotationData[i * 3] * time + (startIndex + i) * 1.37,
        rotationData[i * 3 + 1] * time + (startIndex + i) * 2.19,
        rotationData[i * 3 + 2] * time + (startIndex + i) * 0.73,
      );

      dummy.scale.setScalar(scaleData[i]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={(ref) => {
        if (ref && !meshRef.current) {
          meshRef.current = ref;
          const rng = mulberry32(startIndex * 1301);
          for (let i = 0; i < count; i++) {
            const c =
              ASTEROID_COLORS[Math.floor(rng() * ASTEROID_COLORS.length)];
            tmpColor.set(c);
            ref.setColorAt(i, tmpColor);
          }
          if (ref.instanceColor) {
            ref.instanceColor.needsUpdate = true;
          }
        }
      }}
      args={[geometry, undefined, count]}
      frustumCulled={false}
    >
      <meshStandardMaterial
        vertexColors
        emissive="#3a3028"
        emissiveIntensity={0.4}
        roughness={0.92}
        metalness={0.05}
      />
    </instancedMesh>
  );
}

export function AsteroidField() {
  const geometries = useMemo(
    () =>
      Array.from({ length: VARIANT_COUNT }, (_, i) =>
        createDeformedGeometry(i * 42 + 7),
      ),
    [],
  );

  return (
    <group>
      {geometries.map((geo, i) => {
        const start = i * PER_VARIANT;
        const count = Math.min(PER_VARIANT, TOTAL_COUNT - start);
        if (count <= 0) return null;
        return (
          <AsteroidVariant
            key={i}
            geometry={geo}
            startIndex={start}
            count={count}
          />
        );
      })}
    </group>
  );
}
