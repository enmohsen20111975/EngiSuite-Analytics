'use client';

import { useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '@/store/geometry-store';

// Mandelbrot iteration function
function mandelbrot(cRe: number, cIm: number, maxIter: number): number {
  let zRe = 0;
  let zIm = 0;
  let n = 0;
  
  while (n < maxIter) {
    const zRe2 = zRe * zRe;
    const zIm2 = zIm * zIm;
    
    if (zRe2 + zIm2 > 4) break;
    
    zIm = 2 * zRe * zIm + cIm;
    zRe = zRe2 - zIm2 + cRe;
    n++;
  }
  
  return n;
}

// Generate Mandelbrot texture
function generateMandelbrotTexture(
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  zoom: number,
  maxIter: number
): Uint8Array {
  const data = new Uint8Array(width * height * 4);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cRe = centerX + (x - width / 2) / (width * zoom / 4);
      const cIm = centerY + (y - height / 2) / (height * zoom / 4);
      
      const n = mandelbrot(cRe, cIm, maxIter);
      
      const idx = (y * width + x) * 4;
      
      if (n === maxIter) {
        // Inside the set - black
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
        data[idx + 3] = 255;
      } else {
        // Outside - color based on iteration count
        const t = n / maxIter;
        const hue = (t * 360 + 200) % 360;
        const [r, g, b] = hslToRgb(hue / 360, 0.8, 0.3 + t * 0.4);
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
  }
  
  return data;
}

// HSL to RGB conversion
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export function MandelbrotExplorer() {
  const { parameters, animationState } = useGeometryStore();
  const maxIter = parameters.maxIter ?? 200;
  const zoom = parameters.zoom ?? 1;
  
  const [centerX, setCenterX] = useState(-0.5);
  const [centerY, setCenterY] = useState(0);
  
  // Generate texture
  const texture = useMemo(() => {
    const size = 256; // Lower resolution for performance
    const data = generateMandelbrotTexture(size, size, centerX, centerY, zoom, maxIter);
    
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.needsUpdate = true;
    return tex;
  }, [centerX, centerY, zoom, maxIter]);
  
  // Animate zoom when playing
  useEffect(() => {
    if (animationState.isPlaying) {
      const timer = setInterval(() => {
        setCenterX(-0.743643887037158704752191506114774);
        setCenterY(0.131825904205311970493132056385139);
      }, 100);
      return () => clearInterval(timer);
    }
  }, [animationState.isPlaying]);
  
  return (
    <group>
      {/* Mandelbrot plane */}
      <mesh rotation={[-Math.PI / 4, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      
      {/* Title */}
      <Text position={[0, 4, 0]} fontSize={0.3} color="#ffffff">
        Mandelbrot Set Explorer
      </Text>
      
      {/* Info */}
      <group position={[-3, 3, 0]}>
        <Text fontSize={0.12} color="#94a3b8">
          {`Zoom: ${zoom.toFixed(1)}x`}
        </Text>
        <Text fontSize={0.12} color="#94a3b8" position={[0, -0.25, 0]}>
          {`Max Iterations: ${maxIter}`}
        </Text>
        <Text fontSize={0.1} color="#64748b" position={[0, -0.6, 0]}>
          z → z² + c
        </Text>
      </group>
      
      {/* Instructions */}
      <Text position={[0, -3.5, 0]} fontSize={0.1} color="#64748b">
        Increase zoom parameter to explore fractal details
      </Text>
    </group>
  );
}
