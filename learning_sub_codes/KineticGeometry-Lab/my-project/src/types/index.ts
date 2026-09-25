import type { Vector3 } from 'three';

// Vector types
export type Vec2 = { x: number; y: number };
export type Vec3 = { x: number; y: number; z: number };

// Parameter definition for interactive controls
export interface ParameterDef {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit?: string;
}

// Animation state
export interface AnimationState {
  isPlaying: boolean;
  speed: number;
  time: number;
  deltaTime: number;
  frameCount: number;
}

// Trail point for path visualization
export interface TrailPoint {
  position: Vec3;
  timestamp: number;
  velocity?: Vec3;
}

// Visualization props base
export interface VisualizationProps {
  parameters: Record<string, number>;
  animationState: AnimationState;
  showTrails: boolean;
  showVectors: boolean;
  showGrid: boolean;
  onParameterChange: (key: string, value: number) => void;
}

// Module definition
export interface ModuleDef {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'intermediate-advanced' | 'advanced' | 'expert';
  duration: string;
  chapters: ChapterDef[];
}

// Chapter definition
export interface ChapterDef {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  visualizations: VisualizationDef[];
}

// Visualization definition
export interface VisualizationDef {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  component: string;
  parameters: ParameterDef[];
  features: string[];
}

// Curvature data point
export interface CurvaturePoint {
  t: number;
  position: Vec3;
  tangent: Vec3;
  normal: Vec3;
  curvature: number;
  radiusOfCurvature: number;
}

// Surface data
export interface SurfaceData {
  vertices: Vec3[];
  faces: number[][];
  normals: Vec3[];
  curvatureValues?: number[];
}

// Particle for physics simulations
export interface Particle {
  id: string;
  position: Vec3;
  velocity: Vec3;
  acceleration: Vec3;
  mass: number;
  trail: TrailPoint[];
}

// Race result for brachistochrone
export interface RaceResult {
  curveType: 'straight' | 'circular' | 'cycloid';
  finishTime: number | null;
  position: Vec3;
  velocity: number;
  finished: boolean;
}

// Gimbal state for Euler angles
export interface GimbalState {
  roll: number;
  pitch: number;
  yaw: number;
  gimbalLock: boolean;
}

// Fractal parameters
export interface FractalParams {
  maxIterations: number;
  escapeRadius: number;
  centerX: number;
  centerY: number;
  zoom: number;
}

// Curve types for the visualization gallery
export type CurveType = 
  | 'cycloid'
  | 'epicycloid'
  | 'hypocycloid'
  | 'bezier'
  | 'spline'
  | 'lissajous'
  | 'ellipse'
  | 'parabola'
  | 'helix';

// Surface types
export type SurfaceType =
  | 'hyperboloid'
  | 'helicoid'
  | 'mobius'
  | 'sphere'
  | 'torus'
  | 'paraboloid'
  | 'saddle';
