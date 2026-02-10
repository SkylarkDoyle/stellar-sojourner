import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { ShipModel } from "./ShipModel";
import { StarField } from "./StarField";
import { WarpTunnel } from "./WarpTunnel";
import { AsteroidField } from "./AsteroidField";
import { SystemBodies } from "./SystemBodies";

export function DeckCanvas() {
  const mouseRef = useRef({ x: 0, y: 0 });

  return (
    <div
      className="w-full h-full bg-black relative overflow-hidden rounded-lg border border-cyan-900/50 shadow-[0_0_50px_rgba(0,243,255,0.1)]"
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      }}
      onPointerLeave={() => {
        mouseRef.current.x = 0;
        mouseRef.current.y = 0;
      }}
    >
      {/* HUD Overlay Lines */}
      <div className="absolute inset-0 pointer-events-none z-10 border border-white/5 rounded-lg">
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500/50"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500/50"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50"></div>
      </div>

      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 1, 6]} fov={50} />
        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
          minDistance={3}
          maxDistance={10}
        />

        <ambientLight intensity={0.15} />

        {/* Sun — directional yellow light from upper-left */}
        <directionalLight
          position={[50, 80, 30]}
          intensity={1.8}
          color="#fff4d6"
          castShadow={false}
        />

        {/* Visible sun disc */}
        <mesh position={[50, 80, -100]}>
          <sphereGeometry args={[4, 16, 16]} />
          <meshBasicMaterial color="#fff8e0" />
        </mesh>
        <pointLight
          position={[50, 80, -100]}
          intensity={2}
          color="#ffe8a0"
          distance={300}
        />

        <pointLight position={[10, 10, 10]} intensity={0.6} color="#00f3ff" />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.3}
          color="#ff003c"
        />

        <StarField count={3000} />
        <SystemBodies />
        <ShipModel mouseRef={mouseRef} />
        <WarpTunnel />
        <AsteroidField />
      </Canvas>
    </div>
  );
}
