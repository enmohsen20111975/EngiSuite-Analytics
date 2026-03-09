'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Trail, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';
import { curves, physics } from '@/lib/math/geometry';

// Helper functions
function getPointOnCurve(points: THREE.Vector3[], t: number): THREE.Vector3 {
  if (points.length === 0) return new THREE.Vector3();
  const index = Math.min(Math.floor(t * (points.length - 1)), points.length - 2);
  const localT = (t * (points.length - 1)) - index;
  return new THREE.Vector3().lerpVectors(points[index], points[index + 1], localT);
}

function estimateCurveLength(points: THREE.Vector3[]): number {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += points[i].distanceTo(points[i - 1]);
  }
  return length;
}

// Particle with managed trail geometry
function RaceParticle({ 
  curvePoints, 
  color, 
  speed,
  isRaceActive
}: { 
  curvePoints: THREE.Vector3[];
  color: string;
  speed: number;
  isRaceActive: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(0);
  const trailLineRef = useRef<THREE.Line>(null);
  const trailPointsRef = useRef<THREE.Vector3[]>([]);
  
  const startPos = useMemo(() => getPointOnCurve(curvePoints, 0), [curvePoints]);
  
  useFrame((_, delta) => {
    // Reset when race is not active
    if (!isRaceActive) {
      progressRef.current = 0;
      trailPointsRef.current = [];
      if (trailLineRef.current) {
        trailLineRef.current.geometry.dispose();
        trailLineRef.current.geometry = new THREE.BufferGeometry();
      }
      if (meshRef.current) {
        meshRef.current.position.copy(startPos);
      }
      return;
    }
    
    if (progressRef.current >= 1) return;
    
    const currentPoint = getPointOnCurve(curvePoints, progressRef.current);
    const velocity = physics.velocityFromEnergy(0, currentPoint.y, 9.81);
    
    const curveLength = estimateCurveLength(curvePoints);
    const progressStep = (velocity * delta * speed * 0.3) / curveLength;
    
    progressRef.current = Math.min(1, progressRef.current + progressStep);
    
    const newPosition = getPointOnCurve(curvePoints, progressRef.current);
    if (meshRef.current) {
      meshRef.current.position.copy(newPosition);
      
      trailPointsRef.current.push(newPosition.clone());
      if (trailPointsRef.current.length > 100) {
        trailPointsRef.current.shift();
      }
      
      if (trailLineRef.current && trailPointsRef.current.length > 1) {
        trailLineRef.current.geometry.dispose();
        trailLineRef.current.geometry = new THREE.BufferGeometry().setFromPoints(trailPointsRef.current);
      }
    }
  });
  
  return (
    <group>
      <line ref={trailLineRef}>
        <bufferGeometry />
        <lineBasicMaterial color={color} transparent opacity={0.6} />
      </line>
      
      <Trail width={1} length={8} color={color} attenuation={(t) => t * t}>
        <mesh ref={meshRef} position={startPos.toArray()}>
          <sphereGeometry args={[0.12, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
          />
        </mesh>
      </Trail>
    </group>
  );
}

export function CycloidRace() {
  const { animationState, parameters } = useGeometryStore();
  const radius = parameters.radius ?? 1;
  
  // Generate curve points
  const curvesData = useMemo(() => {
    const startY = 0;
    const endY = -3;
    const startX = 0;
    const endX = 4;
    
    const straight: THREE.Vector3[] = [];
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      straight.push(new THREE.Vector3(
        startX + t * (endX - startX),
        startY + t * (endY - startY),
        0
      ));
    }
    
    const circular: THREE.Vector3[] = [];
    const arcRadius = 2.5;
    const arcCenter = { x: startX, y: startY - arcRadius };
    const startAngle = Math.PI / 2;
    const endAngle = -Math.PI / 6;
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const angle = startAngle + t * (endAngle - startAngle);
      circular.push(new THREE.Vector3(
        arcCenter.x + arcRadius * Math.cos(angle),
        arcCenter.y + arcRadius * Math.sin(angle),
        0
      ));
    }
    
    const cycloid: THREE.Vector3[] = [];
    const cycloidRadius = radius;
    const thetaMax = Math.PI;
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const theta = t * thetaMax;
      const point = curves.cycloid(theta, cycloidRadius);
      cycloid.push(new THREE.Vector3(
        point.x * 1.5,
        -point.y,
        0
      ));
    }
    
    return { straight, circular, cycloid, endX };
  }, [radius]);
  
  // Race status - derived directly from animation state
  const isRaceActive = animationState.isPlaying && animationState.time > 0;
  
  return (
    <group rotation={[-Math.PI / 8, 0, 0]}>
      {/* Title */}
      <Text position={[2, 1.5, 1]} fontSize={0.25} color="#ffffff">
        The Brachistochrone Race
      </Text>
      
      {/* Curves */}
      <Line points={curvesData.straight} color="#ef4444" lineWidth={2} />
      <Line points={curvesData.circular} color="#3b82f6" lineWidth={2} />
      <Line points={curvesData.cycloid} color="#22c55e" lineWidth={3} />
      
      {/* Labels */}
      <Text position={[-0.5, 0, 0]} fontSize={0.15} color="#ef4444">Straight</Text>
      <Text position={[-0.5, -1, 0]} fontSize={0.15} color="#3b82f6">Circular</Text>
      <Text position={[-0.5, -2, 0]} fontSize={0.15} color="#22c55e">Cycloid</Text>
      
      {/* Info text */}
      <Text position={[5, 0.5, 0]} fontSize={0.12} color="#94a3b8">
        Click Play to start the race!
      </Text>
      
      {/* Start/End markers */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[curvesData.endX, -3, 0]}>
        <boxGeometry args={[0.3, 0.1, 0.3]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      
      {/* Racing particles */}
      <RaceParticle
        curvePoints={curvesData.straight}
        color="#ef4444"
        speed={animationState.speed}
        isRaceActive={isRaceActive}
      />
      <RaceParticle
        curvePoints={curvesData.circular}
        color="#3b82f6"
        speed={animationState.speed}
        isRaceActive={isRaceActive}
      />
      <RaceParticle
        curvePoints={curvesData.cycloid}
        color="#22c55e"
        speed={animationState.speed}
        isRaceActive={isRaceActive}
      />
    </group>
  );
}
