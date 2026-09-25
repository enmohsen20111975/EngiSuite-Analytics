'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Trail, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';
import { polar } from '@/lib/math/geometry';

interface PolarPointProps {
  theta: number;
  r: number;
  color: string;
  showTrails: boolean;
}

function PolarPoint({ theta, r, color, showTrails }: PolarPointProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailLineRef = useRef<THREE.Line>(null);
  const trailPointsRef = useRef<THREE.Vector3[]>([]);
  
  const position = useMemo(() => {
    const pos = polar.toCartesian(r, theta);
    return new THREE.Vector3(pos.x, pos.y, 0);
  }, [theta, r]);
  
  useFrame(() => {
    if (!showTrails) {
      trailPointsRef.current = [];
      return;
    }
    
    trailPointsRef.current.push(position.clone());
    if (trailPointsRef.current.length > 150) {
      trailPointsRef.current.shift();
    }
    
    if (trailLineRef.current && trailPointsRef.current.length > 1) {
      trailLineRef.current.geometry.dispose();
      trailLineRef.current.geometry = new THREE.BufferGeometry().setFromPoints(trailPointsRef.current);
    }
  });
  
  return (
    <group>
      <line ref={trailLineRef}>
        <bufferGeometry />
        <lineBasicMaterial color={color} transparent opacity={0.5} />
      </line>
      
      <Trail width={0.5} length={6} color={color} attenuation={(t) => t * t}>
        <mesh ref={meshRef} position={position}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </mesh>
      </Trail>
    </group>
  );
}

export function PolarDance() {
  const { animationState, parameters, showGrid } = useGeometryStore();
  const spiralRate = parameters.spiralRate ?? 0.5;
  const angularSpeed = parameters.angularSpeed ?? 1;
  
  const t = animationState.time;
  
  // Create multiple spiral points
  const points = useMemo(() => {
    const result: Array<{ theta: number; r: number; color: string }> = [];
    const numSpirals = 4;
    const colors = ['#f97316', '#22c55e', '#3b82f6', '#a855f7'];
    
    for (let i = 0; i < numSpirals; i++) {
      const phase = (i * Math.PI * 2) / numSpirals;
      const theta = t * angularSpeed + phase;
      const r = (spiralRate * t * 0.3 + 0.5) % 3 + 0.5;
      
      result.push({
        theta,
        r,
        color: colors[i % colors.length],
      });
    }
    
    return result;
  }, [t, spiralRate, angularSpeed]);
  
  // Generate circular grid
  const polarGrid = useMemo(() => {
    const circles: THREE.Vector3[][] = [];
    const rays: THREE.Vector3[][] = [];
    
    for (let r = 1; r <= 3; r++) {
      const circle: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        circle.push(new THREE.Vector3(r * Math.cos(theta), r * Math.sin(theta), 0));
      }
      circles.push(circle);
    }
    
    for (let i = 0; i < 12; i++) {
      const theta = (i / 12) * Math.PI * 2;
      rays.push([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(4 * Math.cos(theta), 4 * Math.sin(theta), 0),
      ]);
    }
    
    return { circles, rays };
  }, []);
  
  // Info panel position
  const infoPoint = points[0];
  const infoPos = polar.toCartesian(infoPoint.r, infoPoint.theta);
  
  return (
    <group rotation={[-Math.PI / 6, 0, 0]}>
      {/* Polar grid */}
      {showGrid && (
        <group>
          {polarGrid.circles.map((circle, i) => (
            <Line
              key={`circle-${i}`}
              points={circle}
              color="#334155"
              lineWidth={1}
              transparent
              opacity={0.3}
            />
          ))}
          {polarGrid.rays.map((ray, i) => (
            <Line
              key={`ray-${i}`}
              points={ray}
              color="#334155"
              lineWidth={1}
              transparent
              opacity={0.2}
            />
          ))}
        </group>
      )}
      
      {/* Center point */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Moving points */}
      {points.map((point, i) => (
        <PolarPoint
          key={i}
          theta={point.theta}
          r={point.r}
          color={point.color}
          showTrails={true}
        />
      ))}
      
      {/* Coordinate conversion display */}
      <group position={[3, 2.5, 0]}>
        <Text fontSize={0.15} color="#ffffff" anchorX="left">
          {`Polar: (r=${infoPoint.r.toFixed(2)}, θ=${(infoPoint.theta * 180 / Math.PI % 360).toFixed(1)}°)`}
        </Text>
        <Text position={[0, -0.25, 0]} fontSize={0.15} color="#f97316" anchorX="left">
          {`Cartesian: (x=${infoPos.x.toFixed(2)}, y=${infoPos.y.toFixed(2)})`}
        </Text>
      </group>
      
      {/* Axis labels */}
      <Text position={[3.5, 0, 0]} fontSize={0.2} color="#ef4444">r</Text>
      <Text position={[0, 3.5, 0]} fontSize={0.2} color="#22c55e">θ</Text>
    </group>
  );
}
