'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';

// Generate Hilbert curve points
function generateHilbertCurve(order: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  
  function hilbert(x: number, y: number, dx: number, dy: number, n: number) {
    if (n <= 0) {
      points.push(new THREE.Vector3(x + dx / 2, y + dy / 2, 0));
      return;
    }
    
    hilbert(x, y, dy / 2, dx / 2, n - 1);
    hilbert(x + dx / 2, y + dy / 2, dy / 2, dx / 2, n - 1);
    hilbert(x + dx / 2 + dy / 2, y + dy / 2 + dx / 2, dy / 2, dx / 2, n - 1);
    hilbert(x + dx / 2 + dy / 2 + dx, y + dy / 2 + dx / 2 - dy, -dy / 2, -dx / 2, n - 1);
  }
  
  const size = 4;
  hilbert(-size / 2, -size / 2, size, size, order);
  
  return points;
}

// Generate Peano curve points (simplified)
function generatePeanoCurve(order: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  
  function peano(x: number, y: number, size: number, depth: number, direction: number) {
    if (depth <= 0) {
      points.push(new THREE.Vector3(x, y, 0));
      return;
    }
    
    const step = size / 3;
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const nx = x + (i - 1) * step;
        const ny = y + (j - 1) * step;
        peano(nx, ny, step, depth - 1, (direction + i + j) % 4);
      }
    }
  }
  
  peano(0, 0, 4, Math.min(order, 3), 0);
  
  return points;
}

export function SpaceFillingCurves() {
  const { animationState, parameters, showTrails } = useGeometryStore();
  const iteration = Math.floor(parameters.iteration ?? 3);
  const curveType = Math.floor(parameters.curveType ?? 0);
  
  const [drawProgress, setDrawProgress] = useState(0);
  
  // Generate curve
  const curvePoints = useMemo(() => {
    return curveType === 0
      ? generateHilbertCurve(Math.min(iteration, 6))
      : generatePeanoCurve(Math.min(iteration, 3));
  }, [iteration, curveType]);
  
  // Animation
  useFrame(() => {
    if (animationState.isPlaying) {
      setDrawProgress((prev) => (prev + 0.01 * animationState.speed) % 1);
    }
  });
  
  // Points drawn so far
  const drawnPoints = useMemo(() => {
    const count = Math.floor(drawProgress * curvePoints.length);
    return curvePoints.slice(0, Math.max(1, count));
  }, [drawProgress, curvePoints]);
  
  // Current drawing point
  const currentPoint = useMemo(() => {
    return drawnPoints[drawnPoints.length - 1] || new THREE.Vector3(0, 0, 0);
  }, [drawnPoints]);
  
  const curveNames = ['Hilbert Curve', 'Peano Curve'];
  
  // Calculate curve properties
  const totalLength = useMemo(() => {
    let length = 0;
    for (let i = 1; i < curvePoints.length; i++) {
      length += curvePoints[i].distanceTo(curvePoints[i - 1]);
    }
    return length;
  }, [curvePoints]);
  
  return (
    <group>
      {/* Bounding square */}
      <Line
        points={[
          new THREE.Vector3(-2, -2, 0),
          new THREE.Vector3(2, -2, 0),
          new THREE.Vector3(2, 2, 0),
          new THREE.Vector3(-2, 2, 0),
          new THREE.Vector3(-2, -2, 0),
        ]}
        color="#64748b"
        lineWidth={2}
      />
      
      {/* Full curve (dimmed) */}
      {curvePoints.length > 1 && (
        <Line points={curvePoints} color="#334155" lineWidth={1} transparent opacity={0.3} />
      )}
      
      {/* Drawn portion */}
      {drawnPoints.length > 1 && (
        <Line points={drawnPoints} color="#f97316" lineWidth={2} />
      )}
      
      {/* Current drawing point */}
      <mesh position={currentPoint}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
      </mesh>
      
      {/* Trail effect */}
      {showTrails && drawnPoints.length > 10 && (
        <Line
          points={drawnPoints.slice(-20)}
          color="#22c55e"
          lineWidth={3}
          transparent
          opacity={0.5}
        />
      )}
      
      {/* Info */}
      <Float speed={2} floatIntensity={0.2}>
        <group position={[4, 2, 0]}>
          <Text fontSize={0.2} color="#ffffff">{curveNames[curveType]}</Text>
          <Text fontSize={0.12} color="#f97316" position={[0, -0.3, 0]}>
            Iteration: {iteration}
          </Text>
          <Text fontSize={0.1} color="#94a3b8" position={[0, -0.55, 0]}>
            Points: {curvePoints.length}
          </Text>
          <Text fontSize={0.1} color="#64748b" position={[0, -0.8, 0]}>
            Total length: {totalLength.toFixed(1)}
          </Text>
          <Text fontSize={0.1} color="#a855f7" position={[0, -1.05, 0]}>
            Fills the entire area!
          </Text>
        </group>
      </Float>
      
      {/* Explanation */}
      <Text position={[0, -3, 0]} fontSize={0.12} color="#64748b">
        Space-filling curves: continuous maps from [0,1] onto [0,1]²
      </Text>
      
      {/* Title */}
      <Text position={[0, 3.5, 0]} fontSize={0.3} color="#ffffff">
        Space-Filling Curves
      </Text>
    </group>
  );
}
