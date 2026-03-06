/**
 * 3D Transformer Model
 * Interactive 3D visualization of transformer structure
 */

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

const TransformerModel = () => {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Core - E-I shape */}
      <Box args={[3, 4, 1]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#555" metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* Center leg cutout */}
      <Box args={[1.5, 2.5, 1.1]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#222" />
      </Box>

      {/* Primary Coil (left) */}
      <Cylinder args={[0.6, 0.6, 3, 32]} position={[-1, 0, 0]}>
        <meshStandardMaterial color="#b87333" metalness={0.6} roughness={0.4} wireframe />
      </Cylinder>

      {/* Secondary Coil (right) */}
      <Cylinder args={[0.6, 0.6, 3, 32]} position={[1, 0, 0]}>
        <meshStandardMaterial color="#b87333" metalness={0.6} roughness={0.4} wireframe />
      </Cylinder>
    </group>
  );
};

const Transformer3D = () => {
  return (
    <div className="h-96 w-full bg-gray-900 dark:bg-slate-900 rounded-xl overflow-hidden my-8 relative">
      <div className="absolute top-4 left-4 z-10 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
        Interactive 3D Transformer Model
      </div>
      <div className="absolute bottom-4 left-4 z-10 text-white bg-black/50 px-3 py-1 rounded-full text-xs">
        Drag to rotate • Scroll to zoom
      </div>
      
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <TransformerModel />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            autoRotate={false}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Transformer3D;
