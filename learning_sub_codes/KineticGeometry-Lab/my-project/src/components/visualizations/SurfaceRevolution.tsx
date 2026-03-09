'use client';

import { useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';

// Helper function for Gaussian
function gaussian(t: number): number {
  return 0.3 + 0.7 * Math.exp(-Math.pow((t - 0.5) * 4, 2));
}

export function SurfaceRevolution() {
  const { animationState, parameters } = useGeometryStore();
  const profileType = Math.floor(parameters.profile ?? 0);
  const resolution = Math.floor(parameters.resolution ?? 32);
  
  const [revolutionAngle, setRevolutionAngle] = useState(0);
  
  // Animation
  useFrame(() => {
    if (animationState.isPlaying) {
      setRevolutionAngle((animationState.time * 0.5) % (Math.PI * 2));
    }
  });
  
  // Profile curve (2D)
  const profile = useMemo(() => {
    const points: THREE.Vector3[] = [];
    
    for (let i = 0; i <= 50; i++) {
      const t = i / 50;
      let x: number, y: number;
      
      switch (profileType) {
        case 0: // Parabola
          x = t * 2;
          y = t * t;
          break;
        case 1: // Sine wave
          x = t * 2;
          y = 0.5 + 0.5 * Math.sin(t * Math.PI * 3);
          break;
        case 2: // Gaussian bump
          x = t * 2;
          y = gaussian(t);
          break;
        default:
          x = t * 2;
          y = t;
      }
      
      points.push(new THREE.Vector3(x, y, 0));
    }
    return points;
  }, [profileType]);
  
  // Generate wireframe lines (circumferential)
  const circumferentialLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    
    for (let j = 0; j <= 10; j++) {
      const t = j / 10;
      let r: number, y: number;
      
      switch (profileType) {
        case 0:
          r = t * 2;
          y = t * t;
          break;
        case 1:
          r = t * 2;
          y = 0.5 + 0.5 * Math.sin(t * Math.PI * 3);
          break;
        case 2:
          r = t * 2;
          y = gaussian(t);
          break;
        default:
          r = t * 2;
          y = t;
      }
      
      const circle: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        circle.push(new THREE.Vector3(
          r * Math.cos(theta),
          y,
          r * Math.sin(theta)
        ));
      }
      lines.push(circle);
    }
    
    return lines;
  }, [profileType]);
  
  // Generate wireframe lines (meridional)
  const meridionalLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    
    for (let i = 0; i < resolution / 4; i++) {
      const theta = (i / (resolution / 4)) * Math.PI * 2;
      const line: THREE.Vector3[] = [];
      
      for (let j = 0; j <= 50; j++) {
        const t = j / 50;
        let r: number, y: number;
        
        switch (profileType) {
          case 0:
            r = t * 2;
            y = t * t;
            break;
          case 1:
            r = t * 2;
            y = 0.5 + 0.5 * Math.sin(t * Math.PI * 3);
            break;
          case 2:
            r = t * 2;
            y = gaussian(t);
            break;
          default:
            r = t * 2;
            y = t;
        }
        
        line.push(new THREE.Vector3(
          r * Math.cos(theta),
          y,
          r * Math.sin(theta)
        ));
      }
      lines.push(line);
    }
    
    return lines;
  }, [resolution, profileType]);
  
  // Profile curve (rotated with revolution)
  const rotatingProfile = useMemo(() => {
    return profile.map(p => new THREE.Vector3(
      p.x * Math.cos(revolutionAngle),
      p.y,
      p.x * Math.sin(revolutionAngle)
    ));
  }, [profile, revolutionAngle]);
  
  const profileNames = ['Paraboloid', 'Wave Surface', 'Gaussian Bump'];
  
  return (
    <group>
      {/* Circumferential lines */}
      {circumferentialLines.map((line, i) => (
        <Line key={`circ-${i}`} points={line} color="#f97316" lineWidth={1} transparent opacity={0.5} />
      ))}
      
      {/* Meridional lines */}
      {meridionalLines.map((line, i) => (
        <Line key={`merid-${i}`} points={line} color="#f97316" lineWidth={1} transparent opacity={0.5} />
      ))}
      
      {/* Rotating profile (highlighted) */}
      <Line points={rotatingProfile} color="#22c55e" lineWidth={3} />
      
      {/* Axis of revolution */}
      <Line
        points={[new THREE.Vector3(0, -0.5, 0), new THREE.Vector3(0, 2, 0)]}
        color="#64748b"
        lineWidth={1}
        dashed
      />
      
      {/* Rotation indicator */}
      <mesh position={[0, 1.5, 0]}>
        <torusGeometry args={[0.3, 0.02, 8, 32]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      
      {/* Info */}
      <Float speed={2} floatIntensity={0.2}>
        <group position={[3, 2, 0]}>
          <Text fontSize={0.15} color="#ffffff">Surface of Revolution</Text>
          <Text fontSize={0.12} color="#22c55e" position={[0, -0.3, 0]}>
            {profileNames[profileType]}
          </Text>
          <Text fontSize={0.1} color="#64748b" position={[0, -0.55, 0]}>
            Angle: {((revolutionAngle / Math.PI) * 180).toFixed(0)}°
          </Text>
        </group>
      </Float>
      
      {/* Title */}
      <Text position={[0, 3, 0]} fontSize={0.3} color="#ffffff">
        Surface of Revolution
      </Text>
    </group>
  );
}
