'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Torus } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';
import { utils } from '@/lib/math/geometry';

// Gimbal ring component
function GimbalRing({ 
  radius, 
  rotation, 
  color, 
  label 
}: { 
  radius: number; 
  rotation: [number, number, number];
  color: string;
  label: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  return (
    <group ref={groupRef} rotation={rotation}>
      <Torus args={[radius, 0.03, 16, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </Torus>
      <Text position={[radius + 0.2, 0, 0]} fontSize={0.12} color={color}>
        {label}
      </Text>
    </group>
  );
}

// Orientation indicator (aircraft-like shape)
function OrientationIndicator({ roll, pitch, yaw }: { roll: number; pitch: number; yaw: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  return (
    <group ref={groupRef} rotation={[pitch, yaw, roll]}>
      {/* Fuselage */}
      <mesh>
        <coneGeometry args={[0.15, 0.6, 8]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Wings */}
      <mesh position={[0, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.08, 0.8, 4]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
      
      {/* Tail */}
      <mesh position={[0, -0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.08, 0.3, 4]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
    </group>
  );
}

export function GimbalVisualization() {
  const { parameters, animationState } = useGeometryStore();
  
  // Get Euler angles from parameters (in degrees, convert to radians)
  const roll = utils.degToRad(parameters.roll ?? 0);
  const pitch = utils.degToRad(parameters.pitch ?? 0);
  const yaw = utils.degToRad(parameters.yaw ?? 0);
  
  // Check for gimbal lock
  const isGimbalLock = Math.abs(Math.abs(pitch) - Math.PI / 2) < 0.1;
  
  // Animate when playing
  const animatedRoll = animationState.isPlaying ? 
    roll + animationState.time * 0.5 : roll;
  const animatedPitch = animationState.isPlaying ?
    pitch + Math.sin(animationState.time * 0.3) * 0.5 : pitch;
  const animatedYaw = animationState.isPlaying ?
    yaw + animationState.time * 0.2 : yaw;
  
  return (
    <group>
      {/* Outer ring - Yaw (blue) */}
      <group rotation={[0, animatedYaw, 0]}>
        <GimbalRing radius={1.5} rotation={[0, 0, 0]} color="#3b82f6" label="Yaw" />
        
        {/* Middle ring - Pitch (green) */}
        <group rotation={[animatedPitch, 0, 0]}>
          <GimbalRing radius={1.2} rotation={[0, 0, 0]} color="#22c55e" label="Pitch" />
          
          {/* Inner ring - Roll (red) */}
          <group rotation={[0, 0, animatedRoll]}>
            <GimbalRing radius={0.9} rotation={[0, 0, 0]} color="#ef4444" label="Roll" />
            
            {/* Orientation indicator */}
            <OrientationIndicator roll={0} pitch={0} yaw={0} />
          </group>
        </group>
      </group>
      
      {/* Reference axes */}
      <group>
        <Line
          points={[new THREE.Vector3(-2, 0, 0), new THREE.Vector3(2, 0, 0)]}
          color="#ef4444"
          lineWidth={1}
          transparent
          opacity={0.3}
        />
        <Line
          points={[new THREE.Vector3(0, -2, 0), new THREE.Vector3(0, 2, 0)]}
          color="#22c55e"
          lineWidth={1}
          transparent
          opacity={0.3}
        />
        <Line
          points={[new THREE.Vector3(0, 0, -2), new THREE.Vector3(0, 0, 2)]}
          color="#3b82f6"
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      </group>
      
      {/* Title */}
      <Text position={[0, 2.5, 0]} fontSize={0.25} color="#ffffff">
        Euler Angles Gimbal
      </Text>
      
      {/* Angle display */}
      <group position={[-2.5, 1.5, 0]}>
        <Text fontSize={0.12} color="#ef4444">
          {`Roll: ${utils.radToDeg(animatedRoll).toFixed(0)}°`}
        </Text>
        <Text fontSize={0.12} color="#22c55e" position={[0, -0.25, 0]}>
          {`Pitch: ${utils.radToDeg(animatedPitch).toFixed(0)}°`}
        </Text>
        <Text fontSize={0.12} color="#3b82f6" position={[0, -0.5, 0]}>
          {`Yaw: ${utils.radToDeg(animatedYaw).toFixed(0)}°`}
        </Text>
      </group>
      
      {/* Gimbal lock warning */}
      {isGimbalLock && (
        <group position={[0, -2, 0]}>
          <Text fontSize={0.15} color="#ef4444">
            ⚠️ GIMBAL LOCK DETECTED
          </Text>
          <Text fontSize={0.1} color="#f87171" position={[0, -0.3, 0]}>
            Loss of one degree of freedom!
          </Text>
        </group>
      )}
      
      {/* Info text */}
      <Text position={[0, -2.5, 0]} fontSize={0.1} color="#64748b">
        Adjust pitch to ±90° to see gimbal lock
      </Text>
    </group>
  );
}
