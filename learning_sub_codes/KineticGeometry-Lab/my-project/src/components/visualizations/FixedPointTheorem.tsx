'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';

export function FixedPointTheorem() {
  const { animationState, parameters, showVectors } = useGeometryStore();
  const fieldType = Math.floor(parameters.fieldType ?? 0);
  
  // Time for animation
  const time = animationState.isPlaying ? animationState.time : 0;
  
  // Vector field based on type
  const vectorField = useMemo(() => {
    const vectors: Array<{ pos: [number, number]; dir: [number, number]; color: string }> = [];
    
    for (let x = -2; x <= 2; x += 0.5) {
      for (let y = -2; y <= 2; y += 0.5) {
        let dx: number, dy: number;
        
        switch (fieldType) {
          case 0: // Rotation (no fixed points)
            dx = -y;
            dy = x;
            break;
          case 1: // Sink (fixed point at origin)
            dx = -x * 0.5;
            dy = -y * 0.5;
            break;
          case 2: // Source (fixed point at origin)
            dx = x * 0.5;
            dy = y * 0.5;
            break;
          default:
            dx = 0;
            dy = 0;
        }
        
        const mag = Math.sqrt(dx * dx + dy * dy);
        const color = mag < 0.1 ? '#ef4444' : '#f97316';
        
        vectors.push({
          pos: [x, y],
          dir: [dx, dy],
          color,
        });
      }
    }
    
    return vectors;
  }, [fieldType]);
  
  // Fixed points
  const fixedPoints = useMemo(() => {
    switch (fieldType) {
      case 0:
        return []; // No fixed points for pure rotation
      case 1:
      case 2:
        return [[0, 0]]; // Origin is fixed point
      default:
        return [];
    }
  }, [fieldType]);
  
  // Flow lines (streamlines)
  const flowLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    const dt = 0.02;
    const steps = 200;
    
    // Start points for streamlines
    const startPoints = [
      [2, 0], [-2, 0], [0, 2], [0, -2],
      [1.5, 1.5], [-1.5, 1.5], [1.5, -1.5], [-1.5, -1.5],
    ];
    
    for (const [sx, sy] of startPoints) {
      const line: THREE.Vector3[] = [];
      let x = sx, y = sy;
      
      for (let i = 0; i < steps; i++) {
        line.push(new THREE.Vector3(x, y, 0));
        
        let dx: number, dy: number;
        switch (fieldType) {
          case 0:
            dx = -y;
            dy = x;
            break;
          case 1:
            dx = -x * 0.5;
            dy = -y * 0.5;
            break;
          case 2:
            dx = x * 0.5;
            dy = y * 0.5;
            break;
          default:
            dx = 0;
            dy = 0;
        }
        
        x += dx * dt;
        y += dy * dt;
        
        if (Math.abs(x) > 3 || Math.abs(y) > 3) break;
      }
      
      lines.push(line);
    }
    
    return lines;
  }, [fieldType]);
  
  const fieldNames = ['Rotation (no fixed point)', 'Sink (fixed point at origin)', 'Source (fixed point at origin)'];
  
  return (
    <group>
      {/* Boundary circle (representing disk) */}
      <Line
        points={Array.from({ length: 65 }, (_, i) => {
          const angle = (i / 64) * Math.PI * 2;
          return new THREE.Vector3(2.5 * Math.cos(angle), 2.5 * Math.sin(angle), 0);
        })}
        color="#64748b"
        lineWidth={2}
      />
      
      {/* Vector field arrows */}
      {showVectors && vectorField.map((v, i) => {
        const mag = Math.sqrt(v.dir[0] ** 2 + v.dir[1] ** 2);
        const dir = new THREE.Vector3(v.dir[0], v.dir[1], 0).normalize();
        const len = Math.min(mag * 0.3, 0.4);
        
        return (
          <arrowHelper
            key={i}
            args={[
              dir,
              new THREE.Vector3(v.pos[0], v.pos[1], 0),
              len,
              parseInt(v.color.replace('#', ''), 16),
              0.05,
              0.03
            ]}
          />
        );
      })}
      
      {/* Flow lines */}
      {flowLines.map((line, i) => (
        <Line key={i} points={line} color="#f97316" lineWidth={1} transparent opacity={0.5} />
      ))}
      
      {/* Fixed points */}
      {fixedPoints.map((fp, i) => (
        <group key={i}>
          <mesh position={[fp[0], fp[1], 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
          </mesh>
          <Text position={[fp[0], fp[1] - 0.4, 0]} fontSize={0.12} color="#ef4444">
            Fixed Point
          </Text>
        </group>
      ))}
      
      {/* Info */}
      <Float speed={2} floatIntensity={0.2}>
        <group position={[4, 2, 0]}>
          <Text fontSize={0.15} color="#ffffff">Brouwer Fixed Point</Text>
          <Text fontSize={0.12} color="#f97316" position={[0, -0.3, 0]}>
            {fieldNames[fieldType]}
          </Text>
          <Text fontSize={0.1} color="#64748b" position={[0, -0.55, 0]}>
            Fixed points: {fixedPoints.length}
          </Text>
          <Text fontSize={0.1} color="#94a3b8" position={[0, -0.8, 0]}>
            Every continuous map has a fixed point
          </Text>
        </group>
      </Float>
      
      {/* Title */}
      <Text position={[0, 3.5, 0]} fontSize={0.3} color="#ffffff">
        Fixed Point Theorem
      </Text>
    </group>
  );
}
