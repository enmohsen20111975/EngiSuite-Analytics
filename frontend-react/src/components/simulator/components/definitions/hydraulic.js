/**
 * Hydraulic Component Definitions
 * Complete catalog of hydraulic components for the simulator
 * 
 * Converted from: external/Hydraulic-Simulator_JS/modules/core/HydraulicComponentDefinitions.js
 */

// Terminal types for hydraulic components
export const TerminalTypes = {
  PRESSURE_IN: 'pressure_in',
  PRESSURE_OUT: 'pressure_out',
  RETURN: 'return',
  DRAIN: 'drain',
  PILOT: 'pilot',
  CONTROL: 'control'
};

// Base component template
const createComponent = (config) => ({
  id: null, // Will be generated when added to canvas
  type: config.type,
  name: config.name,
  category: config.category,
  x: 0,
  y: 0,
  width: config.width || 60,
  height: config.height || 40,
  rotation: 0,
  flipped: false,
  terminals: config.terminals || [],
  properties: config.defaultProperties || {},
  state: config.defaultState || {},
  render: config.render,
  ...config
});

// ==================== SOURCES ====================

export const PUMP = createComponent({
  type: 'PUMP',
  name: 'Pump',
  category: 'sources',
  description: 'Fixed displacement hydraulic pump',
  icon: '💧',
  width: 60,
  height: 50,
  terminals: [
    { id: 'inlet', type: TerminalTypes.RETURN, x: 0, y: 25 },
    { id: 'outlet', type: TerminalTypes.PRESSURE_OUT, x: 60, y: 25 }
  ],
  defaultProperties: {
    displacement: { value: 10, unit: 'cm³/rev', min: 1, max: 500 },
    speed: { value: 1450, unit: 'rpm', min: 500, max: 3000 },
    efficiency: { value: 0.9, unit: '', min: 0.5, max: 1 }
  },
  defaultState: {
    isRunning: false,
    currentFlow: 0,
    currentPressure: 0
  }
});

export const VARIABLE_DISPLACEMENT_PUMP = createComponent({
  type: 'VARIABLE_DISPLACEMENT_PUMP',
  name: 'Variable Pump',
  category: 'sources',
  description: 'Variable displacement hydraulic pump with pressure compensation',
  icon: '🔧💧',
  width: 70,
  height: 50,
  terminals: [
    { id: 'inlet', type: TerminalTypes.RETURN, x: 0, y: 25 },
    { id: 'outlet', type: TerminalTypes.PRESSURE_OUT, x: 70, y: 25 },
    { id: 'control', type: TerminalTypes.CONTROL, x: 35, y: 0 }
  ],
  defaultProperties: {
    maxDisplacement: { value: 50, unit: 'cm³/rev', min: 1, max: 500 },
    minDisplacement: { value: 0, unit: 'cm³/rev', min: 0, max: 100 },
    speed: { value: 1450, unit: 'rpm', min: 500, max: 3000 },
    pressureCompensation: { value: 200, unit: 'bar', min: 10, max: 350 },
    efficiency: { value: 0.92, unit: '', min: 0.5, max: 1 }
  },
  defaultState: {
    isRunning: false,
    currentDisplacement: 50,
    currentFlow: 0,
    currentPressure: 0
  }
});

export const TANK = createComponent({
  type: 'TANK',
  name: 'Reservoir',
  category: 'sources',
  description: 'Hydraulic fluid reservoir',
  icon: '📦',
  width: 80,
  height: 50,
  terminals: [
    { id: 'return', type: TerminalTypes.RETURN, x: 40, y: 50 },
    { id: 'supply', type: TerminalTypes.PRESSURE_OUT, x: 40, y: 0 }
  ],
  defaultProperties: {
    capacity: { value: 100, unit: 'L', min: 10, max: 1000 },
    fluidLevel: { value: 80, unit: '%', min: 10, max: 100 },
    fluidType: { value: 'ISO 46', unit: '', options: ['ISO 32', 'ISO 46', 'ISO 68'] }
  },
  defaultState: {
    currentLevel: 80,
    temperature: 40
  }
});

