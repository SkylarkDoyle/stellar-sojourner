import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useNavStore } from "../../store/useNavStore";

interface PlanetDef {
  position: [number, number, number];
  radius: number;
  color: string;
  emissive: string;
  emissiveIntensity: number;
  rotationSpeed: number;
  hasAtmosphere: boolean;
  atmosphereColor: string;
  hasRing: boolean;
  ringColor?: string;
}

const SYSTEM_PLANETS: Record<string, PlanetDef[]> = {
  sol: [
    {
      position: [-45, 15, -60],
      radius: 30,
      color: "#2a5f8f",
      emissive: "#0a1a2f",
      emissiveIntensity: 0.15,
      rotationSpeed: 0.02,
      hasAtmosphere: true,
      atmosphereColor: "#4a9edd",
      hasRing: false,
    },
    {
      position: [70, -10, -90],
      radius: 12,
      color: "#c4a882",
      emissive: "#1a1408",
      emissiveIntensity: 0.1,
      rotationSpeed: 0.015,
      hasAtmosphere: false,
      atmosphereColor: "#000000",
      hasRing: false,
    },
  ],
  proxima: [
    {
      position: [-50, 20, -70],
      radius: 25,
      color: "#8b4513",
      emissive: "#2a1005",
      emissiveIntensity: 0.12,
      rotationSpeed: 0.018,
      hasAtmosphere: true,
      atmosphereColor: "#cc6633",
      hasRing: false,
    },
  ],
  wolf359: [
    {
      position: [55, -15, -55],
      radius: 20,
      color: "#3a3a3a",
      emissive: "#0a0a0a",
      emissiveIntensity: 0.08,
      rotationSpeed: 0.01,
      hasAtmosphere: false,
      atmosphereColor: "#000000",
      hasRing: false,
    },
    {
      position: [-40, 25, -80],
      radius: 15,
      color: "#5c3a2a",
      emissive: "#1a0a05",
      emissiveIntensity: 0.1,
      rotationSpeed: 0.025,
      hasAtmosphere: true,
      atmosphereColor: "#884422",
      hasRing: false,
    },
  ],
  sirius: [
    {
      position: [-60, 10, -65],
      radius: 35,
      color: "#b8d4e8",
      emissive: "#1a2a3a",
      emissiveIntensity: 0.2,
      rotationSpeed: 0.012,
      hasAtmosphere: true,
      atmosphereColor: "#ddeeff",
      hasRing: true,
      ringColor: "#aaccee",
    },
  ],
  trapist: [
    {
      position: [-40, 12, -50],
      radius: 28,
      color: "#2a6b5a",
      emissive: "#081a14",
      emissiveIntensity: 0.15,
      rotationSpeed: 0.02,
      hasAtmosphere: true,
      atmosphereColor: "#3a9a7a",
      hasRing: false,
    },
    {
      position: [60, -20, -85],
      radius: 18,
      color: "#c49a3a",
      emissive: "#2a1a05",
      emissiveIntensity: 0.12,
      rotationSpeed: 0.03,
      hasAtmosphere: true,
      atmosphereColor: "#ddaa44",
      hasRing: true,
      ringColor: "#aa8833",
    },
  ],
};

function Planet({ def }: { def: PlanetDef }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const atmosRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += def.rotationSpeed * 0.016;
    }
  });

  return (
    <group position={def.position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[def.radius, 64, 48]} />
        <meshStandardMaterial
          color={def.color}
          emissive={def.emissive}
          emissiveIntensity={def.emissiveIntensity}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {def.hasAtmosphere && (
        <mesh ref={atmosRef}>
          <sphereGeometry args={[def.radius * 1.02, 48, 32]} />
          <meshBasicMaterial
            color={def.atmosphereColor}
            transparent
            opacity={0.08}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {def.hasRing && (
        <mesh rotation={[Math.PI * 0.35, 0.2, 0]}>
          <ringGeometry args={[def.radius * 1.4, def.radius * 2.0, 64]} />
          <meshBasicMaterial
            color={def.ringColor}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

export function SystemBodies() {
  const { currentSystem, warpStatus } = useNavStore();

  if (warpStatus === "jumping" || warpStatus === "charging") return null;

  const planets = SYSTEM_PLANETS[currentSystem?.id] ?? [];
  if (planets.length === 0) return null;

  return (
    <group>
      {planets.map((def, i) => (
        <Planet key={`${currentSystem.id}-${i}`} def={def} />
      ))}
    </group>
  );
}
