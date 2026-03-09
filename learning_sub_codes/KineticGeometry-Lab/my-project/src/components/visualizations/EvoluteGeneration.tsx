'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';

export function EvoluteGeneration() {
  const { animationState, parameters, showTrails } = useGeometryStore();
  const a = parameters.a ?? 2;
  const b = parameters.b ?? 1;
  
  const evoluteLineRef = useRef<THREE.Line>(null);
  const evolutePointsRef = useRef<THREE.Vector3[]>([]);
  const lastTimeRef = useRef(0);
  
  // Current parameter on ellipse
  const t = animationState.time * 0.5;
  
  // Generate ellipse
  const ellipsePoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 100; i++) {
      const angle = (i / 100) * Math.PI * 2;
      points.push(new THREE.Vector3(
        a * Math.cos(angle),
        b * Math.sin(angle),
        0
      ));
    }
    return points;
  }, [a, b]);
  
  // Current point on ellipse
  const currentPoint = useMemo(() => ({
    x: a * Math.cos(t),
    y: b * Math.sin(t),
  }), [t, a, b]);
  
  // Calculate curvature center (evolute point)
  // For ellipse: center of curvature at parameter t
  const curvatureCenter = useMemo(() => {
    // Radius of curvature for ellipse
    const denom = Math.sqrt(a * a * Math.sin(t) ** 2 + b * b * Math.cos(t) ** 2);
    const nx = -a * Math.sin(t) / denom;
    const ny = b * Math.cos(t) / denom;
    
    // Radius of curvature
    const R = (a * a * b * b) / (a * a * Math.sin(t) ** 2 + b * b * Math.cos(t) ** 2) ** 1.5;
    
    return {
      x: currentPoint.x + nx * R,
      y: currentPoint.y + ny * R,
    };
  }, [t, a, b, currentPoint]);
  
  // Normal vector at current point
  const normal = useMemo(() => {
    const denom = Math.sqrt(a * a * Math.sin(t) ** 2 + b * b * Math.cos(t) ** 2);
    return {
      x: -a * Math.sin(t) / denom,
      y: b * Math.cos(t) / denom,
    };
  }, [t, a, b]);
  
  // Generate evolute curve (theoretical)
  const evoluteCurve = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 100; i++) {
      const angle = (i / 100) * Math.PI * 2;
      const denom = Math.sqrt(a * a * Math.sin(angle) ** 2 + b * b * Math.cos(angle) ** 2);
      const nx = -a * Math.sin(angle) / denom;
      const ny = b * Math.cos(angle) / denom;
      const R = (a * a * b * b) / (a * a * Math.sin(angle) ** 2 + b * b * Math.cos(angle) ** 2) ** 1.5;
      
      const px = a * Math.cos(angle);
      const py = b * Math.sin(angle);
      
      points.push(new THREE.Vector3(
        px + nx * R,
        py + ny * R,
        0
      ));
    }
    return points;
  }, [a, b]);
  
  // Update traced evolute
  useFrame(() => {
    if (animationState.time < lastTimeRef.current) {
      evolutePointsRef.current = [];
      if (evoluteLineRef.current) {
        evoluteLineRef.current.geometry.dispose();
        evoluteLineRef.current.geometry = new THREE.BufferGeometry();
      }
    }
    lastTimeRef.current = animationState.time;
    
    if (animationState.isPlaying) {
      evolutePointsRef.current.push(new THREE.Vector3(
        curvatureCenter.x,
        curvatureCenter.y,
        0
      ));
      
      if (evoluteLineRef.current && evolutePointsRef.current.length > 1) {
        evoluteLineRef.current.geometry.dispose();
        evoluteLineRef.current.geometry = new THREE.BufferGeometry().setFromPoints(evolutePointsRef.current);
      }
    }
  });
  
  return (
    <group>
      {/* Ellipse */}
      <Line points={ellipsePoints} color="#f97316" lineWidth={3} />
      
      {/* Theoretical evolute (dimmed) */}
      <Line points={evoluteCurve} color="#334155" lineWidth={1} transparent opacity={0.4} />
      
      {/* Traced evolute */}
      <line ref={evoluteLineRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#a855f7" />
      </line>
      
      {/* Current point on ellipse */}
      <mesh position={[currentPoint.x, currentPoint.y, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.8} />
      </mesh>
      
      {/* Normal line to curvature center */}
      <Line
        points={[
          new THREE.Vector3(currentPoint.x, currentPoint.y, 0),
          new THREE.Vector3(curvatureCenter.x, curvatureCenter.y, 0),
        ]}
        color="#94a3b8"
        lineWidth={1}
        dashed
      />
      
      {/* Curvature center */}
      <mesh position={[curvatureCenter.x, curvatureCenter.y, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Axes */}
      <Line points={[new THREE.Vector3(-3, 0, 0), new THREE.Vector3(3, 0, 0)]} color="#64748b" lineWidth={1} />
      <Line points={[new THREE.Vector3(0, -3, 0), new THREE.Vector3(0, 3, 0)]} color="#64748b" lineWidth={1} />
      
      {/* Info */}
      <Float speed={2} floatIntensity={0.2}>
        <group position={[4, 2, 0]}>
          <Text fontSize={0.15} color="#ffffff">Evolute Generation</Text>
          <Text fontSize={0.12} color="#f97316" position={[0, -0.3, 0]}>
            Ellipse: a={a.toFixed(1)}, b={b.toFixed(1)}
          </Text>
          <Text fontSize={0.1} color="#a855f7" position={[0, -0.55, 0]}>
            Evolute: locus of curvature centers
          </Text>
        </group>
      </Float>
      
      {/* Title */}
      <Text position={[0, 4, 0]} fontSize={0.3} color="#ffffff">
        Evolute Generation
      </Text>
    </group>
  );
}
