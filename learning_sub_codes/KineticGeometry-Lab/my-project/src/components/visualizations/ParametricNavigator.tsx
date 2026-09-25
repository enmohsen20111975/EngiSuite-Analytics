'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Trail, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';
import { curves } from '@/lib/math/geometry';

export function ParametricNavigator() {
  const { animationState, parameters, showTrails } = useGeometryStore();
  const tMin = parameters.tMin ?? -Math.PI;
  const tMax = parameters.tMax ?? 2 * Math.PI;
  
  const pointRef = useRef<THREE.Mesh>(null);
  const trailLineRef = useRef<THREE.Line>(null);
  const trailPointsRef = useRef<THREE.Vector3[]>([]);
  const lastTimeRef = useRef(0);
  
  // Map time to parameter t
  const t = useMemo(() => {
    const cycleTime = animationState.time % 10;
    const normalizedT = cycleTime / 10;
    return tMin + normalizedT * (tMax - tMin);
  }, [animationState.time, tMin, tMax]);
  
  // Calculate position from parametric equation (spiral)
  const position = useMemo(() => {
    return new THREE.Vector3(
      Math.cos(t) * (1 + t * 0.1),
      t * 0.2,
      Math.sin(t) * (1 + t * 0.1)
    );
  }, [t]);
  
  // Generate full curve for reference
  const fullCurve = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 200; i++) {
      const tt = tMin + (i / 200) * (tMax - tMin);
      points.push(new THREE.Vector3(
        Math.cos(tt) * (1 + tt * 0.1),
        tt * 0.2,
        Math.sin(tt) * (1 + tt * 0.1)
      ));
    }
    return points;
  }, [tMin, tMax]);
  
  useFrame(() => {
    if (animationState.time < lastTimeRef.current) {
      trailPointsRef.current = [];
      if (trailLineRef.current) {
        trailLineRef.current.geometry.dispose();
        trailLineRef.current.geometry = new THREE.BufferGeometry();
      }
    }
    lastTimeRef.current = animationState.time;
    
    if (pointRef.current && animationState.isPlaying) {
      pointRef.current.position.copy(position);
      
      if (showTrails) {
        trailPointsRef.current.push(position.clone());
        if (trailPointsRef.current.length > 300) {
          trailPointsRef.current.shift();
        }
        
        if (trailLineRef.current && trailPointsRef.current.length > 1) {
          trailLineRef.current.geometry.dispose();
          trailLineRef.current.geometry = new THREE.BufferGeometry().setFromPoints(trailPointsRef.current);
        }
      }
    }
  });
  
  return (
    <group>
      {/* Reference curve */}
      <Line points={fullCurve} color="#334155" lineWidth={1} transparent opacity={0.4} />
      
      {/* Trail */}
      <line ref={trailLineRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#f97316" transparent opacity={0.7} />
      </line>
      
      {/* Current point */}
      <Trail width={1} length={8} color="#f97316" attenuation={(t) => t * t}>
        <mesh ref={pointRef} position={position.toArray()}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.8} />
        </mesh>
      </Trail>
      
      {/* Parameter space visualization */}
      <group position={[4, 2, 0]}>
        <Text fontSize={0.2} color="#ffffff" position={[0, 1, 0]}>
          Parameter Space
        </Text>
        <Line
          points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 0, 0)]}
          color="#64748b"
          lineWidth={1}
        />
        <Text fontSize={0.12} color="#94a3b8" position={[2.2, 0, 0]}>t</Text>
        <mesh position={[(t - tMin) / (tMax - tMin) * 2, 0, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
        </mesh>
        <Text fontSize={0.1} color="#22c55e" position={[(t - tMin) / (tMax - tMin) * 2, -0.3, 0]}>
          t = {t.toFixed(2)}
        </Text>
      </group>
      
      {/* Output display */}
      <Float speed={2} floatIntensity={0.2}>
        <Text position={[-3, 3, 0]} fontSize={0.15} color="#ffffff">
          {`Output: x=${position.x.toFixed(2)}, y=${position.y.toFixed(2)}, z=${position.z.toFixed(2)}`}
        </Text>
      </Float>
      
      {/* Title */}
      <Text position={[0, 4, 0]} fontSize={0.3} color="#ffffff">
        Parametric Space Navigator
      </Text>
    </group>
  );
}
