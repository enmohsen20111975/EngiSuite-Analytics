'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';
import { spherical } from '@/lib/math/geometry';

export function GreatCircleNav() {
  const { animationState, parameters } = useGeometryStore();
  const lat1 = parameters.lat1 ?? 40.7;
  const lon1 = parameters.lon1 ?? -74;
  const lat2 = parameters.lat2 ?? 51.5;
  const lon2 = parameters.lon2 ?? -0.1;
  
  const [flightProgress, setFlightProgress] = useState(0);
  
  useFrame(() => {
    if (animationState.isPlaying) {
      setFlightProgress((animationState.time * 0.1) % 1);
    }
  });
  
  // Convert to radians
  const phi1 = (90 - lat1) * Math.PI / 180;
  const theta1 = lon1 * Math.PI / 180;
  const phi2 = (90 - lat2) * Math.PI / 180;
  const theta2 = lon2 * Math.PI / 180;
  
  // City positions on sphere
  const city1 = useMemo(() => spherical.toCartesian(2, theta1, phi1), [theta1, phi1]);
  const city2 = useMemo(() => spherical.toCartesian(2, theta2, phi2), [theta2, phi2]);
  
  // Generate great circle path
  const greatCircle = useMemo(() => {
    const points: THREE.Vector3[] = [];
    
    // Calculate great circle intermediate points
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      
      // Spherical linear interpolation (slerp)
      const omega = Math.acos(
        Math.max(-1, Math.min(1,
          city1.x / 2 * city2.x / 2 + 
          city1.y / 2 * city2.y / 2 + 
          city1.z / 2 * city2.z / 2
        ))
      );
      
      if (omega < 0.001) {
        points.push(new THREE.Vector3().lerpVectors(
          new THREE.Vector3(city1.x, city1.y, city1.z),
          new THREE.Vector3(city2.x, city2.y, city2.z),
          t
        ));
      } else {
        const sinOmega = Math.sin(omega);
        const a = Math.sin((1 - t) * omega) / sinOmega;
        const b = Math.sin(t * omega) / sinOmega;
        
        points.push(new THREE.Vector3(
          (a * city1.x + b * city2.x),
          (a * city1.y + b * city2.y),
          (a * city1.z + b * city2.z)
        ));
      }
    }
    
    return points;
  }, [city1, city2]);
  
  // Current plane position
  const planePos = useMemo(() => {
    const idx = Math.floor(flightProgress * (greatCircle.length - 1));
    return greatCircle[Math.min(idx, greatCircle.length - 1)] || greatCircle[0];
  }, [flightProgress, greatCircle]);
  
  // Sphere wireframe
  const sphereLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    
    // Latitude lines
    for (let lat = -80; lat <= 80; lat += 20) {
      const phi = (90 - lat) * Math.PI / 180;
      const line: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        const p = spherical.toCartesian(2, theta, phi);
        line.push(new THREE.Vector3(p.x, p.y, p.z));
      }
      lines.push(line);
    }
    
    // Longitude lines
    for (let lon = 0; lon < 360; lon += 30) {
      const theta = lon * Math.PI / 180;
      const line: THREE.Vector3[] = [];
      for (let i = 0; i <= 32; i++) {
        const phi = (i / 32) * Math.PI;
        const p = spherical.toCartesian(2, theta, phi);
        line.push(new THREE.Vector3(p.x, p.y, p.z));
      }
      lines.push(line);
    }
    
    return lines;
  }, []);
  
  // Calculate distance
  const distance = useMemo(() => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + 
              Math.cos(lat1 * Math.PI / 180) * 
              Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, [lat1, lon1, lat2, lon2]);
  
  return (
    <group>
      {/* Earth sphere wireframe */}
      {sphereLines.map((line, i) => (
        <Line key={i} points={line} color="#334155" lineWidth={1} transparent opacity={0.4} />
      ))}
      
      {/* Great circle path */}
      <Line points={greatCircle} color="#22c55e" lineWidth={3} />
      
      {/* City markers */}
      <mesh position={[city1.x, city1.y, city1.z]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[city2.x, city2.y, city2.z]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
      </mesh>
      
      {/* City labels */}
      <Text position={[city1.x * 1.15, city1.y * 1.15, city1.z * 1.15]} fontSize={0.12} color="#ef4444">
        NYC
      </Text>
      <Text position={[city2.x * 1.15, city2.y * 1.15, city2.z * 1.15]} fontSize={0.12} color="#3b82f6">
        London
      </Text>
      
      {/* Plane */}
      <group position={[planePos.x, planePos.y, planePos.z]}>
        <mesh>
          <coneGeometry args={[0.05, 0.15, 8]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f97316" emissiveIntensity={0.8} />
        </mesh>
      </group>
      
      {/* Info */}
      <Float speed={2} floatIntensity={0.2}>
        <group position={[4, 2, 0]}>
          <Text fontSize={0.15} color="#ffffff">Great Circle Navigation</Text>
          <Text fontSize={0.12} color="#ef4444" position={[0, -0.3, 0]}>
            NYC: {lat1.toFixed(1)}°, {lon1.toFixed(1)}°
          </Text>
          <Text fontSize={0.12} color="#3b82f6" position={[0, -0.5, 0]}>
            London: {lat2.toFixed(1)}°, {lon2.toFixed(1)}°
          </Text>
          <Text fontSize={0.1} color="#22c55e" position={[0, -0.75, 0]}>
            Distance: {distance.toFixed(0)} km
          </Text>
        </group>
      </Float>
      
      {/* Title */}
      <Text position={[0, 3.5, 0]} fontSize={0.3} color="#ffffff">
        Great Circle Navigation
      </Text>
    </group>
  );
}
