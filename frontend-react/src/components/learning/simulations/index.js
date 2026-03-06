/**
 * Learning Simulations Index
 * Export all interactive simulation components
 */

// Electrical Engineering
export { default as OhmsLaw } from './OhmsLaw';
export { default as SineWave } from './SineWave';
export { default as SeriesParallel } from './SeriesParallel';
export { default as Transformer3D } from './Transformer3D';

// Physics / General
export { default as AtomModel } from './AtomModel';
export { default as LogicGates } from './LogicGates';
export { default as DataPlotter } from './DataPlotter';

// Mechanical Engineering
export { default as BeamDeflection } from './BeamDeflection';
export { default as TorqueSim } from './TorqueSim';
export { default as GearRatio } from './GearRatio';
export { default as ProjectileMotion } from './ProjectileMotion';
export { default as PistonSim } from './PistonSim';
export { default as HeatEngine } from './HeatEngine';

// Civil Engineering
export { default as ConcreteMix } from './ConcreteMix';
export { default as CompressionTest } from './CompressionTest';
export { default as StressStrain } from './StressStrain';

// Fluid Mechanics / Aerospace
export { default as FluidFlow } from './FluidFlow';
export { default as AirfoilLift } from './AirfoilLift';

// Chemical Engineering
export { default as ReactionRate } from './ReactionRate';

// Simulation type constants
export const SIMULATION_TYPES = {
  // Electrical
  OHMS_LAW: 'ohms-law',
  SINE_WAVE: 'sine-wave',
  SERIES_PARALLEL: 'series-parallel',
  TRANSFORMER_3D: '3d-transformer',
  
  // Physics
  ATOM_MODEL: 'atom-model',
  LOGIC_GATE: 'logic-gate',
  DATA_PLOTTER: 'data-plotter',
  
  // Mechanical
  BEAM_DEFLECTION: 'beam-deflection',
  TORQUE_SIM: 'torque-sim',
  GEAR_RATIO: 'gear-ratio',
  PROJECTILE_MOTION: 'projectile-motion',
  PISTON_SIM: 'piston-sim',
  HEAT_ENGINE: 'heat-engine',
  
  // Civil
  CONCRETE_MIX: 'concrete-mix',
  COMPRESSION_TEST: 'compression-test',
  STRESS_STRAIN: 'stress-strain',
  
  // Fluid/Aerospace
  FLUID_FLOW: 'fluid-flow',
  AIRFOIL_LIFT: 'airfoil-lift',
  
  // Chemical
  REACTION_RATE: 'reaction-rate'
};

// Category mapping for UI organization
export const SIMULATION_CATEGORIES = {
  electrical: ['ohms-law', 'sine-wave', 'series-parallel', '3d-transformer'],
  mechanical: ['beam-deflection', 'torque-sim', 'gear-ratio', 'projectile-motion', 'piston-sim', 'heat-engine'],
  civil: ['concrete-mix', 'compression-test', 'stress-strain', 'beam-deflection'],
  aerospace: ['airfoil-lift', 'fluid-flow', 'projectile-motion'],
  chemical: ['reaction-rate', 'fluid-flow', 'heat-engine', 'piston-sim'],
  computer: ['logic-gate'],
  physics: ['atom-model', 'data-plotter']
};
