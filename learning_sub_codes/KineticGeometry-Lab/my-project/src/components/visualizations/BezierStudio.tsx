'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';
import { curves, vec2, curvature } from '@/lib/math/geometry';

// Draggable control point
interface ControlPointProps {
  position: [number, number, number];
  color: string;
  index: number;
  onDrag: (index: number, pos: [number, number, number]) => void;
}

function ControlPoint({ position, color, index, onDrag }: ControlPointProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isDragging ? 0.8 : 0.3}
        />
      </mesh>
      <Text position={[0, 0.25, 0]} fontSize={0.1} color={color}>
        P{index}
      </Text>
    </group>
  );
}

// Curvature comb visualization
function CurvatureComb({ points, scale = 0.5 }: { points: Vec2[]; scale?: number }) {
  const combPoints = useMemo(() => {
    const result: THREE.Vector3[] = [];
    
    for (let i = 0; i < points.length; i++) {
      const t = i / (points.length - 1);
      
      // Approximate curvature using finite differences
      let kappa = 0;
      if (i > 0 && i < points.length - 1) {
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];
        
        const dx = (next.x - prev.x) / 2;
        const dy = (next.y - prev.y) / 2;
        const ddx = next.x - 2 * curr.x + prev.x;
        const ddy = next.y - 2 * curr.y + prev.y;
        
        kappa = curvature.parametric2D(dx, dy, ddx, ddy);
      }
      
      const normal: Vec2 = { x: -points[i].y, y: points[i].x }; // Simplified normal
      const len = Math.sqrt(normal.x ** 2 + normal.y ** 2);
      if (len > 0) {
        normal.x /= len;
        normal.y /= len;
      }
      
      const combHeight = kappa * scale;
      result.push(new THREE.Vector3(points[i].x, points[i].y, 0));
      result.push(new THREE.Vector3(
        points[i].x + normal.x * combHeight,
        points[i].y + normal.y * combHeight,
        0
      ));
    }
    
    return result;
  }, [points, scale]);
  
  if (combPoints.length < 2) return null;
  
  return (
    <Line
      points={combPoints}
      color="#a855f7"
      lineWidth={1}
      transparent
      opacity={0.6}
    />
  );
}

export function BezierStudio() {
  const { animationState, parameters, showTrails, showVectors } = useGeometryStore();
  const t = parameters.t ?? 0.5;
  
  // Control points (interactive in a real implementation)
  const [controlPoints] = useState<[number, number, number][]>([
    [-2, -1, 0],
    [-1, 2, 0],
    [1, 2, 0],
    [2, -1, 0],
  ]);
  
  // Generate Bézier curve
  const curvePoints = useMemo(() => {
    const points: Vec2[] = [];
    const p0 = { x: controlPoints[0][0], y: controlPoints[0][1] };
    const p1 = { x: controlPoints[1][0], y: controlPoints[1][1] };
    const p2 = { x: controlPoints[2][0], y: controlPoints[2][1] };
    const p3 = { x: controlPoints[3][0], y: controlPoints[3][1] };
    
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      points.push(curves.bezier(t, p0, p1, p2, p3));
    }
    
    return points;
  }, [controlPoints]);
  
  // Current point on curve
  const currentPoint = useMemo(() => {
    const p0 = { x: controlPoints[0][0], y: controlPoints[0][1] };
    const p1 = { x: controlPoints[1][0], y: controlPoints[1][1] };
    const p2 = { x: controlPoints[2][0], y: controlPoints[2][1] };
    const p3 = { x: controlPoints[3][0], y: controlPoints[3][1] };
    return curves.bezier(t, p0, p1, p2, p3);
  }, [t, controlPoints]);
  
  // Tangent vector at current point
  const tangent = useMemo(() => {
    const p0 = { x: controlPoints[0][0], y: controlPoints[0][1] };
    const p1 = { x: controlPoints[1][0], y: controlPoints[1][1] };
    const p2 = { x: controlPoints[2][0], y: controlPoints[2][1] };
    const p3 = { x: controlPoints[3][0], y: controlPoints[3][1] };
    const deriv = curves.bezierDerivative(t, p0, p1, p2, p3);
    const len = Math.sqrt(deriv.x ** 2 + deriv.y ** 2);
    if (len > 0) {
      return { x: deriv.x / len, y: deriv.y / len };
    }
    return { x: 1, y: 0 };
  }, [t, controlPoints]);
  
  // Convert to Three.js format
  const curveLinePoints = useMemo(() => {
    return curvePoints.map(p => new THREE.Vector3(p.x, p.y, 0));
  }, [curvePoints]);
  
  return (
    <group>
      {/* Control polygon */}
      <Line
        points={controlPoints.map(p => new THREE.Vector3(...p))}
        color="#64748b"
        lineWidth={1}
        dashed
        dashScale={2}
        gapSize={1}
      />
      
      {/* Control points */}
      {controlPoints.map((pos, i) => (
        <ControlPoint
          key={i}
          position={pos}
          color={i === 0 || i === 3 ? '#f97316' : '#3b82f6'}
          index={i}
          onDrag={() => {}}
        />
      ))}
      
      {/* Bézier curve */}
      <Line points={curveLinePoints} color="#f97316" lineWidth={3} />
      
      {/* Curvature comb */}
      {showVectors && <CurvatureComb points={curvePoints} scale={0.3} />}
      
      {/* Current point marker */}
      <mesh position={[currentPoint.x, currentPoint.y, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Tangent vector */}
      {showVectors && (
        <Line
          points={[
            new THREE.Vector3(currentPoint.x, currentPoint.y, 0),
            new THREE.Vector3(currentPoint.x + tangent.x * 0.5, currentPoint.y + tangent.y * 0.5, 0),
          ]}
          color="#22c55e"
          lineWidth={2}
        />
      )}
      
      {/* Parameter display */}
      <Text position={[0, -2.5, 0]} fontSize={0.15} color="#ffffff">
        t = {t.toFixed(2)}
      </Text>
      <Text position={[0, -2.8, 0]} fontSize={0.12} color="#94a3b8">
        Position: ({currentPoint.x.toFixed(2)}, {currentPoint.y.toFixed(2)})
      </Text>
      
      {/* Title */}
      <Text position={[0, 3, 0]} fontSize={0.25} color="#ffffff">
        Cubic Bézier Curve
      </Text>
    </group>
  );
}
