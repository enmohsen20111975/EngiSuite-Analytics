'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';

export function InertiaEllipsoid() {
  const { animationState, parameters, showVectors } = useGeometryStore();
  const mass = parameters.mass ?? 1;
  const omega = parameters.omega ?? 1;
  
  // Inertia tensor (for a rectangular box)
  // Simplified: Ixx, Iyy, Izz
  const inertiaTensor = useMemo(() => ({
    Ixx: mass * (1**2 + 0.5**2) / 12,
    Iyy: mass * (2**2 + 0.5**2) / 12,
    Izz: mass * (2**2 + 1**2) / 12,
  }), [mass]);
  
  // Animation time
  const time = animationState.isPlaying ? animationState.time : 0;
  
  // Angular velocity vector
  const angularVelocity = useMemo(() => ({
    x: Math.sin(time * omega) * omega,
    y: Math.cos(time * omega * 0.7) * omega * 0.5,
    z: Math.sin(time * omega * 0.5) * omega * 0.3,
  }), [time, omega]);
  
  // Angular momentum L = I * ω
  const angularMomentum = useMemo(() => ({
    x: inertiaTensor.Ixx * angularVelocity.x,
    y: inertiaTensor.Iyy * angularVelocity.y,
    z: inertiaTensor.Izz * angularVelocity.z,
  }), [inertiaTensor, angularVelocity]);
  
  // Generate inertia ellipsoid
  const ellipsoidLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    const { Ixx, Iyy, Izz } = inertiaTensor;
    const scale = 1.5;
    
    // Longitude lines
    for (let i = 0; i < 16; i++) {
      const phi = (i / 16) * Math.PI * 2;
      const line: THREE.Vector3[] = [];
      for (let j = 0; j <= 32; j++) {
        const theta = (j / 32) * Math.PI;
        line.push(new THREE.Vector3(
          scale * Math.sin(theta) * Math.cos(phi) / Math.sqrt(Ixx),
          scale * Math.sin(theta) * Math.sin(phi) / Math.sqrt(Iyy),
          scale * Math.cos(theta) / Math.sqrt(Izz)
        ));
      }
      lines.push(line);
    }
    
    // Latitude lines
    for (let j = 1; j < 8; j++) {
      const theta = (j / 8) * Math.PI;
      const line: THREE.Vector3[] = [];
      for (let i = 0; i <= 32; i++) {
        const phi = (i / 32) * Math.PI * 2;
        line.push(new THREE.Vector3(
          scale * Math.sin(theta) * Math.cos(phi) / Math.sqrt(Ixx),
          scale * Math.sin(theta) * Math.sin(phi) / Math.sqrt(Iyy),
          scale * Math.cos(theta) / Math.sqrt(Izz)
        ));
      }
      lines.push(line);
    }
    
    return lines;
  }, [inertiaTensor]);
  
  // Rotating body (simple box)
  const bodyRotation = useMemo(() => {
    return new THREE.Euler(
      time * omega * 0.3,
      time * omega * 0.5,
      time * omega * 0.2
    );
  }, [time, omega]);
  
  // Principal axes
  const principalAxes = useMemo(() => [
    { dir: new THREE.Vector3(1, 0, 0), color: '#ef4444', label: 'Ixx' },
    { dir: new THREE.Vector3(0, 1, 0), color: '#22c55e', label: 'Iyy' },
    { dir: new THREE.Vector3(0, 0, 1), color: '#3b82f6', label: 'Izz' },
  ], []);
  
  return (
    <group>
      {/* Inertia ellipsoid */}
      {ellipsoidLines.map((line, i) => (
        <Line key={i} points={line} color="#f97316" lineWidth={1} transparent opacity={0.5} />
      ))}
      
      {/* Rotating body */}
      <group rotation={bodyRotation}>
        <mesh>
          <boxGeometry args={[2, 1, 0.5]} />
          <meshStandardMaterial color="#334155" transparent opacity={0.3} />
        </mesh>
        <line>
          <boxGeometry args={[2, 1, 0.5]} />
          <lineBasicMaterial color="#64748b" />
        </line>
      </group>
      
      {/* Principal axes */}
      {principalAxes.map((axis, i) => (
        <arrowHelper
          key={i}
          args={[
            axis.dir.clone().normalize(),
            new THREE.Vector3(0, 0, 0),
            2,
            parseInt(axis.color.replace('#', ''), 16),
            0.15,
            0.08
          ]}
        />
      ))}
      
      {/* Angular velocity vector */}
      {showVectors && (
        <arrowHelper
          args={[
            new THREE.Vector3(angularVelocity.x, angularVelocity.y, angularVelocity.z).normalize(),
            new THREE.Vector3(0, 0, 0),
            Math.sqrt(angularVelocity.x**2 + angularVelocity.y**2 + angularVelocity.z**2) * 0.5,
            0xfbbf24,
            0.15,
            0.08
          ]}
        />
      )}
      
      {/* Angular momentum vector */}
      {showVectors && (
        <arrowHelper
          args={[
            new THREE.Vector3(angularMomentum.x, angularMomentum.y, angularMomentum.z).normalize(),
            new THREE.Vector3(0, 0, 0),
            Math.sqrt(angularMomentum.x**2 + angularMomentum.y**2 + angularMomentum.z**2) * 2,
            0xa855f7,
            0.15,
            0.08
          ]}
        />
      )}
      
      {/* Axis labels */}
      <Text position={[2.3, 0, 0]} fontSize={0.12} color="#ef4444">Ixx</Text>
      <Text position={[0, 2.3, 0]} fontSize={0.12} color="#22c55e">Iyy</Text>
      <Text position={[0, 0, 2.3]} fontSize={0.12} color="#3b82f6">Izz</Text>
      
      {/* Info */}
      <Float speed={2} floatIntensity={0.2}>
        <group position={[4, 2, 0]}>
          <Text fontSize={0.15} color="#ffffff">Inertia Ellipsoid</Text>
          <Text fontSize={0.12} color="#fbbf24" position={[0, -0.3, 0]}>
            ω = {omega.toFixed(1)} rad/s
          </Text>
          <Text fontSize={0.1} color="#a855f7" position={[0, -0.55, 0]}>
            L = I·ω
          </Text>
          <Text fontSize={0.1} color="#64748b" position={[0, -0.8, 0]}>
            Mass: {mass.toFixed(1)} kg
          </Text>
        </group>
      </Float>
      
      {/* Title */}
      <Text position={[0, 3.5, 0]} fontSize={0.3} color="#ffffff">
        Moment of Inertia Ellipsoid
      </Text>
    </group>
  );
}
