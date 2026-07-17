"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";

function PackModel() {
  const mesh = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (mesh.current) mesh.current.rotation.y += delta * 0.35;
  });
  return (
    <Float speed={1.7} rotationIntensity={0.6} floatIntensity={1.4}>
      <mesh ref={mesh} rotation={[0.2, 0.7, 0]}>
        <cylinderGeometry args={[1.15, 0.9, 2.2, 64, 1, true]} />
        <MeshTransmissionMaterial thickness={0.45} roughness={0.18} transmission={0.65} color="#fff4df" />
      </mesh>
      <mesh position={[0, 1.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.05, 0.08, 20, 96]} />
        <meshStandardMaterial color="#ff8a1f" emissive="#7a3d0b" emissiveIntensity={0.55} />
      </mesh>
    </Float>
  );
}

export function ProductOrbit({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "h-[300px] w-full" : "h-[520px] w-full"}>
      <Canvas camera={{ position: [0, 0.4, 5], fov: 42 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[4, 3, 3]} intensity={18} color="#ff8a1f" />
        <pointLight position={[-3, -2, 2]} intensity={8} color="#2ecb68" />
        <PackModel />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>
    </div>
  );
}

