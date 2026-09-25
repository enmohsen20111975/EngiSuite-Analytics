'use client';

import { useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';

export function InstantCenter() {
  const { animationState, parameters, showVectors } = useGeometryStore();
  const linkRatio = parameters.linkRatio ?? 1;
  
  // Four-bar linkage parameters
  const fixedLink = 3;
  const inputLink = 1;
  const couplerLink = 2;
  const outputLink = 1.5 * linkRatio;
  
  // Animation
  const angle = animationState.isPlaying ? animationState.time * 0.5 : 0;
  
  // Calculate four-bar linkage positions
  const linkage = useMemo(() => {
    const O1 = { x: -fixedLink / 2, y: 0 };
    const O2 = { x: fixedLink / 2, y: 0 };
    
    const A = {
      x: O1.x + inputLink * Math.cos(angle),
      y: O1.y + inputLink * Math.sin(angle),
    };
    
    const d = Math.sqrt((A.x - O2.x) ** 2 + (A.y - O2.y) ** 2);
    const a = (d * d + outputLink * outputLink - couplerLink * couplerLink) / (2 * d);
    const h = Math.sqrt(Math.max(0, outputLink * outputLink - a * a));
    
    const px = O2.x + a * (A.x - O2.x) / d;
    const py = O2.y + a * (A.y - O2.y) / d;
    
    const B = {
      x: px + h * (A.y - O2.y) / d,
      y: py - h * (A.x - O2.x) / d,
    };
    
    // Instant center calculation
    const m1 = (A.y - O1.y) / (A.x - O1.x + 0.0001);
    const m2 = (B.y - O2.y) / (B.x - O2.x + 0.0001);
    
    const Ix = (O2.y - O1.y + m1 * O1.x - m2 * O2.x) / (m1 - m2 + 0.0001);
    const Iy = O1.y + m1 * (Ix - O1.x);
    
    const I = (isFinite(Ix) && isFinite(Iy) && Math.abs(Ix) < 10 && Math.abs(Iy) < 10)
      ? { x: Ix, y: Iy }
      : null;
    
    return { O1, O2, A, B, I };
  }, [angle, fixedLink, inputLink, couplerLink, outputLink]);
  
  // Trail points using state
  const [trailPoints, setTrailPoints] = useState<THREE.Vector3[]>([]);
  
  // Reset trail on animation reset
  const prevTime = useMemo(() => animationState.time, [animationState.time]);
  
  useFrame(() => {
    if (animationState.isPlaying && linkage.I) {
      // Check if time was reset
      if (animationState.time < prevTime) {
        setTrailPoints([]);
      }
      
      setTrailPoints(prev => {
        const newPoint = new THREE.Vector3(linkage.I!.x, linkage.I!.y, 0);
        const newPoints = [...prev, newPoint];
        return newPoints.length > 200 ? newPoints.slice(-200) : newPoints;
      });
    }
  });
  
  return (
    <group>
      {/* Fixed frame */}
      <Line
        points={[
          new THREE.Vector3(linkage.O1.x, linkage.O1.y, 0),
          new THREE.Vector3(linkage.O2.x, linkage.O2.y, 0),
        ]}
        color="#64748b"
        lineWidth={4}
      />
      
      {/* Input link */}
      <Line
        points={[
          new THREE.Vector3(linkage.O1.x, linkage.O1.y, 0),
          new THREE.Vector3(linkage.A.x, linkage.A.y, 0),
        ]}
        color="#ef4444"
        lineWidth={3}
      />
      
      {/* Coupler link */}
      <Line
        points={[
          new THREE.Vector3(linkage.A.x, linkage.A.y, 0),
          new THREE.Vector3(linkage.B.x, linkage.B.y, 0),
        ]}
        color="#f97316"
        lineWidth={3}
      />
      
      {/* Output link */}
      <Line
        points={[
          new THREE.Vector3(linkage.O2.x, linkage.O2.y, 0),
          new THREE.Vector3(linkage.B.x, linkage.B.y, 0),
        ]}
        color="#3b82f6"
        lineWidth={3}
      />
      
      {/* Joint markers */}
      {[linkage.O1, linkage.O2, linkage.A, linkage.B].map((p, i) => (
        <mesh key={i} position={[p.x, p.y, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
      
      {/* Instant center trail */}
      {trailPoints.length > 1 && (
        <Line points={trailPoints} color="#a855f7" lineWidth={2} transparent opacity={0.6} />
      )}
      
      {/* Instant center marker */}
      {linkage.I && (
        <group>
          <mesh position={[linkage.I.x, linkage.I.y, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.8} />
          </mesh>
          <Text position={[linkage.I.x + 0.2, linkage.I.y + 0.2, 0]} fontSize={0.1} color="#a855f7">
            I
          </Text>
        </group>
      )}
      
      {/* Labels */}
      <Text position={[linkage.O1.x, linkage.O1.y - 0.3, 0]} fontSize={0.1} color="#64748b">O₁</Text>
      <Text position={[linkage.O2.x, linkage.O2.y - 0.3, 0]} fontSize={0.1} color="#64748b">O₂</Text>
      <Text position={[linkage.A.x + 0.15, linkage.A.y + 0.1, 0]} fontSize={0.1} color="#ef4444">A</Text>
      <Text position={[linkage.B.x + 0.15, linkage.B.y + 0.1, 0]} fontSize={0.1} color="#3b82f6">B</Text>
      
      {/* Info */}
      <Float speed={2} floatIntensity={0.2}>
        <group position={[3, 2, 0]}>
          <Text fontSize={0.15} color="#ffffff">Four-Bar Linkage</Text>
          <Text fontSize={0.12} color="#a855f7" position={[0, -0.3, 0]}>
            Instant Center of Rotation
          </Text>
          <Text fontSize={0.1} color="#64748b" position={[0, -0.55, 0]}>
            Point I has zero instantaneous velocity
          </Text>
        </group>
      </Float>
      
      {/* Title */}
      <Text position={[0, 3.5, 0]} fontSize={0.3} color="#ffffff">
        Instant Center of Rotation
      </Text>
    </group>
  );
}
