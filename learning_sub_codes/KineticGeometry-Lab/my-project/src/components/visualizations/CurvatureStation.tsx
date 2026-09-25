'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';
import { curves, curvature, vec2 } from '@/lib/math/geometry';

export function CurvatureStation() {
  const { animationState, parameters, showVectors } = useGeometryStore();
  const tParam = parameters.t ?? 0;
  const curveType = Math.floor(parameters.curveType ?? 0);
  
  // Get curve point and derivatives
  const curveData = useMemo(() => {
    let point: { x: number; y: number };
    let tangent: { x: number; y: number };
    let normal: { x: number; y: number };
    let kappa: number;
    
    // Different curve types
    switch (curveType) {
      case 0: // Ellipse
        const a = 2, b = 1;
        point = curves.ellipse(tParam * Math.PI * 2, a, b);
        tangent = { x: -a * Math.sin(tParam * Math.PI * 2), y: b * Math.cos(tParam * Math.PI * 2) };
        const ellipseR = Math.pow(a * a * Math.sin(tParam * Math.PI * 2) ** 2 + b * b * Math.cos(tParam * Math.PI * 2) ** 2, 1.5);
        kappa = (a * b) / ellipseR;
        break;
      case 1: // Parabola (parametrized)
        const px = (tParam - 0.5) * 4;
        point = { x: px, y: px * px * 0.25 };
        tangent = { x: 1, y: px * 0.5 };
        kappa = Math.abs(0.5) / Math.pow(1 + (px * 0.5) ** 2, 1.5);
        break;
      case 2: // Cubic
        const cx = (tParam - 0.5) * 4;
        point = { x: cx, y: cx * cx * cx * 0.1 };
        tangent = { x: 1, y: 3 * cx * cx * 0.1 };
        const cdd = 6 * cx * 0.1;
        kappa = Math.abs(cdd) / Math.pow(1 + (3 * cx * cx * 0.1) ** 2, 1.5);
        break;
      default:
        point = { x: 0, y: 0 };
        tangent = { x: 1, y: 0 };
        kappa = 0;
    }
    
    // Normalize tangent and get normal
    const tLen = Math.sqrt(tangent.x ** 2 + tangent.y ** 2);
    tangent = { x: tangent.x / tLen, y: tangent.y / tLen };
    normal = { x: -tangent.y, y: tangent.x };
    
    // Radius of curvature
    const radius = kappa > 0.001 ? 1 / kappa : 10;
    
    // Osculating circle center
    const center = {
      x: point.x + normal.x * radius,
      y: point.y + normal.y * radius,
    };
    
    return { point, tangent, normal, kappa, radius, center };
  }, [tParam, curveType]);
  
  // Generate the full curve
  const fullCurve = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      let p: { x: number; y: number };
      
      switch (curveType) {
        case 0:
          p = curves.ellipse(t * Math.PI * 2, 2, 1);
          break;
        case 1:
          const px = (t - 0.5) * 4;
          p = { x: px, y: px * px * 0.25 };
          break;
        case 2:
          const cx = (t - 0.5) * 4;
          p = { x: cx, y: cx * cx * cx * 0.1 };
          break;
        default:
          p = { x: 0, y: 0 };
      }
      points.push(new THREE.Vector3(p.x, p.y, 0));
    }
    return points;
  }, [curveType]);
  
  // Osculating circle
  const osculatingCircle = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const { center, radius } = curveData;
    const displayRadius = Math.min(radius, 3);
    
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      points.push(new THREE.Vector3(
        center.x + displayRadius * Math.cos(angle),
        center.y + displayRadius * Math.sin(angle),
        0
      ));
    }
    return points;
  }, [curveData]);
  
  const curveNames = ['Ellipse', 'Parabola', 'Cubic'];
  
  return (
    <group>
      {/* Main curve */}
      <Line points={fullCurve} color="#f97316" lineWidth={3} />
      
      {/* Osculating circle */}
      <Line points={osculatingCircle} color="#22c55e" lineWidth={2} transparent opacity={0.7} />
      
      {/* Current point */}
      <mesh position={[curveData.point.x, curveData.point.y, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.8} />
      </mesh>
      
      {/* Center of curvature */}
      <mesh position={[curveData.center.x, curveData.center.y, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
      
      {/* Tangent vector */}
      {showVectors && (
        <arrowHelper args={[
          new THREE.Vector3(curveData.tangent.x, curveData.tangent.y, 0).normalize(),
          new THREE.Vector3(curveData.point.x, curveData.point.y, 0),
          0.5,
          0xef4444,
          0.08,
          0.04
        ]} />
      )}
      
      {/* Normal vector */}
      {showVectors && (
        <arrowHelper args={[
          new THREE.Vector3(curveData.normal.x, curveData.normal.y, 0).normalize(),
          new THREE.Vector3(curveData.point.x, curveData.point.y, 0),
          0.4,
          0x3b82f6,
          0.08,
          0.04
        ]} />
      )}
      
      {/* Labels */}
      <Text position={[curveData.point.x + 0.2, curveData.point.y + 0.2, 0]} fontSize={0.1} color="#f97316">
        P
      </Text>
      <Text position={[curveData.center.x + 0.15, curveData.center.y + 0.15, 0]} fontSize={0.1} color="#22c55e">
        C
      </Text>
      
      {/* Info panel */}
      <Float speed={2} floatIntensity={0.2}>
        <group position={[4, 2, 0]}>
          <Text fontSize={0.15} color="#ffffff">Curvature Analysis</Text>
          <Text fontSize={0.12} color="#f97316" position={[0, -0.3, 0]}>
            Curve: {curveNames[curveType]}
          </Text>
          <Text fontSize={0.1} color="#94a3b8" position={[0, -0.55, 0]}>
            κ = {curveData.kappa.toFixed(4)}
          </Text>
          <Text fontSize={0.1} color="#94a3b8" position={[0, -0.75, 0]}>
            R = {curveData.radius.toFixed(3)}
          </Text>
        </group>
      </Float>
      
      {/* Title */}
      <Text position={[0, 3.5, 0]} fontSize={0.3} color="#ffffff">
        Curvature Analysis Station
      </Text>
      
      {/* Formula */}
      <Text position={[0, -2.5, 0]} fontSize={0.12} color="#64748b">
        κ = |x'y'' - y'x''| / (x'² + y'²)^(3/2)
      </Text>
    </group>
  );
}
