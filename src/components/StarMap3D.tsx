import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import * as THREE from "three";
import { useNavStore } from "../store/useNavStore";
import type { StarSystem } from "../store/useNavStore";
import { playUIClick } from "../audio/SoundEngine";

const STAR_COLORS: Record<string, string> = {
  star: "#00f3ff",
  binary: "#ffbd00",
  nebula: "#c084fc",
  black_hole: "#ef4444",
  pulsar: "#f97316",
};

const SCALE = 0.18;

function StarNode({
  system,
  isCurrent,
  isTarget,
  onSelect,
}: {
  system: StarSystem;
  isCurrent: boolean;
  isTarget: boolean;
  onSelect: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  const color = isCurrent ? "#22c55e" : STAR_COLORS[system.type] || "#00f3ff";
  const radius = isCurrent ? 0.2 : isTarget ? 0.18 : 0.12;

  useFrame((_s, delta) => {
    if (!meshRef.current) return;
    if (hovered || isTarget) {
      meshRef.current.scale.lerp(new THREE.Vector3(1.4, 1.4, 1.4), delta * 8);
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 5);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 1.5;
    }
  });

  const pos: [number, number, number] = [
    system.coordinates.x * SCALE,
    system.coordinates.y * SCALE,
    system.coordinates.z * SCALE,
  ];

  return (
    <group position={pos}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          if (!isCurrent) {
            playUIClick();
            onSelect();
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = isCurrent ? "default" : "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[radius, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Glow sphere */}
      <mesh>
        <sphereGeometry args={[radius * 2.5, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered || isTarget ? 0.15 : 0.06}
        />
      </mesh>

      {/* Pulsing ring for current/target */}
      {(isCurrent || isTarget) && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 2, radius * 2.4, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Hover label */}
      {(hovered || isTarget) && (
        <Html
          position={[0, radius * 3 + 0.15, 0]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.85)",
              border: `1px solid ${color}`,
              borderRadius: 4,
              padding: "3px 8px",
              whiteSpace: "nowrap",
              fontSize: 9,
              fontFamily: "monospace",
              color: color,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              boxShadow: `0 0 8px ${color}40`,
            }}
          >
            {system.name}
            <span style={{ opacity: 0.5, marginLeft: 6 }}>
              {system.spectralClass}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

function RouteLine({ from, to }: { from: StarSystem; to: StarSystem }) {
  const points: [number, number, number][] = [
    [
      from.coordinates.x * SCALE,
      from.coordinates.y * SCALE,
      from.coordinates.z * SCALE,
    ],
    [
      to.coordinates.x * SCALE,
      to.coordinates.y * SCALE,
      to.coordinates.z * SCALE,
    ],
  ];

  return (
    <Line
      points={points}
      color="#00f3ff"
      lineWidth={1.5}
      dashed
      dashSize={0.15}
      gapSize={0.1}
      opacity={0.6}
      transparent
    />
  );
}

function GridPlane() {
  return (
    <gridHelper
      args={[6, 12, "#0e3a4a", "#0a1e2a"]}
      position={[0, -0.5, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

function MapScene() {
  const { knownSystems, currentSystem, targetSystem, setTargetSystem } =
    useNavStore();
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_s, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  const center = useMemo(() => {
    const avg = { x: 0, y: 0, z: 0 };
    knownSystems.forEach((s) => {
      avg.x += s.coordinates.x;
      avg.y += s.coordinates.y;
      avg.z += s.coordinates.z;
    });
    const n = knownSystems.length;
    return [
      (-avg.x / n) * SCALE,
      (-avg.y / n) * SCALE,
      (-avg.z / n) * SCALE,
    ] as [number, number, number];
  }, [knownSystems]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 3]} intensity={0.5} color="#00f3ff" />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={1.5}
        maxDistance={6}
        autoRotate={false}
      />

      <group ref={groupRef} position={center}>
        <GridPlane />

        {knownSystems.map((sys) => (
          <StarNode
            key={sys.id}
            system={sys}
            isCurrent={sys.id === currentSystem.id}
            isTarget={sys.id === targetSystem?.id}
            onSelect={() => setTargetSystem(sys)}
          />
        ))}

        {targetSystem && <RouteLine from={currentSystem} to={targetSystem} />}
      </group>
    </>
  );
}

export function StarMap3D() {
  return (
    <div
      style={{
        width: "100%",
        height: 180,
        borderRadius: 6,
        overflow: "hidden",
        border: "1px solid rgba(0, 243, 255, 0.15)",
        background: "rgba(0, 0, 0, 0.5)",
        position: "relative",
      }}
    >
      <Canvas
        camera={{ position: [0, 2.5, 4], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <MapScene />
      </Canvas>

      {/* Corner brackets */}
      <div
        style={{
          position: "absolute",
          top: 4,
          left: 4,
          width: 10,
          height: 10,
          borderTop: "1px solid rgba(0, 243, 255, 0.4)",
          borderLeft: "1px solid rgba(0, 243, 255, 0.4)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 4,
          right: 4,
          width: 10,
          height: 10,
          borderTop: "1px solid rgba(0, 243, 255, 0.4)",
          borderRight: "1px solid rgba(0, 243, 255, 0.4)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 4,
          left: 4,
          width: 10,
          height: 10,
          borderBottom: "1px solid rgba(0, 243, 255, 0.4)",
          borderLeft: "1px solid rgba(0, 243, 255, 0.4)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 4,
          right: 4,
          width: 10,
          height: 10,
          borderBottom: "1px solid rgba(0, 243, 255, 0.4)",
          borderRight: "1px solid rgba(0, 243, 255, 0.4)",
          pointerEvents: "none",
        }}
      />

      {/* Label */}
      <div
        style={{
          position: "absolute",
          bottom: 6,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 8,
          fontFamily: "monospace",
          color: "rgba(0, 243, 255, 0.4)",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          pointerEvents: "none",
        }}
      >
        Sector Map
      </div>
    </div>
  );
}
