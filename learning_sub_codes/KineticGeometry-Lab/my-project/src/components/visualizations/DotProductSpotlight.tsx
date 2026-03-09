'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';
import { vec2, utils } from '@/lib/math/geometry';

export function DotProductSpotlight() {
  const { parameters, animationState, showVectors } = useGeometryStore();
  const angle1 = utils.degToRad(parameters.vec1Angle ?? 30);
  const angle2 = utils.degToRad(parameters.vec2Angle ?? 75);
  
  // Animated angles when playing
  const a1 = animationState.isPlaying
    ? angle1 + Math.sin(animationState.time * 0.5) * 0.2
    : angle1;
  const a2 = animationState.isPlaying
    ? angle2 + Math.cos(animationState.time * 0.3) * 0.2
    : angle2;
  
  // Two vectors
  const v1 = useMemo(() => ({ x: Math.cos(a1), y: Math.sin(a1) }), [a1]);
  const v2 = useMemo(() => ({ x: Math.cos(a2), y: Math.sin(a2) }), [a2]);
  
  // Scale for display
  const scale = 2;
  
  // Dot product
  const dotProduct = useMemo(() => vec2.dot(v1, v2), [v1, v2]);
  
  // Angle between vectors
  const angleBetween = useMemo(() => {
    return Math.acos(Math.max(-1, Math.min(1, dotProduct)));
  }, [dotProduct]);
  
  // Projection of v1 onto v2
  const projection = useMemo(() => {
    const projLength = dotProduct;
    return vec2.scale(v2, projLength);
  }, [dotProduct, v2]);
  
  // Arc for angle display
  const angleArc = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const arcRadius = 0.5;
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const angle = a1 + t * (a2 - a1);
      points.push(new THREE.Vector3(
        Math.cos(angle) * arcRadius,
        Math.sin(angle) * arcRadius,
        0
      ));
    }
    return points;
  }, [a1, a2]);
  
  // Projection line
  const projLine = useMemo(() => [
    new THREE.Vector3(v1.x * scale, v1.y * scale, 0),
    new THREE.Vector3(projection.x * scale, projection.y * scale, 0),
  ], [v1, projection, scale]);
  
  return (
    <group>
      {/* Origin point */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Vector 1 (red) */}
      <arrowHelper args={[
        new THREE.Vector3(v1.x, v1.y, 0).normalize(),
        new THREE.Vector3(0, 0, 0),
        scale,
        0xef4444,
        0.15,
        0.08
      ]} />
      
      {/* Vector 2 (blue) */}
      <arrowHelper args={[
        new THREE.Vector3(v2.x, v2.y, 0).normalize(),
        new THREE.Vector3(0, 0, 0),
        scale,
        0x3b82f6,
        0.15,
        0.08
      ]} />
      
      {/* Projection line (dashed) */}
      {showVectors && (
        <Line
          points={projLine}
          color="#22c55e"
          lineWidth={1}
          dashed
          dashScale={3}
          gapSize={1}
        />
      )}
      
      {/* Projection vector */}
      {showVectors && (
        <arrowHelper args={[
          new THREE.Vector3(projection.x, projection.y, 0).normalize(),
          new THREE.Vector3(0, 0, 0),
          vec2.length(projection) * scale,
          0x22c55e,
          0.1,
          0.05
        ]} />
      )}
      
      {/* Angle arc */}
      <Line points={angleArc} color="#fbbf24" lineWidth={2} />
      
      {/* Labels */}
      <Text position={[v1.x * scale * 1.2, v1.y * scale * 1.2, 0]} fontSize={0.15} color="#ef4444">
        v₁
      </Text>
      <Text position={[v2.x * scale * 1.2, v2.y * scale * 1.2, 0]} fontSize={0.15} color="#3b82f6">
        v₂
      </Text>
      <Text position={[0.7, 0.3, 0]} fontSize={0.12} color="#fbbf24">
        θ = {utils.radToDeg(angleBetween).toFixed(1)}°
      </Text>
      
      {/* Info panel */}
      <Float speed={2} floatIntensity={0.2}>
        <group position={[3, 2, 0]}>
          <Text fontSize={0.15} color="#ffffff">Dot Product:</Text>
          <Text fontSize={0.12} color="#fbbf24" position={[0, -0.25, 0]}>
            v₁ · v₂ = {dotProduct.toFixed(3)}
          </Text>
          <Text fontSize={0.1} color="#94a3b8" position={[0, -0.5, 0]}>
            cos(θ) = {Math.cos(angleBetween).toFixed(3)}
          </Text>
          <Text fontSize={0.1} color="#22c55e" position={[0, -0.75, 0]}>
            |proj| = {dotProduct.toFixed(3)}
          </Text>
        </group>
      </Float>
      
      {/* Title */}
      <Text position={[0, 3.5, 0]} fontSize={0.3} color="#ffffff">
        Dot Product Visualization
      </Text>
      
      {/* Formula */}
      <Text position={[0, -2.5, 0]} fontSize={0.12} color="#64748b">
        v₁ · v₂ = |v₁||v₂|cos(θ)
      </Text>
    </group>
  );
}