export const PRESSURE_SOURCE = createComponent({
  type: 'PRESSURE_SOURCE',
  name: 'Pressure Source',
  category: 'sources',
  description: 'Ideal pressure source for simulation',
  icon: '⚡',
  width: 40,
  height: 40,
  terminals: [
    { id: 'outlet', type: TerminalTypes.PRESSURE_OUT, x: 40, y: 20 }
  ],
  defaultProperties: {
    pressure: { value: 100, unit: 'bar', min: 0, max: 350 }
  },
  defaultState: {
    currentPressure: 100
  }
});

// ==================== VALVES ====================

export const DIRECTIONAL_VALVE_4_3 = createComponent({
  type: 'DIRECTIONAL_VALVE_4_3',
  name: '4/3 Directional Valve',
  category: 'valves',
  description: '4-way 3-position directional control valve',
  icon: '🔀',
  width: 80,
  height: 60,
  terminals: [
    { id: 'P', type: TerminalTypes.PRESSURE_IN, x: 0, y: 20 },
    { id: 'T', type: TerminalTypes.RETURN, x: 0, y: 40 },
    { id: 'A', type: TerminalTypes.PRESSURE_OUT, x: 80, y: 20 },
    { id: 'B', type: TerminalTypes.PRESSURE_OUT, x: 80, y: 40 }
  ],
  defaultProperties: {
    spoolType: { value: 'closed-center', options: ['open-center', 'closed-center', 'tandem', 'float'] },
    actuation: { value: 'solenoid', options: ['manual', 'solenoid', 'hydraulic', 'pneumatic'] },
    maxFlow: { value: 100, unit: 'L/min', min: 10, max: 500 },
    maxPressure: { value: 315, unit: 'bar', min: 50, max: 350 }
  },
  defaultState: {
    position: 0, // -1, 0, 1
    solenoidA: false,
    solenoidB: false
  }
});

export const DIRECTIONAL_VALVE_3_2 = createComponent({
  type: 'DIRECTIONAL_VALVE_3_2',
  name: '3/2 Directional Valve',
  category: 'valves',
  description: '3-way 2-position directional control valve',
  icon: '↔️',
  width: 60,
  height: 40,
  terminals: [
    { id: 'P', type: TerminalTypes.PRESSURE_IN, x: 0, y: 20 },
    { id: 'T', type: TerminalTypes.RETURN, x: 0, y: 40 },
    { id: 'A', type: TerminalTypes.PRESSURE_OUT, x: 60, y: 30 }
  ],
  defaultProperties: {
    actuation: { value: 'solenoid', options: ['manual', 'solenoid', 'hydraulic'] },
    normallyOpen: { value: false, type: 'boolean' },
    maxFlow: { value: 50, unit: 'L/min', min: 5, max: 200 }
  },
  defaultState: {
    position: 0,
    solenoid: false
  }
});

export const CHECK_VALVE = createComponent({
  type: 'CHECK_VALVE',
  name: 'Check Valve',
  category: 'valves',
  description: 'One-way flow valve',
  icon: '➡️',
  width: 40,
  height: 30,
  terminals: [
    { id: 'in', type: TerminalTypes.PRESSURE_IN, x: 0, y: 15 },
    { id: 'out', type: TerminalTypes.PRESSURE_OUT, x: 40, y: 15 }
  ],
  defaultProperties: {
    crackingPressure: { value: 0.5, unit: 'bar', min: 0.1, max: 5 },
    maxFlow: { value: 100, unit: 'L/min', min: 10, max: 500 }
  },
  defaultState: {
    isOpen: false,
    currentFlow: 0
  }
});

export const PRESSURE_RELIEF_VALVE = createComponent({
  type: 'PRESSURE_RELIEF_VALVE',
  name: 'Pressure Relief Valve',
  category: 'valves',
  description: 'Safety valve to limit system pressure',
  icon: '🛡️',
  width: 50,
  height: 40,
  terminals: [
    { id: 'in', type: TerminalTypes.PRESSURE_IN, x: 0, y: 20 },
    { id: 'out', type: TerminalTypes.RETURN, x: 50, y: 20 }
  ],
  defaultProperties: {
    setPressure: { value: 200, unit: 'bar', min: 10, max: 350 },
    maxFlow: { value: 100, unit: 'L/min', min: 10, max: 500 },
    hysteresis: { value: 5, unit: '%', min: 1, max: 20 }
  },
  defaultState: {
    isOpen: false,
    currentFlow: 0
  }
});

