'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Trail, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';
import { curves } from '@/lib/math/geometry';

export function EpicycloidGenerator() {
  const { animationState, parameters, showTrails } = useGeometryStore();
  const R = parameters.R ?? 2;
  const r = parameters.r ?? 0.5;
  const type = Math.floor(parameters.type ?? 1); // 0 = hypocycloid, 1 = epicycloid
  
  const pointRef = useRef<THREE.Mesh>(null);
  const trailLineRef = useRef<THREE.Line>(null);
  const trailPointsRef = useRef<THREE.Vector3[]>([]);
  const lastTimeRef = useRef(0);
  const maxTrailLength = 500;
  
  const t = animationState.time * (animationState.isPlaying ? 1 : 0);
  
  // Current point on curve
  const point = useMemo(() => {
    return type === 1
      ? curves.epicycloid(t, R, r)
      : curves.hypocycloid(t, R, r);
  }, [t, R, r, type]);
  
  // Rolling circle position
  const circleCenter = useMemo(() => {
    const centerDist = type === 1 ? R + r : R - r;
    return {
      x: centerDist * Math.cos(t),
      y: centerDist * Math.sin(t),
    };
  }, [t, R, r, type]);
  
  // Generate full curve for reference
  const fullCurve = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const periods = type === 1 ? (R + r) / gcd(R, r) : (R - r) / gcd(R, r);
    const maxT = Math.abs(periods) * Math.PI * 2;
    
    for (let i = 0; i <= 500; i++) {
      const tt = (i / 500) * maxT;
      const p = type === 1
        ? curves.epicycloid(tt, R, r)
        : curves.hypocycloid(tt, R, r);
      points.push(new THREE.Vector3(p.x, p.y, 0));
    }
    return points;
  }, [R, r, type]);
  
  // Rolling circle
  const rollingCircle = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      points.push(new THREE.Vector3(
        circleCenter.x + r * Math.cos(angle),
        circleCenter.y + r * Math.sin(angle),
        0
      ));
    }
    return points;
  }, [circleCenter, r]);
  
  // Fixed circle
  const fixedCircle = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      points.push(new THREE.Vector3(
        R * Math.cos(angle),
        R * Math.sin(angle),
        0
      ));
    }
    return points;
  }, [R]);
  
  // Helper function for GCD
  function gcd(a: number, b: number): number {
    a = Math.abs(Math.round(a * 10));
    b = Math.abs(Math.round(b * 10));
    return b === 0 ? a / 10 : gcd(b, a % b) / 10;
  }
  
  // Reset trail when time resets
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
      pointRef.current.position.set(point.x, point.y, 0);
      
      if (showTrails) {
        trailPointsRef.current.push(new THREE.Vector3(point.x, point.y, 0));
        if (trailPointsRef.current.length > maxTrailLength) {
          trailPointsRef.current.shift();
        }
        
        if (trailLineRef.current && trailPointsRef.current.length > 1) {
          trailLineRef.current.geometry.dispose();
          trailLineRef.current.geometry = new THREE.BufferGeometry().setFromPoints(trailPointsRef.current);
        }
      }
    }
  });
  
  const curveName = type === 1 ? 'Epicycloid' : 'Hypocycloid';
  const ratio = `${R.toFixed(1)}:${r.toFixed(1)}`;
  
  return (
    <group>
      {/* Fixed circle */}
      <Line points={fixedCircle} color="#64748b" lineWidth={2} />
      
      {/* Rolling circle */}
      <Line points={rollingCircle} color="#3b82f6" lineWidth={1.5} />
      
      {/* Full curve reference */}
      <Line points={fullCurve} color="#334155" lineWidth={1} transparent opacity={0.3} />
      
      {/* Trail */}
      <line ref={trailLineRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#f97316" transparent opacity={0.8} />
      </line>
      
      {/* Line from center to point */}
      <Line
        points={[
          new THREE.Vector3(circleCenter.x, circleCenter.y, 0),
          new THREE.Vector3(point.x, point.y, 0),
        ]}
        color="#94a3b8"
        lineWidth={1}
        dashed
      />
      
      {/* Current point */}
      <Trail width={0.8} length={6} color="#f97316" attenuation={(t) => t * t}>
        <mesh ref={pointRef} position={[point.x, point.y, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.8} />
        </mesh>
      </Trail>
      
      {/* Rolling circle center */}
      <mesh position={[circleCenter.x, circleCenter.y, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      
      {/* Info */}
      <Float speed={2} floatIntensity={0.2}>
        <group position={[4, 2, 0]}>
          <Text fontSize={0.2} color="#ffffff">{curveName}</Text>
          <Text fontSize={0.12} color="#94a3b8" position={[0, -0.3, 0]}>
            Ratio R:r = {ratio}
          </Text>
          <Text fontSize={0.1} color="#64748b" position={[0, -0.55, 0]}>
            Fixed R = {R.toFixed(1)}
          </Text>
          <Text fontSize={0.1} color="#64748b" position={[0, -0.75, 0]}>
            Rolling r = {r.toFixed(1)}
          </Text>
        </group>
      </Float>
      
      {/* Title */}
      <Text position={[0, 4, 0]} fontSize={0.3} color="#ffffff">
        {curveName} Generator
      </Text>
    </group>
  );
}
