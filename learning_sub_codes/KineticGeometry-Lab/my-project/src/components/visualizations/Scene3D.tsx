'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid } from '@react-three/drei';
import { Suspense, useEffect, useRef } from 'react';
import { useGeometryStore } from '@/store/geometry-store';
import { useFrame, useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

// Animation clock sync component
function AnimationSync() {
  const { animationState, updateTime } = useGeometryStore();
  const prevTime = useRef(performance.now());

  useFrame(() => {
    if (animationState.isPlaying) {
      const now = performance.now();
      const delta = (now - prevTime.current) / 1000;
      prevTime.current = now;
      updateTime(delta);
    } else {
      prevTime.current = performance.now();
    }
  });

  return null;
}

// 3D Grid component
function SceneGrid() {
  const { showGrid } = useGeometryStore();
  
  if (!showGrid) return null;
  
  return (
    <Grid
      args={[20, 20]}
      cellSize={1}
      cellThickness={0.5}
      cellColor="hsl(var(--border))"
      sectionSize={5}
      sectionThickness={1}
      sectionColor="hsl(var(--muted-foreground))"
      fadeDistance={30}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid
    />
  );
}

// Camera controller
function CameraController() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(5, 4, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={1}
      maxDistance={50}
      maxPolarAngle={Math.PI * 0.9}
    />
  );
}

interface Scene3DProps {
  children: React.ReactNode;
}

export function Scene3D({ children }: Scene3DProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg overflow-hidden">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[5, 4, 5]} fov={50} />
        <CameraController />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#f97316" />
        
        {/* Environment */}
        <Suspense fallback={null}>
          <Environment preset="city" />
        </Suspense>
        
        {/* Grid */}
        <SceneGrid />
        
        {/* Animation Sync */}
        <AnimationSync />
        
        {/* Visualization Content */}
        <Suspense fallback={null}>
          {children}
        </Suspense>
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#0f172a', 10, 40]} />
      </Canvas>
    </div>
  );
}
