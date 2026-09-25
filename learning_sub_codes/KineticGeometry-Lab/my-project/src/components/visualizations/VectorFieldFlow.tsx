'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';

// Single particle in the vector field
function FieldParticle({ id, fieldStrength }: { id: number; fieldStrength: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lineRef = useRef<THREE.Line>(null);
  const trailRef = useRef<THREE.Vector3[]>([]);
  
  // Random starting position
  const startPos = useMemo(() => {
    const angle = (id / 20) * Math.PI * 2;
    const radius = 1 + Math.random() * 2;
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 2,
      Math.sin(angle) * radius
    );
  }, [id]);
  
  const posRef = useRef(startPos.clone());
  
  useFrame(() => {
    if (!meshRef.current) return;
    
    const pos = posRef.current;
    
    // Vector field: rotational field with some sink behavior
    const field = new THREE.Vector3(
      -pos.z * fieldStrength * 0.3,
      -pos.y * fieldStrength * 0.1,
      pos.x * fieldStrength * 0.3
    );
    
    // Update position
    pos.add(field.multiplyScalar(0.01));
    
    // Reset if out of bounds
    if (pos.length() > 5) {
      pos.copy(startPos);
      trailRef.current = [];
    }
    
    meshRef.current.position.copy(pos);
    
    // Update trail
    trailRef.current.push(pos.clone());
    if (trailRef.current.length > 50) {
      trailRef.current.shift();
    }
    
    if (lineRef.current && trailRef.current.length > 1) {
      lineRef.current.geometry.dispose();
      lineRef.current.geometry = new THREE.BufferGeometry().setFromPoints(trailRef.current);
    }
  });
  
  return (
    <group>
      <line ref={lineRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#3b82f6" transparent opacity={0.5} />
      </line>
      <mesh ref={meshRef} position={startPos.toArray()}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

// Vector arrow display
function VectorArrow({ position, direction, color }: { position: [number, number, number]; direction: [number, number, number]; color: string }) {
  const dir = new THREE.Vector3(...direction).normalize();
  const length = new THREE.Vector3(...direction).length() * 0.3;
  
  return (
    <group position={position}>
      <arrowHelper args={[dir, new THREE.Vector3(0, 0, 0), length, parseInt(color.replace('#', ''), 16), 0.1, 0.05]} />
    </group>
  );
}

export function VectorFieldFlow() {
  const { parameters } = useGeometryStore();
  const fieldStrength = parameters.fieldStrength ?? 1;
  const particleCount = Math.floor((parameters.particleCount ?? 50) / 5);
  
  // Generate vector field arrows
  const fieldArrows = useMemo(() => {
    const arrows: Array<{ pos: [number, number, number]; dir: [number, number, number]; color: string }> = [];
    
    for (let x = -2; x <= 2; x += 1) {
      for (let z = -2; z <= 2; z += 1) {
        const dir: [number, number, number] = [
          -z * fieldStrength * 0.3,
          0,
          x * fieldStrength * 0.3
        ];
        arrows.push({
          pos: [x, 0, z],
          dir,
          color: '#f97316'
        });
      }
    }
    
    return arrows;
  }, [fieldStrength]);
  
  return (
    <group>
      {/* Grid plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#1e293b" transparent opacity={0.5} />
      </mesh>
      
      {/* Vector field arrows */}
      {fieldArrows.map((arrow, i) => (
        <VectorArrow key={i} position={arrow.pos} direction={arrow.dir} color={arrow.color} />
      ))}
      
      {/* Particles */}
      {Array.from({ length: particleCount }).map((_, i) => (
        <FieldParticle key={i} id={i} fieldStrength={fieldStrength} />
      ))}
      
      {/* Title */}
      <Text position={[0, 3, 0]} fontSize={0.3} color="#ffffff">
        Vector Field Flow
      </Text>
      
      {/* Info */}
      <Float speed={2} floatIntensity={0.2}>
        <Text position={[3, 2, 0]} fontSize={0.12} color="#94a3b8">
          F(x,z) = (-z, 0, x)
        </Text>
      </Float>
    </group>
  );
}
