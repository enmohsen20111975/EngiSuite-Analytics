'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';
import { surfaces, spherical, gaussianCurvature } from '@/lib/math/geometry';

// Create surface mesh with curvature coloring
function CurvatureSurface({ 
  surfaceType, 
  showNormals 
}: { 
  surfaceType: number;
  showNormals: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  
  // Generate surface geometry
  const { positions, colors, normals } = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const normals: number[] = [];
    
    const uSegments = 50;
    const vSegments = 50;
    
    // Surface parameters based on type
    // 0: Sphere, 1: Torus, 2: Saddle, 3: Paraboloid, 4: Helicoid
    
    for (let i = 0; i <= uSegments; i++) {
      for (let j = 0; j <= vSegments; j++) {
        const u = (i / uSegments) * Math.PI * 2;
        const v = (j / vSegments) * Math.PI;
        
        let pos: { x: number; y: number; z: number };
        let K = 0;
        
        switch (surfaceType) {
          case 0: // Sphere - K = 1/r² > 0
            pos = surfaces.sphere(u, v, 1.5);
            K = 1 / (1.5 * 1.5);
            break;
          case 1: // Torus - K varies
            const torusR = 2;
            const torusr = 0.7;
            pos = surfaces.torus(u, v, torusR, torusr);
            K = Math.cos(v) / (torusr * (torusR + torusr * Math.cos(v)));
            break;
          case 2: // Saddle - K < 0
            const sx = (i / uSegments - 0.5) * 4;
            const sy = (j / vSegments - 0.5) * 4;
            pos = surfaces.saddle(sx, sy, 1, 1);
            K = -1; // K < 0 everywhere
            break;
          case 3: // Paraboloid - K > 0
            const px = (i / uSegments - 0.5) * 3;
            const py = (j / vSegments - 0.5) * 3;
            pos = surfaces.paraboloid(px, py, 1, 1);
            K = 0.5; // Simplified
            break;
          case 4: // Helicoid - K = 0
            const hu = u * 2;
            const hv = (j / vSegments - 0.5) * 2;
            pos = surfaces.helicoid(hu, hv, 0.3);
            K = 0;
            break;
          default:
            pos = { x: 0, y: 0, z: 0 };
        }
        
        positions.push(pos.x, pos.y, pos.z);
        
        // Color based on Gaussian curvature
        let color: THREE.Color;
        if (K > 0.01) {
          // Elliptic (K > 0) - Red/Orange
          color = new THREE.Color().lerpColors(
            new THREE.Color('#22c55e'),
            new THREE.Color('#ef4444'),
            Math.min(K, 1)
          );
        } else if (K < -0.01) {
          // Hyperbolic (K < 0) - Blue
          color = new THREE.Color('#3b82f6');
        } else {
          // Parabolic (K = 0) - Green
          color = new THREE.Color('#22c55e');
        }
        
        colors.push(color.r, color.g, color.b);
        
        // Calculate normal (simplified)
        const eps = 0.001;
        let normal: { x: number; y: number; z: number };
        
        if (surfaceType === 2 || surfaceType === 3) {
          // For explicit surfaces z = f(x,y)
          normal = { x: 0, y: 0, z: 1 };
        } else {
          normal = { x: pos.x, y: pos.y, z: pos.z };
        }
        
        const len = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);
        if (len > 0) {
          normals.push(normal.x / len, normal.y / len, normal.z / len);
        } else {
          normals.push(0, 1, 0);
        }
      }
    }
    
    return { positions, colors, normals };
  }, [surfaceType]);
  
  // Generate indices
  const indices = useMemo(() => {
    const idx: number[] = [];
    const uSegments = 50;
    const vSegments = 50;
    
    for (let i = 0; i < uSegments; i++) {
      for (let j = 0; j < vSegments; j++) {
        const a = i * (vSegments + 1) + j;
        const b = a + vSegments + 1;
        idx.push(a, b, a + 1);
        idx.push(b, b + 1, a + 1);
      }
    }
    
    return idx;
  }, []);
  
  const surfaceNames = ['Sphere', 'Torus', 'Saddle', 'Paraboloid', 'Helicoid'];
  
  return (
    <group>
      <mesh ref={meshRef}>
        <bufferGeometry ref={geometryRef}>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={new Float32Array(positions)}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={new Float32Array(colors)}
            itemSize={3}
          />
          <bufferAttribute
            attach="index"
            array={new Uint32Array(indices)}
            count={indices.length}
          />
        </bufferGeometry>
        <meshStandardMaterial
          vertexColors
          side={THREE.DoubleSide}
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>
      
      {/* Title */}
      <Text position={[0, 3.5, 0]} fontSize={0.25} color="#ffffff">
        Gaussian Curvature: {surfaceNames[surfaceType]}
      </Text>
      
      {/* Legend */}
      <group position={[3, 1, 0]}>
        <Text fontSize={0.12} color="#ef4444" position={[0, 0, 0]}>
          K {'>'} 0 (Elliptic)
        </Text>
        <Text fontSize={0.12} color="#22c55e" position={[0, -0.3, 0]}>
          K = 0 (Parabolic)
        </Text>
        <Text fontSize={0.12} color="#3b82f6" position={[0, -0.6, 0]}>
          K {'<'} 0 (Hyperbolic)
        </Text>
      </group>
    </group>
  );
}

export function GaussianExplorer() {
  const { parameters } = useGeometryStore();
  const surfaceType = Math.floor(parameters.surfaceType ?? 0);
  const showNormals = (parameters.showNormals ?? 1) === 1;
  
  return (
    <CurvatureSurface surfaceType={surfaceType} showNormals={showNormals} />
  );
}
