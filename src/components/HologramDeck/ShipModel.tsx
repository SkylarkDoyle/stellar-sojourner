import { useRef, useMemo } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useShipStore } from "../../store/useShipStore";
import { useNavStore } from "../../store/useNavStore";

const PARTICLE_COUNT = 150;

function ThrusterExhaust({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const exhaustRef = useRef<THREE.Group>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const bloomRef = useRef<THREE.Mesh>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);
  const particlesRef = useRef<THREE.Points>(null!);
  const { warpStatus } = useNavStore();

  const particlePositions = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.2 * scale;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.2 * scale;
      pos[i * 3 + 2] = -Math.random() * 3.0 * scale;
    }
    return pos;
  }, [scale]);

  useFrame((_state, delta) => {
    if (!exhaustRef.current) return;

    const isWarping = warpStatus === "jumping";
    const isCharging = warpStatus === "charging";

    // Pulse the core exhaust cone
    if (coreRef.current) {
      const pulse = 1 + Math.sin(Date.now() * 0.015) * 0.3;
      const warpPulse = isWarping ? 3.0 : isCharging ? 1.5 : 1;
      coreRef.current.scale.z = pulse * warpPulse;
      coreRef.current.scale.x =
        (0.8 + Math.sin(Date.now() * 0.025) * 0.3) * (isWarping ? 2 : 1);
      coreRef.current.scale.y = coreRef.current.scale.x;
    }

    if (glowRef.current) {
      const glowPulse = 1 + Math.sin(Date.now() * 0.01) * 0.4;
      const warpGlow = isWarping ? 3 : isCharging ? 1.5 : 1;
      glowRef.current.scale.z = glowPulse * warpGlow;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = isWarping
        ? 0.5
        : isCharging
          ? 0.3
          : 0.15;
    }

    if (bloomRef.current) {
      const bloomPulse = 1 + Math.sin(Date.now() * 0.008) * 0.5;
      bloomRef.current.scale.set(
        bloomPulse,
        bloomPulse,
        bloomPulse * (isWarping ? 2.5 : 1),
      );
      (bloomRef.current.material as THREE.MeshBasicMaterial).opacity = isWarping
        ? 0.2
        : isCharging
          ? 0.08
          : 0.04;
    }

    if (lightRef.current) {
      lightRef.current.intensity = isWarping ? 3 : isCharging ? 1.5 : 0.5;
    }

    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position
        .array as Float32Array;
      const speed = isWarping ? 12 : isCharging ? 5 : 2;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3 + 2] -= delta * speed;
        if (positions[i * 3 + 2] < -3 * scale) {
          positions[i * 3 + 2] = 0;
          positions[i * 3] = (Math.random() - 0.5) * 0.2 * scale;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 0.2 * scale;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={exhaustRef} position={position}>
      <pointLight
        ref={lightRef}
        color="#ff8800"
        intensity={0.5}
        distance={5}
        decay={2}
        position={[0, 0, -0.5 * scale]}
      />

      {/* White-hot inner core — cone tip points +Z (exhaust direction) */}
      <mesh ref={coreRef} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.15 * scale, 1.2 * scale, 12]} />
        <meshBasicMaterial color="#ffffcc" transparent opacity={0.95} />
      </mesh>

      {/* Orange mid-flame */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.3 * scale, 2.0 * scale, 12]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.15} />
      </mesh>

      {/* Wide ambient bloom */}
      <mesh
        ref={bloomRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, -0.3 * scale]}
      >
        <coneGeometry args={[0.5 * scale, 3.0 * scale, 8]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={0.04}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Exhaust Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
            count={PARTICLE_COUNT}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ffaa44"
          size={0.06 * scale}
          transparent
          opacity={0.8}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export function ShipModel({
  mouseRef,
  ...props
}: {
  mouseRef: MutableRefObject<{ x: number; y: number }>;
  [key: string]: any;
}) {
  const meshRef = useRef<THREE.Group>(null!);
  const { telemetry } = useShipStore();
  const { warpStatus } = useNavStore();
  // @ts-ignore
  const { nodes, materials } = useGLTF("/stellar-sojourner/spaceship.glb");

  const shieldColor = new THREE.Color().lerpColors(
    new THREE.Color("#ff003c"),
    new THREE.Color("#00f3ff"),
    telemetry.shieldIntegrity / 100,
  );

  const forwardOffset = useRef(0);
  const targetOffset = useRef(0);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    if (warpStatus === "jumping") {
      targetOffset.current = -3;
    } else if (warpStatus === "charging") {
      targetOffset.current = -0.5;
    } else {
      targetOffset.current = 0;
    }

    forwardOffset.current = THREE.MathUtils.lerp(
      forwardOffset.current,
      targetOffset.current,
      delta * 2,
    );
    meshRef.current.position.z = forwardOffset.current;

    const isWarping = warpStatus === "jumping" || warpStatus === "charging";
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    const mouseYaw = isWarping ? 0 : mx * 0.3;
    const mousePitch = isWarping
      ? warpStatus === "jumping"
        ? -0.15
        : 0
      : -my * 0.2;
    const mouseBank = isWarping ? 0 : -mx * 0.15;

    const idleSwayY = Math.sin(_state.clock.elapsedTime * 0.2) * 0.05;
    const idleSwayZ = Math.cos(_state.clock.elapsedTime * 0.15) * 0.03;

    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      mousePitch + (isWarping ? 0 : idleSwayZ * 0.5),
      delta * 4,
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      Math.PI + mouseYaw + idleSwayY,
      delta * 4,
    );
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      mouseBank + idleSwayZ,
      delta * 3,
    );

    if (warpStatus === "jumping") {
      meshRef.current.position.x = (Math.random() - 0.5) * 0.05;
      meshRef.current.position.y = (Math.random() - 0.5) * 0.03;
    }
  });

  // Engine nacelle positions derived from GLB geometry analysis:
  // Model bounds: X [-1299, 1293], Y [-98, 552], Z [-1042, 1146]
  // Effective scale: 0.2 * 0.01 = 0.002
  // Engine nacelles are at ~X=±900, Y=200, Z=-850 in model space
  // In group space (after 0.002 scale): X=±1.8, Y=0.4, Z=-1.7
  // The group is rotated Math.PI around Y, flipping Z: so Z becomes +1.7
  // Exhaust fires in +Z local (which is -Z world = backward from camera)

  return (
    <Float
      speed={warpStatus === "jumping" ? 0 : 2}
      rotationIntensity={0.2}
      floatIntensity={0.5}
    >
      <group ref={meshRef} {...props} dispose={null} rotation={[0, Math.PI, 0]}>
        <group scale={0.1}>
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.Starship_Material003_0 as THREE.Mesh).geometry}
            material={materials["Material.003"]}
            scale={0.01}
          />
        </group>

        {/* Left engine nacelle */}
        <ThrusterExhaust position={[0.425, 0.1, -1.1]} scale={0.5} />
        {/* Right engine nacelle */}
        <ThrusterExhaust position={[-0.425, 0.1, -1.1]} scale={0.5} />

        {telemetry.shieldIntegrity < 100 && (
          <mesh>
            <sphereGeometry args={[2.5, 32, 32]} />
            <meshBasicMaterial
              color={shieldColor}
              transparent
              opacity={Math.max(0, (100 - telemetry.shieldIntegrity) / 200)}
              wireframe
            />
          </mesh>
        )}
      </group>
    </Float>
  );
}

useGLTF.preload("/stellar-sojourner/spaceship.glb");
