'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';
import { surfaces, spherical } from '@/lib/math/geometry';

export function ParallelTransport() {
  const { animationState, parameters, showVectors } = useGeometryStore();
  const pathLength = parameters.pathLength ?? 0;
  
  const [vectorAngle, setVectorAngle] = useState(0);
  
  // Generate torus (curved surface)
  const torusLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    const R = 1.5;
    const r = 0.5;
    
    // Meridional lines
    for (let i = 0; i < 32; i++) {
      const u = (i / 32) * Math.PI * 2;
      const line: THREE.Vector3[] = [];
      for (let j = 0; j <= 32; j++) {
        const v = (j / 32) * Math.PI * 2;
        const p = surfaces.torus(u, v, R, r);
        line.push(new THREE.Vector3(p.x, p.y, p.z));
      }
      lines.push(line);
    }
    
    // Circumferential lines
    for (let j = 0; j <= 8; j++) {
      const v = (j / 8) * Math.PI * 2;
      const line: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const u = (i / 64) * Math.PI * 2;
        const p = surfaces.torus(u, v, R, r);
        line.push(new THREE.Vector3(p.x, p.y, p.z));
      }
      lines.push(line);
    }
    
    return { lines, R, r };
  }, []);
  
  // Path on torus surface
  const pathPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const { R, r } = torusLines;
    
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const u = t * Math.PI * 2;
      const v = Math.PI / 2; // On the outer equator
      const p = surfaces.torus(u, v, R, r);
      points.push(new THREE.Vector3(p.x, p.y, p.z));
    }
    
    return points;
  }, [torusLines]);
  
  // Current position on path
  const currentPos = useMemo(() => {
    const idx = Math.floor(pathLength * 100);
    const clampedIdx = Math.max(0, Math.min(idx, pathPoints.length - 1));
    return pathPoints[clampedIdx] || pathPoints[0];
  }, [pathLength, pathPoints]);
  
  // Calculate holonomy (angle rotation after completing loop)
  useFrame(() => {
    if (animationState.isPlaying) {
      // On a curved surface, parallel transport causes rotation
      // Holonomy = integral of Gaussian curvature over enclosed area
      const holonomyAngle = pathLength * Math.PI * 0.5;
      setVectorAngle(holonomyAngle);
    }
  });
  
  // Transported vector
  const transportedVector = useMemo(() => {
    const baseTangent = new THREE.Vector3(0, 1, 0);
    baseTangent.applyAxisAngle(new THREE.Vector3(0, 0, 1), vectorAngle);
    
    // Transform to surface tangent space
    const { R, r } = torusLines;
    const u = pathLength * Math.PI * 2;
    const normal = new THREE.Vector3(
      Math.cos(u),
      0,
      Math.sin(u)
    ).normalize();
    
    const tangent = baseTangent.clone().sub(normal.clone().multiplyScalar(baseTangent.dot(normal)));
    
    return tangent.normalize().multiplyScalar(0.4);
  }, [vectorAngle, pathLength, torusLines]);
  
  return (
    <group>
      {/* Torus wireframe */}
      {torusLines.lines.map((line, i) => (
        <Line key={i} points={line} color="#334155" lineWidth={1} transparent opacity={0.4} />
      ))}
      
      {/* Path on surface */}
      <Line points={pathPoints} color="#f97316" lineWidth={3} />
      
      {/* Traveled path */}
      <Line
        points={pathPoints.slice(0, Math.max(1, Math.floor(pathLength * 100)))}
        color="#22c55e"
        lineWidth={4}
      />
      
      {/* Current point */}
      <mesh position={currentPos.toArray()}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.8} />
      </mesh>
      
      {/* Transported vector */}
      {showVectors && (
        <arrowHelper args={[
          transportedVector.clone().normalize(),
          currentPos,
          transportedVector.length(),
          0x22c55e,
          0.1,
          0.05
        ]} />
      )}
      
      {/* Info */}
      <Float speed={2} floatIntensity={0.2}>
        <group position={[3, 2, 0]}>
          <Text fontSize={0.15} color="#ffffff">Parallel Transport</Text>
          <Text fontSize={0.12} color="#22c55e" position={[0, -0.3, 0]}>
            Progress: {(pathLength * 100).toFixed(0)}%
          </Text>
          <Text fontSize={0.1} color="#94a3b8" position={[0, -0.55, 0]}>
            Rotation: {(vectorAngle * 180 / Math.PI).toFixed(1)}°
          </Text>
          <Text fontSize={0.1} color="#64748b" position={[0, -0.8, 0]}>
            Vector stays parallel on surface
          </Text>
        </group>
      </Float>
      
      {/* Title */}
      <Text position={[0, 3, 0]} fontSize={0.3} color="#ffffff">
        Parallel Transport
      </Text>
    </group>
  );
}
