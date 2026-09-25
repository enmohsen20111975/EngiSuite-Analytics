'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';

interface LorenzParams {
  sigma: number;
  rho: number;
  beta: number;
  dt: number;
}

function lorenzStep(x: number, y: number, z: number, params: LorenzParams): { x: number; y: number; z: number } {
  const { sigma, rho, beta, dt } = params;
  return {
    x: x + sigma * (y - x) * dt,
    y: y + (x * (rho - z) - y) * dt,
    z: z + (x * y - beta * z) * dt,
  };
}

export function LorenzAttractor() {
  const { animationState, parameters } = useGeometryStore();
  const sigma = parameters.sigma ?? 10;
  const rho = parameters.rho ?? 28;
  const beta = parameters.beta ?? 8 / 3;
  
  const trailLineRef = useRef<THREE.Line>(null);
  const trailPointsRef = useRef<THREE.Vector3[]>([]);
  const positionRef = useRef({ x: 1, y: 1, z: 1 });
  const lastTimeRef = useRef(0);
  const maxPoints = 5000;
  
  // State for marker position (updated in useFrame)
  const [markerPos, setMarkerPos] = useState({ x: 0.1, y: -1.9, z: 0.1 });
  
  const params: LorenzParams = useMemo(() => ({
    sigma,
    rho,
    beta,
    dt: 0.005,
  }), [sigma, rho, beta]);
  
  // Simulate Lorenz system
  useFrame(() => {
    // Reset on time reset
    if (animationState.time < lastTimeRef.current) {
      trailPointsRef.current = [];
      positionRef.current = { x: 1, y: 1, z: 1 };
      if (trailLineRef.current) {
        trailLineRef.current.geometry.dispose();
        trailLineRef.current.geometry = new THREE.BufferGeometry();
      }
    }
    lastTimeRef.current = animationState.time;
    
    if (!animationState.isPlaying) return;
    
    const stepsPerFrame = 5;
    for (let i = 0; i < stepsPerFrame; i++) {
      positionRef.current = lorenzStep(
        positionRef.current.x,
        positionRef.current.y,
        positionRef.current.z,
        params
      );
      
      trailPointsRef.current.push(
        new THREE.Vector3(
          positionRef.current.x * 0.1,
          positionRef.current.z * 0.1 - 2,
          positionRef.current.y * 0.1
        )
      );
      
      if (trailPointsRef.current.length > maxPoints) {
        trailPointsRef.current.shift();
      }
    }
    
    // Update marker position state
    setMarkerPos({
      x: positionRef.current.x * 0.1,
      y: positionRef.current.z * 0.1 - 2,
      z: positionRef.current.y * 0.1
    });
    
    if (trailLineRef.current && trailPointsRef.current.length > 1) {
      trailLineRef.current.geometry.dispose();
      trailLineRef.current.geometry = new THREE.BufferGeometry().setFromPoints(trailPointsRef.current);
    }
  });
  
  return (
    <group>
      {/* Trajectory */}
      <line ref={trailLineRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#f97316" transparent opacity={0.8} linewidth={1.5} />
      </line>
      
      {/* Current position marker */}
      <mesh position={[markerPos.x, markerPos.y, markerPos.z]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f97316"
          emissiveIntensity={1}
        />
      </mesh>
      
      {/* Title and info */}
      <Text position={[0, 4, 0]} fontSize={0.3} color="#ffffff">
        Lorenz Strange Attractor
      </Text>
      
      <group position={[-4, 3, 0]}>
        <Text fontSize={0.15} color="#94a3b8" position={[0, 0, 0]}>
          {`σ = ${sigma.toFixed(1)}`}
        </Text>
        <Text fontSize={0.15} color="#94a3b8" position={[0, -0.3, 0]}>
          {`ρ = ${rho.toFixed(1)}`}
        </Text>
        <Text fontSize={0.15} color="#94a3b8" position={[0, -0.6, 0]}>
          {`β = ${beta.toFixed(3)}`}
        </Text>
      </group>
      
      {/* Butterfly effect note */}
      <Text position={[0, -5, 0]} fontSize={0.12} color="#64748b">
        The butterfly effect: small changes lead to vastly different outcomes
      </Text>
    </group>
  );
}