export const PRESSURE_REDUCING_VALVE = createComponent({
  type: 'PRESSURE_REDUCING_VALVE',
  name: 'Pressure Reducing Valve',
  category: 'valves',
  description: 'Reduces and maintains downstream pressure',
  icon: '📉',
  width: 50,
  height: 40,
  terminals: [
    { id: 'in', type: TerminalTypes.PRESSURE_IN, x: 0, y: 20 },
    { id: 'out', type: TerminalTypes.PRESSURE_OUT, x: 50, y: 20 },
    { id: 'drain', type: TerminalTypes.DRAIN, x: 25, y: 40 }
  ],
  defaultProperties: {
    outletPressure: { value: 50, unit: 'bar', min: 5, max: 200 },
    maxFlow: { value: 50, unit: 'L/min', min: 5, max: 200 }
  },
  defaultState: {
    isOpen: true,
    currentOutletPressure: 50
  }
});

export const FLOW_CONTROL_VALVE = createComponent({
  type: 'FLOW_CONTROL_VALVE',
  name: 'Flow Control Valve',
  category: 'valves',
  description: 'Adjustable flow restrictor with pressure compensation',
  icon: '⚙️',
  width: 50,
  height: 40,
  terminals: [
    { id: 'in', type: TerminalTypes.PRESSURE_IN, x: 0, y: 20 },
    { id: 'out', type: TerminalTypes.PRESSURE_OUT, x: 50, y: 20 }
  ],
  defaultProperties: {
    setFlow: { value: 20, unit: 'L/min', min: 1, max: 100 },
    pressureCompensated: { value: true, type: 'boolean' },
    bidirectional: { value: false, type: 'boolean' }
  },
  defaultState: {
    currentFlow: 20,
    opening: 50
  }
});

export const SEQUENCE_VALVE = createComponent({
  type: 'SEQUENCE_VALVE',
  name: 'Sequence Valve',
  category: 'valves',
  description: 'Opens when inlet pressure reaches set value',
  icon: '📋',
  width: 50,
  height: 40,
  terminals: [
    { id: 'in', type: TerminalTypes.PRESSURE_IN, x: 0, y: 20 },
    { id: 'out', type: TerminalTypes.PRESSURE_OUT, x: 50, y: 20 },
    { id: 'drain', type: TerminalTypes.DRAIN, x: 25, y: 40 }
  ],
  defaultProperties: {
    setPressure: { value: 50, unit: 'bar', min: 5, max: 200 },
    maxFlow: { value: 50, unit: 'L/min', min: 5, max: 200 }
  },
  defaultState: {
    isOpen: false,
    currentPressure: 0
  }
});

export const COUNTERBALANCE_VALVE = createComponent({
  type: 'COUNTERBALANCE_VALVE',
  name: 'Counterbalance Valve',
  category: 'valves',
  description: 'Prevents load from falling due to gravity',
  icon: '⚖️',
  width: 50,
  height: 50,
  terminals: [
    { id: 'in', type: TerminalTypes.PRESSURE_IN, x: 0, y: 25 },
    { id: 'out', type: TerminalTypes.RETURN, x: 50, y: 25 },
    { id: 'pilot', type: TerminalTypes.PILOT, x: 25, y: 0 }
  ],
  defaultProperties: {
    setPressure: { value: 100, unit: 'bar', min: 10, max: 300 },
    pilotRatio: { value: 3, unit: '', min: 1, max: 10 },
    maxFlow: { value: 100, unit: 'L/min', min: 10, max: 300 }
  },
  defaultState: {
    isOpen: false,
    currentPressure: 0
  }
});

