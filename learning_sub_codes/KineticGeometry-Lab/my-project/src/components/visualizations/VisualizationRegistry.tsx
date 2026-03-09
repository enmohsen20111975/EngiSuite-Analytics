'use client';

import dynamic from 'next/dynamic';
import { useGeometryStore } from '@/store/geometry-store';
import { Scene3D } from './Scene3D';

// All visualization components with dynamic imports
const visualizationComponents: Record<string, React.ComponentType<unknown>> = {
  // Module 1: Foundations
  CartesianTheater3D: dynamic(() => import('./CartesianTheater3D').then(m => m.CartesianTheater3D), { ssr: false }),
  PolarDance: dynamic(() => import('./PolarDance').then(m => m.PolarDance), { ssr: false }),
  ParametricNavigator: dynamic(() => import('./ParametricNavigator').then(m => m.ParametricNavigator), { ssr: false }),
  VectorFieldFlow: dynamic(() => import('./VectorFieldFlow').then(m => m.VectorFieldFlow), { ssr: false }),
  BasisTransformation: dynamic(() => import('./BasisTransformation').then(m => m.BasisTransformation), { ssr: false }),
  DotProductSpotlight: dynamic(() => import('./DotProductSpotlight').then(m => m.DotProductSpotlight), { ssr: false }),
  
  // Module 2: Kinematic Curves
  CycloidRace: dynamic(() => import('./CycloidRace').then(m => m.CycloidRace), { ssr: false }),
  EpicycloidGenerator: dynamic(() => import('./EpicycloidGenerator').then(m => m.EpicycloidGenerator), { ssr: false }),
  BezierStudio: dynamic(() => import('./BezierStudio').then(m => m.BezierStudio), { ssr: false }),
  LissajousFigures: dynamic(() => import('./LissajousFigures').then(m => m.LissajousFigures), { ssr: false }),
  CurvatureStation: dynamic(() => import('./CurvatureStation').then(m => m.CurvatureStation), { ssr: false }),
  EvoluteGeneration: dynamic(() => import('./EvoluteGeneration').then(m => m.EvoluteGeneration), { ssr: false }),
  
  // Module 3: Surfaces
  RuledSurfaces: dynamic(() => import('./RuledSurfaces').then(m => m.RuledSurfaces), { ssr: false }),
  SurfaceRevolution: dynamic(() => import('./SurfaceRevolution').then(m => m.SurfaceRevolution), { ssr: false }),
  GaussianExplorer: dynamic(() => import('./GaussianExplorer').then(m => m.GaussianExplorer), { ssr: false }),
  GreatCircleNav: dynamic(() => import('./GreatCircleNav').then(m => m.GreatCircleNav), { ssr: false }),
  ParallelTransport: dynamic(() => import('./ParallelTransport').then(m => m.ParallelTransport), { ssr: false }),
  
  // Module 4: Dynamic Geometry
  GimbalVisualization: dynamic(() => import('./GimbalVisualization').then(m => m.GimbalVisualization), { ssr: false }),
  InstantCenter: dynamic(() => import('./InstantCenter').then(m => m.InstantCenter), { ssr: false }),
  PappusTheorem: dynamic(() => import('./PappusTheorem').then(m => m.PappusTheorem), { ssr: false }),
  InertiaEllipsoid: dynamic(() => import('./InertiaEllipsoid').then(m => m.InertiaEllipsoid), { ssr: false }),
  
  // Module 5: Advanced
  WindingNumber: dynamic(() => import('./WindingNumber').then(m => m.WindingNumber), { ssr: false }),
  FixedPointTheorem: dynamic(() => import('./FixedPointTheorem').then(m => m.FixedPointTheorem), { ssr: false }),
  MandelbrotExplorer: dynamic(() => import('./MandelbrotExplorer').then(m => m.MandelbrotExplorer), { ssr: false }),
  LorenzAttractor: dynamic(() => import('./LorenzAttractor').then(m => m.LorenzAttractor), { ssr: false }),
  SpaceFillingCurves: dynamic(() => import('./SpaceFillingCurves').then(m => m.SpaceFillingCurves), { ssr: false }),
};

// Placeholder for missing visualizations
function PlaceholderVisualization({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg">
      <div className="text-center text-white">
        <div className="text-6xl mb-4">🚧</div>
        <h3 className="text-xl font-medium mb-2">{title}</h3>
        <p className="text-slate-400">This visualization is coming soon!</p>
      </div>
    </div>
  );
}

export function VisualizationRegistry() {
  const getCurrentVisualization = useGeometryStore((state) => state.getCurrentVisualization);
  const visualization = getCurrentVisualization();
  
  if (!visualization) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">📐</div>
          <h2 className="text-2xl font-bold mb-2">KineticGeometry Lab</h2>
          <p className="text-slate-400">Select a visualization from the navigation panel</p>
        </div>
      </div>
    );
  }
  
  const Component = visualizationComponents[visualization.component];
  
  if (!Component) {
    return <PlaceholderVisualization title={visualization.title} />;
  }
  
  return (
    <Scene3D>
      <Component />
    </Scene3D>
  );
}
