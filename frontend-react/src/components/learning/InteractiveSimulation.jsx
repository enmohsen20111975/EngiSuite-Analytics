/**
 * Interactive Simulation Component
 * Renders interactive engineering simulations for learning modules
 * 
 * Based on: learning-courses-repo/src/components/InteractiveComponent.tsx
 */

import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load simulation components for better performance
const OhmsLaw = lazy(() => import('./simulations/OhmsLaw'));
const SineWave = lazy(() => import('./simulations/SineWave'));
const SeriesParallel = lazy(() => import('./simulations/SeriesParallel'));
const AtomModel = lazy(() => import('./simulations/AtomModel'));
const LogicGates = lazy(() => import('./simulations/LogicGates'));
const BeamDeflection = lazy(() => import('./simulations/BeamDeflection'));
const TorqueSim = lazy(() => import('./simulations/TorqueSim'));
const ConcreteMix = lazy(() => import('./simulations/ConcreteMix'));
const CompressionTest = lazy(() => import('./simulations/CompressionTest'));
const FluidFlow = lazy(() => import('./simulations/FluidFlow'));
const AirfoilLift = lazy(() => import('./simulations/AirfoilLift'));
const ReactionRate = lazy(() => import('./simulations/ReactionRate'));
const PistonSim = lazy(() => import('./simulations/PistonSim'));
const DataPlotter = lazy(() => import('./simulations/DataPlotter'));
const GearRatio = lazy(() => import('./simulations/GearRatio'));
const ProjectileMotion = lazy(() => import('./simulations/ProjectileMotion'));
const HeatEngine = lazy(() => import('./simulations/HeatEngine'));
const StressStrain = lazy(() => import('./simulations/StressStrain'));
const Transformer3D = lazy(() => import('./simulations/Transformer3D'));

// SINAMICS Drive Technology Simulations
const SinamicsMotorLab = lazy(() => import('./simulations/SinamicsMotorLab'));
const SinamicsPIDLab = lazy(() => import('./simulations/SinamicsPIDLab'));
const SinamicsInverterFlow = lazy(() => import('./simulations/SinamicsInverterFlow'));

// KineticGeometry - Mathematics & Geometry Simulations
const LissajousFigures = lazy(() => import('./simulations/LissajousFigures'));
const MandelbrotExplorer = lazy(() => import('./simulations/MandelbrotExplorer'));

// Loading fallback component
const SimulationLoader = () => (
  <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-slate-800 rounded-xl">
    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    <span className="ml-2 text-gray-600 dark:text-gray-300">Loading simulation...</span>
  </div>
);

/**
 * InteractiveSimulation - Main wrapper component for all simulations
 * 
 * @param {string} type - The type of simulation to render
 * @param {object} config - Optional configuration for the simulation
 * @param {object} data - Optional data to pass to the simulation
 */
const InteractiveSimulation = ({ type, config = {}, data = {} }) => {
  // Render the appropriate simulation based on type
  const renderSimulation = () => {
    switch (type) {
      // Electrical Engineering
      case 'ohms-law':
        return <OhmsLaw {...config} {...data} />;
      case 'sine-wave':
        return <SineWave {...config} {...data} />;
      case 'series-parallel':
        return <SeriesParallel {...config} {...data} />;
      case '3d-transformer':
        return <Transformer3D {...config} {...data} />;
        
      // Physics / General
      case 'atom-model':
        return <AtomModel {...config} {...data} />;
      case 'logic-gate':
      case 'logic-gates':
        return <LogicGates {...config} {...data} />;
      case 'data-plotter':
        return <DataPlotter {...config} {...data} />;
        
      // Mechanical Engineering
      case 'beam-deflection':
        return <BeamDeflection {...config} {...data} />;
      case 'torque-sim':
        return <TorqueSim {...config} {...data} />;
      case 'gear-ratio':
        return <GearRatio {...config} {...data} />;
      case 'projectile-motion':
        return <ProjectileMotion {...config} {...data} />;
      case 'piston-sim':
        return <PistonSim {...config} {...data} />;
      case 'heat-engine':
        return <HeatEngine {...config} {...data} />;
        
      // Civil Engineering
      case 'concrete-mix':
        return <ConcreteMix {...config} {...data} />;
      case 'compression-test':
        return <CompressionTest {...config} {...data} />;
      case 'stress-strain':
        return <StressStrain {...config} {...data} />;
        
      // Fluid Mechanics / Aerospace
      case 'fluid-flow':
        return <FluidFlow {...config} {...data} />;
      case 'airfoil-lift':
        return <AirfoilLift {...config} {...data} />;
        
      // Chemical Engineering
      case 'reaction-rate':
        return <ReactionRate {...config} {...data} />;
        
      // SINAMICS Drive Technology
      case 'sinamics-motor-lab':
        return <SinamicsMotorLab {...config} {...data} />;
      case 'sinamics-pid-lab':
        return <SinamicsPIDLab {...config} {...data} />;
      case 'sinamics-inverter-flow':
        return <SinamicsInverterFlow {...config} {...data} />;
        
      // KineticGeometry - Mathematics & Geometry
      case 'lissajous-figures':
        return <LissajousFigures {...config} {...data} />;
      case 'mandelbrot-explorer':
        return <MandelbrotExplorer {...config} {...data} />;
        
      default:
        return (
          <div className="flex flex-col items-center justify-center h-48 bg-gray-100 dark:bg-slate-800 rounded-xl">
            <p className="text-gray-500 dark:text-gray-400">Unknown simulation type: {type}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Please check the simulation configuration.</p>
          </div>
        );
    }
  };

  return (
    <Suspense fallback={<SimulationLoader />}>
      {renderSimulation()}
    </Suspense>
  );
};