export const SHUTTLE_VALVE = createComponent({
  type: 'SHUTTLE_VALVE',
  name: 'Shuttle Valve',
  category: 'valves',
  description: 'OR logic valve - selects higher pressure',
  icon: '🔀',
  width: 50,
  height: 40,
  terminals: [
    { id: 'in1', type: TerminalTypes.PRESSURE_IN, x: 0, y: 10 },
    { id: 'in2', type: TerminalTypes.PRESSURE_IN, x: 0, y: 30 },
    { id: 'out', type: TerminalTypes.PRESSURE_OUT, x: 50, y: 20 }
  ],
  defaultProperties: {},
  defaultState: {
    selectedInput: null
  }
});

// ==================== ACTUATORS ====================

export const CYLINDER_DOUBLE = createComponent({
  type: 'CYLINDER_DOUBLE',
  name: 'Double-Acting Cylinder',
  category: 'actuators',
  description: 'Double-acting hydraulic cylinder',
  icon: '🔧',
  width: 100,
  height: 40,
  terminals: [
    { id: 'A', type: TerminalTypes.PRESSURE_IN, x: 0, y: 15 },
    { id: 'B', type: TerminalTypes.PRESSURE_IN, x: 0, y: 25 }
  ],
  defaultProperties: {
    bore: { value: 50, unit: 'mm', min: 10, max: 500 },
    rodDiameter: { value: 25, unit: 'mm', min: 5, max: 200 },
    stroke: { value: 200, unit: 'mm', min: 10, max: 2000 },
    cushionLength: { value: 20, unit: 'mm', min: 0, max: 100 }
  },
  defaultState: {
    position: 0,
    velocity: 0,
    force: 0,
    extending: true
  }
});

export const CYLINDER_SINGLE = createComponent({
  type: 'CYLINDER_SINGLE',
  name: 'Single-Acting Cylinder',
  category: 'actuators',
  description: 'Single-acting hydraulic cylinder with spring return',
  icon: '🔧↩️',
  width: 100,
  height: 40,
  terminals: [
    { id: 'A', type: TerminalTypes.PRESSURE_IN, x: 0, y: 20 }
  ],
  defaultProperties: {
    bore: { value: 50, unit: 'mm', min: 10, max: 500 },
    rodDiameter: { value: 25, unit: 'mm', min: 5, max: 200 },
    stroke: { value: 200, unit: 'mm', min: 10, max: 2000 },
    springForce: { value: 100, unit: 'N', min: 10, max: 5000 }
  },
  defaultState: {
    position: 0,
    velocity: 0,
    force: 0
  }
});

export const HYDRAULIC_MOTOR = createComponent({
  type: 'HYDRAULIC_MOTOR',
  name: 'Hydraulic Motor',
  category: 'actuators',
  description: 'Fixed displacement hydraulic motor',
  icon: '🔄',
  width: 60,
  height: 50,
  terminals: [
    { id: 'A', type: TerminalTypes.PRESSURE_IN, x: 0, y: 15 },
    { id: 'B', type: TerminalTypes.RETURN, x: 0, y: 35 },
    { id: 'drain', type: TerminalTypes.DRAIN, x: 30, y: 50 }
  ],
  defaultProperties: {
    displacement: { value: 50, unit: 'cm³/rev', min: 5, max: 500 },
    maxSpeed: { value: 3000, unit: 'rpm', min: 100, max: 6000 },
    efficiency: { value: 0.9, unit: '', min: 0.5, max: 1 },
    inertia: { value: 0.01, unit: 'kg·m²', min: 0.001, max: 1 }
  },
  defaultState: {
    speed: 0,
    torque: 0,
    direction: 1
  }
});

