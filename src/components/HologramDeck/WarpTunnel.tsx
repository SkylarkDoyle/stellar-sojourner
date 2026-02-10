import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useNavStore } from "../../store/useNavStore";

const STREAK_COUNT = 600;
const GLOW_COUNT = 400;
const TUNNEL_DEPTH = 80;

const PALETTE = [
  [0.75, 0.25, 1.0],
  [1.0, 0.2, 0.75],
  [0.0, 0.92, 1.0],
  [1.0, 0.45, 0.1],
  [1.0, 1.0, 1.0],
  [0.45, 0.65, 1.0],
  [1.0, 0.1, 0.45],
  [0.9, 0.6, 1.0],
  [0.2, 1.0, 0.8],
];

function WarpStreaks() {
  const ref = useRef<THREE.LineSegments>(null!);
  const { warpStatus } = useNavStore();

  const { positions, colors, meta } = useMemo(() => {
    const pos = new Float32Array(STREAK_COUNT * 6);
    const col = new Float32Array(STREAK_COUNT * 6);
    const m = new Float32Array(STREAK_COUNT * 3);

    for (let i = 0; i < STREAK_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.2 + Math.random() * 9;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = -Math.random() * TUNNEL_DEPTH;
      const len = 1.5 + Math.random() * 5 + (radius < 2 ? 3 : 0);

      m[i * 3] = len;
      m[i * 3 + 1] = angle;
      m[i * 3 + 2] = radius;

      pos[i * 6] = x;
      pos[i * 6 + 1] = y;
      pos[i * 6 + 2] = z;
      pos[i * 6 + 3] = x;
      pos[i * 6 + 4] = y;
      pos[i * 6 + 5] = z - len;

      const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      const bright = 0.7 + Math.random() * 0.3;
      col[i * 6] = c[0] * bright;
      col[i * 6 + 1] = c[1] * bright;
      col[i * 6 + 2] = c[2] * bright;
      col[i * 6 + 3] = c[0] * bright * 0.4;
      col[i * 6 + 4] = c[1] * bright * 0.4;
      col[i * 6 + 5] = c[2] * bright * 0.4;
    }
    return { positions: pos, colors: col, meta: m };
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const active = warpStatus === "jumping" || warpStatus === "charging";
    ref.current.visible = active;
    if (!active) return;

    const speed = warpStatus === "jumping" ? 120 : 25;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < STREAK_COUNT; i++) {
      const dz = delta * speed;
      pos[i * 6 + 2] += dz;
      pos[i * 6 + 5] += dz;

      if (pos[i * 6 + 5] > 10) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.2 + Math.random() * 9;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = -TUNNEL_DEPTH - Math.random() * 20;
        const len = meta[i * 3];

        pos[i * 6] = x;
        pos[i * 6 + 1] = y;
        pos[i * 6 + 2] = z + len;
        pos[i * 6 + 3] = x;
        pos[i * 6 + 4] = y;
        pos[i * 6 + 5] = z;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={STREAK_COUNT * 2}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={STREAK_COUNT * 2}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

function StreakGlow() {
  const ref = useRef<THREE.Points>(null!);
  const { warpStatus } = useNavStore();

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(GLOW_COUNT * 3);
    const col = new Float32Array(GLOW_COUNT * 3);

    for (let i = 0; i < GLOW_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.3 + Math.random() * 8;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = -Math.random() * TUNNEL_DEPTH;

      const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    }

    return { positions: pos, colors: col };
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const active = warpStatus === "jumping" || warpStatus === "charging";
    ref.current.visible = active;
    if (!active) return;

    const speed = warpStatus === "jumping" ? 110 : 20;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < GLOW_COUNT; i++) {
      pos[i * 3 + 2] += delta * speed;
      if (pos[i * 3 + 2] > 10) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.3 + Math.random() * 8;
        pos[i * 3] = Math.cos(angle) * radius;
        pos[i * 3 + 1] = Math.sin(angle) * radius;
        pos[i * 3 + 2] = -TUNNEL_DEPTH - Math.random() * 15;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={GLOW_COUNT}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={GLOW_COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.5}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function OuterBloom() {
  const ref = useRef<THREE.Points>(null!);
  const { warpStatus } = useNavStore();

  const { positions, colors } = useMemo(() => {
    const count = 150;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1 + Math.random() * 6;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = -Math.random() * TUNNEL_DEPTH;

      const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const active = warpStatus === "jumping";
    ref.current.visible = active;
    if (!active) return;

    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < 150; i++) {
      pos[i * 3 + 2] += delta * 90;
      if (pos[i * 3 + 2] > 8) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 1 + Math.random() * 6;
        pos[i * 3] = Math.cos(angle) * radius;
        pos[i * 3 + 1] = Math.sin(angle) * radius;
        pos[i * 3 + 2] = -TUNNEL_DEPTH - Math.random() * 10;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={150}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={150}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={2.0}
        transparent
        opacity={0.12}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function VanishingPoint() {
  const coreRef = useRef<THREE.Mesh>(null!);
  const haloRef = useRef<THREE.Mesh>(null!);
  const { warpStatus } = useNavStore();

  useFrame((state, delta) => {
    if (!coreRef.current) return;
    const isJumping = warpStatus === "jumping";
    const isCharging = warpStatus === "charging";
    const active = isJumping || isCharging;

    let targetScale = 0;
    let targetOpacity = 0;

    if (isJumping) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
      targetScale = 1.2 * pulse;
      targetOpacity = 0.9;
    } else if (isCharging) {
      targetScale = 0.4;
      targetOpacity = 0.5;
    }

    const s = THREE.MathUtils.lerp(
      coreRef.current.scale.x,
      targetScale,
      delta * 3,
    );
    coreRef.current.scale.set(s, s, s);
    coreRef.current.visible = active && s > 0.01;

    const mat = coreRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, delta * 4);

    if (isJumping) {
      const hue = (state.clock.elapsedTime * 0.08) % 1;
      mat.color.setHSL(hue, 0.5, 0.9);
    } else {
      mat.color.set("#ffffff");
    }

    if (haloRef.current) {
      haloRef.current.scale.set(s * 3, s * 3, s * 3);
      haloRef.current.visible = active && s > 0.01;
      const hMat = haloRef.current.material as THREE.MeshBasicMaterial;
      hMat.opacity = THREE.MathUtils.lerp(
        hMat.opacity,
        targetOpacity * 0.15,
        delta * 3,
      );

      if (isJumping) {
        const hue2 = (state.clock.elapsedTime * 0.08 + 0.3) % 1;
        hMat.color.setHSL(hue2, 0.7, 0.7);
      }
    }
  });

  return (
    <group position={[0, 0, -60]}>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.8, 12, 12]} />
        <meshBasicMaterial
          color="#c084fc"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function ColorWash() {
  const ref = useRef<THREE.Mesh>(null!);
  const { warpStatus } = useNavStore();

  useFrame((state, delta) => {
    if (!ref.current) return;
    const isJumping = warpStatus === "jumping";
    const isCooling = warpStatus === "cooling";

    let targetOpacity = 0;
    if (isJumping) {
      targetOpacity = 0.06 + Math.sin(state.clock.elapsedTime * 2.5) * 0.03;
    } else if (isCooling) {
      targetOpacity = 0.2;
    }

    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = THREE.MathUtils.lerp(
      mat.opacity,
      targetOpacity,
      delta * (isCooling ? 8 : 2),
    );
    ref.current.visible = mat.opacity > 0.003;

    if (isJumping) {
      const hue = (state.clock.elapsedTime * 0.12) % 1;
      mat.color.setHSL(hue, 0.7, 0.65);
    } else if (isCooling) {
      mat.color.set("#ffffff");
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, 1]} renderOrder={999}>
      <planeGeometry args={[50, 50]} />
      <meshBasicMaterial
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export function WarpTunnel() {
  return (
    <group>
      <WarpStreaks />
      <StreakGlow />
      <OuterBloom />
      <VanishingPoint />
      <ColorWash />
    </group>
  );
}
