'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Trail, Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';

// Axes component
function Axes({ size = 5 }: { size?: number }) {
  return (
    <group>
      <Line
        points={[[-size, 0, 0], [size, 0, 0]]}
        color="#ef4444"
        lineWidth={2}
      />
      <Text position={[size + 0.3, 0, 0]} fontSize={0.3} color="#ef4444">X</Text>
      
      <Line
        points={[[0, -size, 0], [0, size, 0]]}
        color="#22c55e"
        lineWidth={2}
      />
      <Text position={[0, size + 0.3, 0]} fontSize={0.3} color="#22c55e">Y</Text>
      
      <Line
        points={[[0, 0, -size], [0, 0, size]]}
        color="#3b82f6"
        lineWidth={2}
      />
      <Text position={[0, 0, size + 0.3]} fontSize={0.3} color="#3b82f6">Z</Text>
    </group>
  );
}

export function CartesianTheater3D() {
  const { animationState, parameters, showTrails, showVectors } = useGeometryStore();
  const pointRef = useRef<THREE.Mesh>(null);
  const trailLineRef = useRef<THREE.Line>(null);
  const trailPointsRef = useRef<THREE.Vector3[]>([]);
  const lastTimeRef = useRef(0);
  const maxTrailLength = 200;
  
  const radius = parameters.radius ?? 1;
  const speed = parameters.speed ?? 1;
  
  // Calculate position based on parametric equations
  const { position, velocity } = useMemo(() => {
    const t = animationState.time * speed;
    return {
      position: new THREE.Vector3(
        Math.cos(t) * radius,
        Math.sin(t * 0.5) * radius * 0.5,
        Math.sin(t) * radius
      ),
      velocity: new THREE.Vector3(
        -Math.sin(t) * radius * speed,
        Math.cos(t * 0.5) * radius * 0.25 * speed,
        Math.cos(t) * radius * speed
      ),
    };
  }, [animationState.time, radius, speed]);
  
  // Update trail and mesh position in frame
  useFrame(() => {
    if (pointRef.current && animationState.isPlaying) {
      pointRef.current.position.copy(position);
      
      // Check for time reset
      if (animationState.time < lastTimeRef.current) {
        trailPointsRef.current = [];
        if (trailLineRef.current) {
          trailLineRef.current.geometry.dispose();
          trailLineRef.current.geometry = new THREE.BufferGeometry();
        }
      }
      lastTimeRef.current = animationState.time;
      
      if (showTrails) {
        trailPointsRef.current.push(position.clone());
        if (trailPointsRef.current.length > maxTrailLength) {
          trailPointsRef.current.shift();
        }
        
        if (trailLineRef.current && trailPointsRef.current.length > 1) {
          trailLineRef.current.geometry.dispose();
          trailLineRef.current.geometry = new THREE.BufferGeometry().setFromPoints(trailPointsRef.current);
        }
      }
    }
  });
  
  return (
    <group>
      <Axes size={4} />
      
      {/* Trail line - always rendered but may be empty */}
      <line ref={trailLineRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#f97316" transparent opacity={0.6} linewidth={2} />
      </line>
      
      <Trail
        width={1}
        length={8}
        color="#f97316"
        attenuation={(t) => t * t}
      >
        <mesh ref={pointRef} position={position.toArray()}>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshStandardMaterial
            color="#f97316"
            emissive="#f97316"
            emissiveIntensity={0.5}
          />
        </mesh>
      </Trail>
      
      {/* Velocity vector */}
      {showVectors && (
        <group position={position.toArray()}>
          <arrowHelper
            args={[
              velocity.clone().normalize(),
              new THREE.Vector3(0, 0, 0),
              velocity.length() * 0.3,
              0x22c55e,
              0.1,
              0.05,
            ]}
          />
        </group>
      )}
      
      {/* Coordinate display */}
      <Float speed={2} floatIntensity={0.2}>
        <Text
          position={[3.5, 3, 0]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="left"
        >
          {`Position: (${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`}
        </Text>
      </Float>
      
      {/* Projection lines */}
      <Line
        points={[[position.x, 0, position.z], position.toArray()]}
        color="#f97316"
        lineWidth={1}
        transparent
        opacity={0.3}
        dashed
      />
      <Line
        points={[[0, position.y, 0], position.toArray()]}
        color="#22c55e"
        lineWidth={1}
        transparent
        opacity={0.3}
        dashed
      />
    </group>
  );
}
