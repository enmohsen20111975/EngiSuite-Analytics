'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';

export function WindingNumber() {
  const { animationState, parameters, showTrails } = useGeometryStore();
  const pointX = parameters.pointX ?? 0;
  const pointY = parameters.pointY ?? 0;
  
  const [windingNumber, setWindingNumber] = useState(0);
  const [trailPoints, setTrailPoints] = useState<THREE.Vector3[]>([]);
  
  // The curve (a closed loop)
  const curvePoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    // Figure-8 curve
    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.sin(t) * 1.5,
        Math.sin(t * 2) * 0.8,
        0
      ));
    }
    return points;
  }, []);
  
  // Current point on curve
  const t = animationState.time * 0.5;
  const currentIdx = Math.floor(t * 100) % 200;
  
  // Calculate winding number
  useFrame(() => {
    if (!animationState.isPlaying) return;
    
    // Point to test
    const px = pointX;
    const py = pointY;
    
    // Calculate angle change
    let angle = 0;
    const n = curvePoints.length;
    
    for (let i = 0; i < n - 1; i++) {
      const p1 = curvePoints[i];
      const p2 = curvePoints[(i + 1) % n];
      
      const a1 = Math.atan2(p1.y - py, p1.x - px);
      const a2 = Math.atan2(p2.y - py, p2.x - px);
      
      let diff = a2 - a1;
      if (diff > Math.PI) diff -= 2 * Math.PI;
      if (diff < -Math.PI) diff += 2 * Math.PI;
      
      angle += diff;
    }
    
    setWindingNumber(Math.round(angle / (2 * Math.PI)));
    
    // Update trail
    const currentPoint = curvePoints[currentIdx];
    const ray = new THREE.Vector3(
      currentPoint.x - px,
      currentPoint.y - py,
      0
    ).normalize();
    
    setTrailPoints(prev => {
      const newPoints = [...prev, new THREE.Vector3(px + ray.x * 3, py + ray.y * 3, 0)];
      if (newPoints.length > 50) newPoints.shift();
      return newPoints;
    });
  });
  
  return (
    <group>
      {/* The curve */}
      <Line points={curvePoints} color="#f97316" lineWidth={3} />
      
      {/* Test point */}
      <mesh position={[pointX, pointY, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.8} />
      </mesh>
      
      {/* Current point on curve */}
      <mesh position={[curvePoints[currentIdx]?.x || 0, curvePoints[currentIdx]?.y || 0, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
      
      {/* Ray from test point to current curve point */}
      <Line
        points={[
          new THREE.Vector3(pointX, pointY, 0),
          curvePoints[currentIdx] || new THREE.Vector3(0, 0, 0),
        ]}
        color="#94a3b8"
        lineWidth={1}
        dashed
      />
      
      {/* Trail rays */}
      {trailPoints.length > 1 && (
        <Line points={trailPoints} color="#22c55e" lineWidth={1} transparent opacity={0.3} />
      )}
      
      {/* Info */}
      <Float speed={2} floatIntensity={0.2}>
        <group position={[4, 2, 0]}>
          <Text fontSize={0.15} color="#ffffff">Winding Number</Text>
          <Text fontSize={0.25} color="#a855f7" position={[0, -0.4, 0]}>
            W = {windingNumber}
          </Text>
          <Text fontSize={0.1} color="#64748b" position={[0, -0.7, 0]}>
            Test point: ({pointX.toFixed(1)}, {pointY.toFixed(1)})
          </Text>
          <Text fontSize={0.1} color="#94a3b8" position={[0, -0.95, 0]}>
            Count of curve encirclements
          </Text>
        </group>
      </Float>
      
      {/* Legend */}
      <Text position={[-3, -2.5, 0]} fontSize={0.12} color="#64748b">
        Move the test point to see winding number change
      </Text>
      
      {/* Title */}
      <Text position={[0, 3.5, 0]} fontSize={0.3} color="#ffffff">
        Winding Number
      </Text>
    </group>
  );
}
