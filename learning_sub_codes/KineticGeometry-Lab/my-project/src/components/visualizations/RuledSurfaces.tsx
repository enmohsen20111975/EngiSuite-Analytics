'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';
import { surfaces, vec3 } from '@/lib/math/geometry';

export function RuledSurfaces() {
  const { animationState, parameters, showTrails } = useGeometryStore();
  const twist = parameters.twist ?? 0.5;
  const segments = Math.floor(parameters.segments ?? 30);
  
  // Animation time
  const t = animationState.isPlaying ? animationState.time : 0;
  const sweepProgress = (t * 0.2) % 1;
  
  // Generate ruled surface lines
  const surfaceLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    
    for (let i = 0; i < segments; i++) {
      const u = i / segments;
      const line: THREE.Vector3[] = [];
      
      for (let v = 0; v <= 20; v++) {
        const vv = v / 20 - 0.5;
        
        // Two curves defining the ruled surface
        // Curve 1: circle at z = -1
        const c1x = Math.cos(u * Math.PI * 2 + twist * vv);
        const c1y = Math.sin(u * Math.PI * 2 + twist * vv);
        const c1z = -1;
        
        // Curve 2: circle at z = 1 (with offset)
        const c2x = Math.cos(u * Math.PI * 2 + twist * vv + Math.PI);
        const c2y = Math.sin(u * Math.PI * 2 + twist * vv + Math.PI);
        const c2z = 1;
        
        // Interpolate between curves
        const x = c1x + vv * (c2x - c1x);
        const y = c1y + vv * (c2y - c1y);
        const z = c1z + (vv + 0.5) * (c2z - c1z);
        
        line.push(new THREE.Vector3(x, y, z));
      }
      lines.push(line);
    }
    
    return lines;
  }, [twist, segments]);
  
  // The sweeping line
  const sweepLine = useMemo(() => {
    const u = sweepProgress;
    const line: THREE.Vector3[] = [];
    
    for (let v = 0; v <= 20; v++) {
      const vv = v / 20 - 0.5;
      const c1x = Math.cos(u * Math.PI * 2 + twist * vv);
      const c1y = Math.sin(u * Math.PI * 2 + twist * vv);
      const c1z = -1;
      const c2x = Math.cos(u * Math.PI * 2 + twist * vv + Math.PI);
      const c2y = Math.sin(u * Math.PI * 2 + twist * vv + Math.PI);
      const c2z = 1;
      
      line.push(new THREE.Vector3(
        c1x + vv * (c2x - c1x),
        c1y + vv * (c2y - c1y),
        c1z + (vv + 0.5) * (c2z - c1z)
      ));
    }
    return line;
  }, [sweepProgress, twist]);
  
  return (
    <group>
      {/* Surface lines */}
      {surfaceLines.map((line, i) => (
        <Line
          key={i}
          points={line}
          color="#f97316"
          lineWidth={1}
          transparent
          opacity={0.6}
        />
      ))}
      
      {/* Sweeping line (highlighted) */}
      <Line points={sweepLine} color="#22c55e" lineWidth={3} />
      
      {/* End curves */}
      <Line
        points={Array.from({ length: 65 }, (_, i) => {
          const angle = (i / 64) * Math.PI * 2;
          return new THREE.Vector3(Math.cos(angle), Math.sin(angle), -1);
        })}
        color="#3b82f6"
        lineWidth={2}
      />
      <Line
        points={Array.from({ length: 65 }, (_, i) => {
          const angle = (i / 64) * Math.PI * 2 + Math.PI;
          return new THREE.Vector3(Math.cos(angle), Math.sin(angle), 1);
        })}
        color="#3b82f6"
        lineWidth={2}
      />
      
      {/* Info */}
      <Float speed={2} floatIntensity={0.2}>
        <group position={[3, 2, 0]}>
          <Text fontSize={0.15} color="#ffffff">Ruled Surface</Text>
          <Text fontSize={0.12} color="#94a3b8" position={[0, -0.3, 0]}>
            Twist: {twist.toFixed(2)}
          </Text>
          <Text fontSize={0.1} color="#64748b" position={[0, -0.55, 0]}>
            Lines connect two curves
          </Text>
        </group>
      </Float>
      
      {/* Title */}
      <Text position={[0, 3, 0]} fontSize={0.3} color="#ffffff">
        Ruled Surfaces Generator
      </Text>
    </group>
  );
}
