'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';
import { utils } from '@/lib/math/geometry';

export function BasisTransformation() {
  const { parameters, animationState } = useGeometryStore();
  const angle = utils.degToRad(parameters.angle ?? 0);
  const scaleX = parameters.scaleX ?? 1;
  const scaleY = parameters.scaleY ?? 1;
  
  // Animated transformation
  const animatedAngle = animationState.isPlaying
    ? angle + animationState.time * 0.3
    : angle;
  
  // Transformation matrix
  const transform = useMemo(() => {
    const cos = Math.cos(animatedAngle);
    const sin = Math.sin(animatedAngle);
    return {
      i: new THREE.Vector3(cos * scaleX, sin * scaleX, 0),
      j: new THREE.Vector3(-sin * scaleY, cos * scaleY, 0),
    };
  }, [animatedAngle, scaleX, scaleY]);
  
  // Generate transformed grid
  const gridLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    const size = 4;
    const step = 1;
    
    // Vertical lines
    for (let i = -size; i <= size; i += step) {
      const line: THREE.Vector3[] = [];
      for (let j = -size; j <= size; j += step * 0.5) {
        const x = i * transform.i.x + j * transform.j.x;
        const y = i * transform.i.y + j * transform.j.y;
        line.push(new THREE.Vector3(x, y, 0));
      }
      lines.push(line);
    }
    
    // Horizontal lines
    for (let j = -size; j <= size; j += step) {
      const line: THREE.Vector3[] = [];
      for (let i = -size; i <= size; i += step * 0.5) {
        const x = i * transform.i.x + j * transform.j.x;
        const y = i * transform.i.y + j * transform.j.y;
        line.push(new THREE.Vector3(x, y, 0));
      }
      lines.push(line);
    }
    
    return lines;
  }, [transform]);
  
  // Original basis vectors (red and green)
  const origin = new THREE.Vector3(0, 0, 0);
  const e1 = new THREE.Vector3(2, 0, 0);
  const e2 = new THREE.Vector3(0, 2, 0);
  
  // Transformed basis vectors
  const b1 = transform.i.clone().multiplyScalar(2);
  const b2 = transform.j.clone().multiplyScalar(2);
  
  return (
    <group>
      {/* Original grid (faded) */}
      <Grid
        args={[8, 8]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#64748b"
        sectionSize={4}
        sectionThickness={1}
        sectionColor="#475569"
        fadeDistance={15}
        fadeStrength={1}
        followCamera={false}
      />
      
      {/* Transformed grid */}
      {gridLines.map((line, i) => (
        <Line
          key={i}
          points={line}
          color="#f97316"
          lineWidth={1}
          transparent
          opacity={0.6}
        />
      ))}
      
      {/* Original basis vectors */}
      <arrowHelper args={[new THREE.Vector3(1, 0, 0), origin, 2, 0xef4444, 0.15, 0.08]} />
      <arrowHelper args={[new THREE.Vector3(0, 1, 0), origin, 2, 0x22c55e, 0.15, 0.08]} />
      
      {/* Transformed basis vectors */}
      <arrowHelper args={[transform.i.clone().normalize(), origin, b1.length(), 0xfbbf24, 0.15, 0.08]} />
      <arrowHelper args={[transform.j.clone().normalize(), origin, b2.length(), 0xa855f7, 0.15, 0.08]} />
      
      {/* Labels */}
      <Text position={[2.3, 0, 0]} fontSize={0.15} color="#ef4444">e₁</Text>
      <Text position={[0, 2.3, 0]} fontSize={0.15} color="#22c55e">e₂</Text>
      <Text position={[b1.x * 1.15, b1.y * 1.15, 0]} fontSize={0.15} color="#fbbf24">b₁</Text>
      <Text position={[b2.x * 1.15, b2.y * 1.15, 0]} fontSize={0.15} color="#a855f7">b₂</Text>
      
      {/* Matrix display */}
      <group position={[4, 2, 0]}>
        <Text fontSize={0.15} color="#ffffff">Transformation Matrix:</Text>
        <Text fontSize={0.12} color="#fbbf24" position={[0, -0.3, 0]}>
          {`[${transform.i.x.toFixed(2)}, ${transform.j.x.toFixed(2)}]`}
        </Text>
        <Text fontSize={0.12} color="#a855f7" position={[0, -0.5, 0]}>
          {`[${transform.i.y.toFixed(2)}, ${transform.j.y.toFixed(2)}]`}
        </Text>
      </group>
      
      {/* Title */}
      <Text position={[0, 4, 0]} fontSize={0.3} color="#ffffff">
        Basis Transformation
      </Text>
    </group>
  );
}