export const HYDRAULIC_MOTOR_VARIABLE = createComponent({
  type: 'HYDRAULIC_MOTOR_VARIABLE',
  name: 'Variable Motor',
  category: 'actuators',
  description: 'Variable displacement hydraulic motor',
  icon: '🔄🔧',
  width: 70,
  height: 50,
  terminals: [
    { id: 'A', type: TerminalTypes.PRESSURE_IN, x: 0, y: 15 },
    { id: 'B', type: TerminalTypes.RETURN, x: 0, y: 35 },
    { id: 'drain', type: TerminalTypes.DRAIN, x: 35, y: 50 },
    { id: 'control', type: TerminalTypes.CONTROL, x: 35, y: 0 }
  ],
  defaultProperties: {
    maxDisplacement: { value: 100, unit: 'cm³/rev', min: 10, max: 500 },
    minDisplacement: { value: 20, unit: 'cm³/rev', min: 5, max: 100 },
    maxSpeed: { value: 3000, unit: 'rpm', min: 100, max: 6000 },
    efficiency: { value: 0.92, unit: '', min: 0.5, max: 1 }
  },
  defaultState: {
    displacement: 100,
    speed: 0,
    torque: 0
  }
});

// ==================== MEASUREMENT ====================

export const PRESSURE_GAUGE = createComponent({
  type: 'PRESSURE_GAUGE',
  name: 'Pressure Gauge',
  category: 'measurement',
  description: 'Pressure measurement indicator',
  icon: '📊',
  width: 30,
  height: 30,
  terminals: [
    { id: 'in', type: TerminalTypes.PRESSURE_IN, x: 15, y: 30 }
  ],
  defaultProperties: {
    range: { value: 250, unit: 'bar', min: 10, max: 600 },
    accuracy: { value: 1.6, unit: '%', min: 0.1, max: 5 }
  },
  defaultState: {
    pressure: 0
  }
});

export const FLOW_METER = createComponent({
  type: 'FLOW_METER',
  name: 'Flow Meter',
  category: 'measurement',
  description: 'Flow rate measurement',
  icon: '📈',
  width: 40,
  height: 30,
  terminals: [
    { id: 'in', type: TerminalTypes.PRESSURE_IN, x: 0, y: 15 },
    { id: 'out', type: TerminalTypes.PRESSURE_OUT, x: 40, y: 15 }
  ],
  defaultProperties: {
    range: { value: 100, unit: 'L/min', min: 10, max: 500 },
    accuracy: { value: 2, unit: '%', min: 0.5, max: 5 }
  },
  defaultState: {
    flow: 0,
    totalVolume: 0
  }
});

export const TEMPERATURE_SENSOR = createComponent({
  type: 'TEMPERATURE_SENSOR',
  name: 'Temperature Sensor',
  category: 'measurement',
  description: 'Fluid temperature measurement',
  icon: '🌡️',
  width: 30,
  height: 30,
  terminals: [
    { id: 'in', type: TerminalTypes.PRESSURE_IN, x: 15, y: 30 }
  ],
  defaultProperties: {
    range: { value: 100, unit: '°C', min: 0, max: 200 }
  },
  defaultState: {
    temperature: 25
  }
});

export const LEVEL_SWITCH = createComponent({
  type: 'LEVEL_SWITCH',
  name: 'Level Switch',
  category: 'measurement',
  description: 'Tank fluid level switch',
  icon: '📍',
  width: 30,
  height: 40,
  terminals: [
    { id: 'signal', type: TerminalTypes.CONTROL, x: 30, y: 20 }
  ],
  defaultProperties: {
    setLevel: { value: 20, unit: '%', min: 5, max: 95 },
    hysteresis: { value: 5, unit: '%', min: 1, max: 20 }
  },
  defaultState: {
    isActive: false
  }
});

export const PRESSURE_SWITCH = createComponent({
  type: 'PRESSURE_SWITCH',
  name: 'Pressure Switch',
  category: 'measurement',
  description: 'Pressure activated switch',
  icon: '🔔',
  width: 40,
  height: 40,
  terminals: [
    { id: 'in', type: TerminalTypes.PRESSURE_IN, x: 0, y: 20 },
    { id: 'signal', type: TerminalTypes.CONTROL, x: 40, y: 20 }
  ],
  defaultProperties: {
    setPressure: { value: 150, unit: 'bar', min: 10, max: 350 },
    hysteresis: { value: 5, unit: '%', min: 1, max: 20 }
  },
  defaultState: {
    isActive: false,
    currentPressure: 0
  }
});

