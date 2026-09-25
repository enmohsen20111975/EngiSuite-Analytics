'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';
import { utils } from '@/lib/math/geometry';

export function PappusTheorem() {
  const { animationState, parameters } = useGeometryStore();
  const shapeType = Math.floor(parameters.shape ?? 0);
  const revolution = utils.degToRad(parameters.revolution ?? 0);
  
  // Shapes
  const shapes = useMemo(() => {
    switch (shapeType) {
      case 0: // Semi-circle
        return {
          profile: Array.from({ length: 50 }, (_, i) => {
            const t = (i / 49) * Math.PI;
            return { x: 0.5 + Math.cos(t), y: Math.sin(t) };
          }),
          centroid: { x: 0.5 + (2 / 3), y: 0 },
          area: Math.PI / 2,
        };
      case 1: // Rectangle
        return {
          profile: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 0.5 },
            { x: 0, y: 0.5 },
            { x: 0, y: 0 },
          ],
          centroid: { x: 0.5, y: 0.25 },
          area: 0.5,
        };
      case 2: // Triangle
        return {
          profile: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0.5, y: 0.75 },
            { x: 0, y: 0 },
          ],
          centroid: { x: 0.5, y: 0.25 },
          area: 0.375,
        };
      default:
        return {
          profile: [{ x: 0, y: 0 }],
          centroid: { x: 0, y: 0 },
          area: 0,
        };
    }
  }, [shapeType]);
  
  // Calculate surface area and volume using derived values
  const { surfaceArea, volume } = useMemo(() => {
    const centroidPathRadius = shapes.centroid.x;
    const centroidPathLength = 2 * Math.PI * centroidPathRadius * (revolution / (Math.PI * 2));
    
    return {
      surfaceArea: shapes.area * 2 * centroidPathLength,
      volume: shapes.area * centroidPathLength,
    };
  }, [shapes, revolution]);
  
  // Revolved surface
  const revolvedSurface = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    
    for (let i = 0; i <= 16; i++) {
      const angle = (i / 16) * revolution;
      const line: THREE.Vector3[] = [];
      
      for (const p of shapes.profile) {
        line.push(new THREE.Vector3(
          p.x * Math.cos(angle),
          p.y,
          p.x * Math.sin(angle)
        ));
      }
      lines.push(line);
    }
    
    // Rings
    for (let j = 0; j < shapes.profile.length - 1; j += 5) {
      const ring: THREE.Vector3[] = [];
      const p = shapes.profile[j];
      
      for (let i = 0; i <= 32; i++) {
        const angle = (i / 32) * revolution;
        ring.push(new THREE.Vector3(
          p.x * Math.cos(angle),
          p.y,
          p.x * Math.sin(angle)
        ));
      }
      lines.push(ring);
    }
    
    return lines;
  }, [shapes.profile, revolution]);
  
  // Centroid path
  const centroidPath = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * revolution;
      points.push(new THREE.Vector3(
        shapes.centroid.x * Math.cos(angle),
        shapes.centroid.y,
        shapes.centroid.x * Math.sin(angle)
      ));
    }
    return points;
  }, [shapes.centroid, revolution]);
  
  // Profile curve
  const profileLine = useMemo(() => 
    shapes.profile.map(p => new THREE.Vector3(p.x, p.y, 0)),
  [shapes.profile]);
  
  const shapeNames = ['Semi-circle', 'Rectangle', 'Triangle'];
  
  return (
    <group>
      {/* Revolution axis */}
      <Line
        points={[new THREE.Vector3(0, -0.5, 0), new THREE.Vector3(0, 2, 0)]}
        color="#64748b"
        lineWidth={2}
        dashed
      />
      
      {/* Profile curve */}
      <Line points={profileLine} color="#f97316" lineWidth={3} />
      
      {/* Revolved surface */}
      {revolvedSurface.map((line, i) => (
        <Line key={i} points={line} color="#f97316" lineWidth={1} transparent opacity={0.4} />
      ))}
      
      {/* Centroid path */}
      <Line points={centroidPath} color="#a855f7" lineWidth={3} />
      
      {/* Centroid marker */}
      <mesh position={[shapes.centroid.x * Math.cos(revolution), shapes.centroid.y, shapes.centroid.x * Math.sin(revolution)]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Centroid on profile */}
      <mesh position={[shapes.centroid.x, shapes.centroid.y, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
      
      {/* Info */}
      <Float speed={2} floatIntensity={0.2}>
        <group position={[4, 2, 0]}>
          <Text fontSize={0.15} color="#ffffff">Pappus Centroid Theorem</Text>
          <Text fontSize={0.12} color="#f97316" position={[0, -0.3, 0]}>
            Shape: {shapeNames[shapeType]}
          </Text>
          <Text fontSize={0.1} color="#a855f7" position={[0, -0.55, 0]}>
            Revolution: {utils.radToDeg(revolution).toFixed(0)}°
          </Text>
          <Text fontSize={0.1} color="#94a3b8" position={[0, -0.8, 0]}>
            Area: {shapes.area.toFixed(3)}
          </Text>
          <Text fontSize={0.1} color="#64748b" position={[0, -1.05, 0]}>
            Vol: {volume.toFixed(3)}
          </Text>
        </group>
      </Float>
      
      {/* Title */}
      <Text position={[0, 3, 0]} fontSize={0.3} color="#ffffff">
        Pappus Centroid Theorems
      </Text>
    </group>
  );
}
