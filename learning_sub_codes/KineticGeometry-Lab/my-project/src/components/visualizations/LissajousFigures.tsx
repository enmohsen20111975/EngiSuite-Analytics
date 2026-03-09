'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Trail, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';
import { curves } from '@/lib/math/geometry';

export function LissajousFigures() {
  const { animationState, parameters, showTrails } = useGeometryStore();
  const freqA = parameters.freqA ?? 3;
  const freqB = parameters.freqB ?? 4;
  const phase = (parameters.phase ?? 90) * Math.PI / 180;
  
  const lineRef = useRef<THREE.Line>(null);
  const pointsRef = useRef<THREE.Vector3[]>([]);
  const lastTimeRef = useRef(0);
  const maxTrailLength = 800;
  
  const t = animationState.time;
  
  // Current position
  const position = useMemo(() => {
    return curves.lissajous(t, 2, 2, freqA, freqB, phase);
  }, [t, freqA, freqB, phase]);
  
  // Generate complete curve for reference
  const fullCurve = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 500; i++) {
      const t = (i / 500) * Math.PI * 2;
      const point = curves.lissajous(t, 2, 2, freqA, freqB, phase);
      points.push(new THREE.Vector3(point.x, point.y, 0));
    }
    return points;
  }, [freqA, freqB, phase]);
  
  // Update trail in animation frame
  useFrame(() => {
    // Check for time reset
    if (animationState.time < lastTimeRef.current) {
      pointsRef.current = [];
      if (lineRef.current) {
        lineRef.current.geometry.dispose();
        lineRef.current.geometry = new THREE.BufferGeometry().setFromPoints([]);
      }
    }
    lastTimeRef.current = animationState.time;
    
    if (!animationState.isPlaying || !showTrails) return;
    
    const newPoint = new THREE.Vector3(position.x, position.y, 0);
    pointsRef.current.push(newPoint);
    
    if (pointsRef.current.length > maxTrailLength) {
      pointsRef.current.shift();
    }
    
    if (lineRef.current && pointsRef.current.length > 1) {
      lineRef.current.geometry.dispose();
      lineRef.current.geometry = new THREE.BufferGeometry().setFromPoints(pointsRef.current);
    }
  });
  
  // Frequency ratio text
  const ratioText = useMemo(() => {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const g = gcd(freqA, freqB);
    return `${freqA / g}:${freqB / g}`;
  }, [freqA, freqB]);
  
  return (
    <group>
      {/* Reference curve (dimmed) */}
      <Line
        points={fullCurve}
        color="#334155"
        lineWidth={1}
        transparent
        opacity={0.3}
      />
      
      {/* Trail line */}
      {showTrails && (
        <line ref={lineRef}>
          <bufferGeometry />
          <lineBasicMaterial color="#f97316" transparent opacity={0.8} />
        </line>
      )}
      
      {/* Current point */}
      <Trail width={1} length={10} color="#f97316" attenuation={(t) => t * t}>
        <mesh position={[position.x, position.y, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color="#f97316"
            emissive="#f97316"
            emissiveIntensity={1}
          />
        </mesh>
      </Trail>
      
      {/* Axes */}
      <Line
        points={[new THREE.Vector3(-2.5, 0, 0), new THREE.Vector3(2.5, 0, 0)]}
        color="#64748b"
        lineWidth={1}
      />
      <Line
        points={[new THREE.Vector3(0, -2.5, 0), new THREE.Vector3(0, 2.5, 0)]}
        color="#64748b"
        lineWidth={1}
      />
      
      {/* Title and info */}
      <Text position={[0, 3, 0]} fontSize={0.25} color="#ffffff">
        Lissajous Figures
      </Text>
      
      <group position={[-2.5, 2.5, 0]}>
        <Text fontSize={0.15} color="#3b82f6">
          {`X: ${freqA}Hz`}
        </Text>
        <Text fontSize={0.15} color="#22c55e" position={[0, -0.3, 0]}>
          {`Y: ${freqB}Hz`}
        </Text>
        <Text fontSize={0.12} color="#94a3b8" position={[0, -0.6, 0]}>
          Ratio: {ratioText}
        </Text>
        <Text fontSize={0.12} color="#94a3b8" position={[0, -0.9, 0]}>
          Phase: {((phase * 180) / Math.PI).toFixed(0)}°
        </Text>
      </group>
      
      {/* Harmonic indicators */}
      <Text position={[2.2, 0, 0]} fontSize={0.1} color="#3b82f6">
        X
      </Text>
      <Text position={[0, 2.2, 0]} fontSize={0.1} color="#22c55e">
        Y
      </Text>
    </group>
  );
}