// ==================== ACCESSORIES ====================

export const FILTER = createComponent({
  type: 'FILTER',
  name: 'Filter',
  category: 'accessories',
  description: 'Hydraulic fluid filter',
  icon: '🔲',
  width: 40,
  height: 50,
  terminals: [
    { id: 'in', type: TerminalTypes.PRESSURE_IN, x: 0, y: 25 },
    { id: 'out', type: TerminalTypes.PRESSURE_OUT, x: 40, y: 25 }
  ],
  defaultProperties: {
    filterRating: { value: 10, unit: 'μm', options: [3, 5, 10, 25, 50] },
    maxFlow: { value: 100, unit: 'L/min', min: 10, max: 500 },
    bypassPressure: { value: 3, unit: 'bar', min: 1, max: 10 }
  },
  defaultState: {
    clogging: 0,
    bypassOpen: false
  }
});

export const ACCUMULATOR = createComponent({
  type: 'ACCUMULATOR',
  name: 'Accumulator',
  category: 'accessories',
  description: 'Hydraulic accumulator for energy storage',
  icon: '🔋',
  width: 50,
  height: 70,
  terminals: [
    { id: 'in', type: TerminalTypes.PRESSURE_IN, x: 25, y: 70 }
  ],
  defaultProperties: {
    volume: { value: 10, unit: 'L', min: 0.5, max: 100 },
    preChargePressure: { value: 50, unit: 'bar', min: 10, max: 200 },
    type: { value: 'bladder', options: ['bladder', 'piston', 'diaphragm'] }
  },
  defaultState: {
    currentVolume: 0,
    currentPressure: 50
  }
});

export const COOLER = createComponent({
  type: 'COOLER',
  name: 'Oil Cooler',
  category: 'accessories',
  description: 'Hydraulic fluid cooler',
  icon: '❄️',
  width: 50,
  height: 40,
  terminals: [
    { id: 'in', type: TerminalTypes.PRESSURE_IN, x: 0, y: 20 },
    { id: 'out', type: TerminalTypes.PRESSURE_OUT, x: 50, y: 20 }
  ],
  defaultProperties: {
    coolingCapacity: { value: 5, unit: 'kW', min: 1, max: 50 },
    maxFlow: { value: 100, unit: 'L/min', min: 10, max: 500 }
  },
  defaultState: {
    inletTemp: 50,
    outletTemp: 40
  }
});

export const HEATER = createComponent({
  type: 'HEATER',
  name: 'Oil Heater',
  category: 'accessories',
  description: 'Hydraulic fluid heater',
  icon: '🔥',
  width: 40,
  height: 40,
  terminals: [
    { id: 'in', type: TerminalTypes.PRESSURE_IN, x: 0, y: 20 },
    { id: 'out', type: TerminalTypes.PRESSURE_OUT, x: 40, y: 20 }
  ],
  defaultProperties: {
    heatingCapacity: { value: 2, unit: 'kW', min: 0.5, max: 20 },
    setTemperature: { value: 40, unit: '°C', min: 20, max: 80 }
  },
  defaultState: {
    isActive: false,
    currentTemp: 25
  }
});

// ==================== PIPES & CONNECTIONS ====================

export const TEE = createComponent({
  type: 'TEE',
  name: 'T-Junction',
  category: 'connections',
  description: 'T-junction for pipe splitting',
  icon: '┳',
  width: 40,
  height: 40,
  terminals: [
    { id: 'A', type: TerminalTypes.PRESSURE_IN, x: 0, y: 20 },
    { id: 'B', type: TerminalTypes.PRESSURE_OUT, x: 40, y: 20 },
    { id: 'C', type: TerminalTypes.PRESSURE_OUT, x: 20, y: 40 }
  ],
  defaultProperties: {},
  defaultState: {}
});

