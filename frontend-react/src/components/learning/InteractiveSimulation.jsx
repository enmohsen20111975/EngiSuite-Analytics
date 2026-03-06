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
  const simulationProps = { ...config, ...data };

  const renderSimulation = () => {
    switch (type) {
      case 'ohms-law':
        return <OhmsLaw {...simulationProps} />;
      
      case 'sine-wave':
        return <SineWave {...simulationProps} />;
      
      case 'series-parallel':
        return <SeriesParallel {...simulationProps} />;
      
      case 'atom-model':
        return <AtomModel {...simulationProps} />;
      
      case 'logic-gate':
        return <LogicGates {...simulationProps} />;
      
      case 'beam-deflection':
        return <BeamDeflection {...simulationProps} />;
      
      case 'torque-sim':
        return <TorqueSim {...simulationProps} />;
      
      case 'concrete-mix':
        return <ConcreteMix {...simulationProps} />;
      
      case 'compression-test':
        return <CompressionTest {...simulationProps} />;
      
      case 'fluid-flow':
        return <FluidFlow {...simulationProps} />;
      
      case 'airfoil-lift':
        return <AirfoilLift {...simulationProps} />;
      
      case 'reaction-rate':
        return <ReactionRate {...simulationProps} />;
      
      case 'piston-sim':
        return <PistonSim {...simulationProps} />;
      
      case 'data-plotter':
        return <DataPlotter {...simulationProps} />;
      
      case 'gear-ratio':
        return <GearRatio {...simulationProps} />;
      
      case 'projectile-motion':
        return <ProjectileMotion {...simulationProps} />;
      
      case 'heat-engine':
        return <HeatEngine {...simulationProps} />;
      
      case 'stress-strain':
        return <StressStrain {...simulationProps} />;
      
      case '3d-transformer':
        // 3D transformer requires Three.js - lazy load separately
        const Transformer3D = lazy(() => import('./simulations/Transformer3D'));
        return <Transformer3D {...simulationProps} />;
      
      default:
        return (
          <div className="p-6 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800">
            <p className="font-medium">Unknown simulation type: {type}</p>
            <p className="text-sm mt-1">Please check the simulation configuration.</p>
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

export default InteractiveSimulation;

// Export simulation types for reference
export const SIMULATION_TYPES = {
  OHMS_LAW: 'ohms-law',
  SINE_WAVE: 'sine-wave',
  SERIES_PARALLEL: 'series-parallel',
  ATOM_MODEL: 'atom-model',
  LOGIC_GATE: 'logic-gate',
  BEAM_DEFLECTION: 'beam-deflection',
  TORQUE_SIM: 'torque-sim',
  CONCRETE_MIX: 'concrete-mix',
  COMPRESSION_TEST: 'compression-test',
  FLUID_FLOW: 'fluid-flow',
  AIRFOIL_LIFT: 'airfoil-lift',
  REACTION_RATE: 'reaction-rate',
  PISTON_SIM: 'piston-sim',
  DATA_PLOTTER: 'data-plotter',
  GEAR_RATIO: 'gear-ratio',
  PROJECTILE_MOTION: 'projectile-motion',
  HEAT_ENGINE: 'heat-engine',
  STRESS_STRAIN: 'stress-strain',
  TRANSFORMER_3D: '3d-transformer'
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
    category: 'Mechanical/Chemical',
    description: 'Continuity equation demonstration'
  },
  'airfoil-lift': {
    name: 'Airfoil Lift & Drag',
    category: 'Aerospace',
    description: 'Adjust angle of attack to see coefficients'
  },
  'reaction-rate': {
    name: 'Reaction Rate',
    category: 'Chemical',
    description: 'Arrhenius equation demonstration'
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
  }
};