// Simulation metadata for UI generation
export const SIMULATION_METADATA = {
  'ohms-law': {
    name: "Ohm's Law Calculator",
    category: 'Electrical',
    description: 'Interactive calculator for voltage, current, and resistance'
  },
  'sine-wave': {
    name: 'AC Sine Wave',
    category: 'Electrical',
    description: 'Visualization of alternating current waveform'
  },
  'series-parallel': {
    name: 'Series/Parallel Circuits',
    category: 'Electrical',
    description: 'Calculate equivalent resistance'
  },
  'atom-model': {
    name: 'Atomic Structure',
    category: 'Physics',
    description: 'Animated visualization of atomic structure'
  },
  'logic-gate': {
    name: 'Digital Logic Gates',
    category: 'Computer',
    description: 'Interactive truth table for logic gates'
  },
  'beam-deflection': {
    name: 'Beam Deflection',
    category: 'Mechanical/Civil',
    description: 'Visualize beam deflection under load'
  },
  'torque-sim': {
    name: 'Torque Simulator',
    category: 'Mechanical',
    description: 'Demonstrate torque as force × distance'
  },
  'concrete-mix': {
    name: 'Concrete Mix Design',
    category: 'Civil',
    description: 'Interactive concrete proportioning'
  },
  'compression-test': {
    name: 'Compression Test',
    category: 'Civil',
    description: 'Simulate concrete compression testing'
  },
  'fluid-flow': {
    name: 'Fluid Flow',
    category: 'Fluid Mechanics',
    description: 'Visualize fluid dynamics'
  },
  'airfoil-lift': {
    name: 'Airfoil Lift',
    category: 'Aerospace',
    description: 'Demonstrate lift generation'
  },
  'reaction-rate': {
    name: 'Reaction Rate',
    category: 'Chemical',
    description: 'Chemical kinetics visualization'
  },
  'piston-sim': {
    name: 'Thermodynamic Piston',
    category: 'Mechanical',
    description: 'Visualize piston movement with heat'
  },
  'data-plotter': {
    name: 'System Response Plotter',
    category: 'General',
    description: 'Configurable damped oscillation plot'
  },
  'gear-ratio': {
    name: 'Gear Ratio Simulator',
    category: 'Mechanical',
    description: 'Animated gear ratio demonstration'
  },
  'projectile-motion': {
    name: 'Projectile Motion',
    category: 'Mechanical/Aerospace',
    description: 'Trajectory visualization'
  },
  'heat-engine': {
    name: 'Carnot Heat Engine',
    category: 'Mechanical/Chemical',
    description: 'Maximum efficiency visualization'
  },
  'stress-strain': {
    name: 'Stress-Strain Curve',
    category: 'Mechanical/Civil',
    description: 'Material behavior infographic'
  },
  '3d-transformer': {
    name: '3D Transformer Model',
    category: 'Electrical',
    description: 'Interactive 3D transformer visualization'
  },
  'sinamics-motor-lab': {
    name: 'SINAMICS Motor Lab',
    category: 'Drive Technology',
    description: 'Compare V/f and Vector Control performance'
  },
  'sinamics-pid-lab': {
    name: 'SINAMICS PID Tuning Lab',
    category: 'Drive Technology',
    description: 'Fine-tune PI speed controller parameters'
  },
  'sinamics-inverter-flow': {
    name: 'SINAMICS Power Electronics',
    category: 'Drive Technology',
    description: 'Visualize AC-DC-AC power conversion'
  },
  'lissajous-figures': {
    name: 'Lissajous Figures',
    category: 'Mathematics',
    description: 'Explore parametric curves from harmonic motion'
  },
  'mandelbrot-explorer': {
    name: 'Mandelbrot Fractal Explorer',
    category: 'Mathematics',
    description: 'Interactive fractal geometry visualization'
  }
};

export default InteractiveSimulation;