export const CROSS = createComponent({
  type: 'CROSS',
  name: 'Cross Junction',
  category: 'connections',
  description: 'Cross junction for pipe connection',
  icon: '╋',
  width: 40,
  height: 40,
  terminals: [
    { id: 'A', type: TerminalTypes.PRESSURE_IN, x: 0, y: 20 },
    { id: 'B', type: TerminalTypes.PRESSURE_OUT, x: 40, y: 20 },
    { id: 'C', type: TerminalTypes.PRESSURE_OUT, x: 20, y: 0 },
    { id: 'D', type: TerminalTypes.PRESSURE_OUT, x: 20, y: 40 }
  ],
  defaultProperties: {},
  defaultState: {}
});

export const MANIFOLD = createComponent({
  type: 'MANIFOLD',
  name: 'Manifold',
  category: 'connections',
  description: 'Multi-port manifold block',
  icon: '▦',
  width: 60,
  height: 80,
  terminals: [
    { id: 'in', type: TerminalTypes.PRESSURE_IN, x: 0, y: 40 },
    { id: 'out1', type: TerminalTypes.PRESSURE_OUT, x: 60, y: 15 },
    { id: 'out2', type: TerminalTypes.PRESSURE_OUT, x: 60, y: 35 },
    { id: 'out3', type: TerminalTypes.PRESSURE_OUT, x: 60, y: 55 },
    { id: 'out4', type: TerminalTypes.PRESSURE_OUT, x: 60, y: 75 }
  ],
  defaultProperties: {
    ports: { value: 4, min: 2, max: 8 }
  },
  defaultState: {}
});

// ==================== COMPONENT CATEGORIES ====================

export const HYDRAULIC_CATEGORIES = [
  { id: 'sources', name: 'Sources', icon: '⚡', description: 'Pumps and pressure sources' },
  { id: 'valves', name: 'Valves', icon: '🔧', description: 'Control valves' },
  { id: 'actuators', name: 'Actuators', icon: '💪', description: 'Cylinders and motors' },
  { id: 'measurement', name: 'Measurement', icon: '📊', description: 'Sensors and gauges' },
  { id: 'accessories', name: 'Accessories', icon: '🔩', description: 'Filters, accumulators, etc.' },
  { id: 'connections', name: 'Connections', icon: '🔗', description: 'Junctions and manifolds' }
];

// ==================== ALL COMPONENTS ====================

export const HYDRAULIC_COMPONENTS = {
  // Sources
  PUMP,
  VARIABLE_DISPLACEMENT_PUMP,
  TANK,
  PRESSURE_SOURCE,
  
  // Valves
  DIRECTIONAL_VALVE_4_3,
  DIRECTIONAL_VALVE_3_2,
  CHECK_VALVE,
  PRESSURE_RELIEF_VALVE,
  PRESSURE_REDUCING_VALVE,
  FLOW_CONTROL_VALVE,
  SEQUENCE_VALVE,
  COUNTERBALANCE_VALVE,
  SHUTTLE_VALVE,
  
  // Actuators
  CYLINDER_DOUBLE,
  CYLINDER_SINGLE,
  HYDRAULIC_MOTOR,
  HYDRAULIC_MOTOR_VARIABLE,
  
  // Measurement
  PRESSURE_GAUGE,
  FLOW_METER,
  TEMPERATURE_SENSOR,
  LEVEL_SWITCH,
  PRESSURE_SWITCH,
  
  // Accessories
  FILTER,
  ACCUMULATOR,
  COOLER,
  HEATER,
  
  // Connections
  TEE,
  CROSS,
  MANIFOLD
};

// Get components by category
export const getComponentsByCategory = (categoryId) => {
  return Object.values(HYDRAULIC_COMPONENTS).filter(c => c.category === categoryId);
};

// Get component by type
export const getComponentByType = (type) => {
  return HYDRAULIC_COMPONENTS[type] || null;
};

// Create new component instance
export const createComponentInstance = (type, x = 0, y = 0) => {
  const template = HYDRAULIC_COMPONENTS[type];
  if (!template) return null;
  
  return {
    ...template,
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    x,
    y,
    properties: JSON.parse(JSON.stringify(template.defaultProperties || {})),
    state: JSON.parse(JSON.stringify(template.defaultState || {}))
  };
};

export default HYDRAULIC_COMPONENTS;
