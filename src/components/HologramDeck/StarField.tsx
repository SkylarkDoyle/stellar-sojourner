import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useNavStore } from "../../store/useNavStore";

export function StarField({ count = 2000 }) {
  const points = useRef<THREE.Points>(null!);
  const { warpStatus } = useNavStore();

  // Generate random positions for stars
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Spread stars in a sphere/cylinder around the camera
      const r = 20 + Math.random() * 100;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  useFrame((_, delta) => {
    if (!points.current) return;

    // Warp speed multiplier
    const speed =
      warpStatus === "jumping" ? 50 : warpStatus === "charging" ? 2 : 0.1;

    // Move stars
    const positions = points.current.geometry.attributes.position
      .array as Float32Array;

    // Animate rotation to simulate turning
    points.current.rotation.z += delta * 0.05;

    // Animate stars moving strictly towards camera (Z axis)
    // We iterate through points and move Z
    // Note: Mutating buffer attributes directly is performant for this

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // z is at i3 + 2
      positions[i3 + 2] += speed * delta;

      // Reset if passed camera
      if (positions[i3 + 2] > 50) {
        positions[i3 + 2] = -50;
      }
    }
    points.current.geometry.attributes.position.needsUpdate = true;

    if (warpStatus === "jumping") {
      points.current.scale.z = 20; // Warp streak effect
    } else {
      points.current.scale.z = 1;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points
        ref={points}
        positions={positions}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.15}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}
