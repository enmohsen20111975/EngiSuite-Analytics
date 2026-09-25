/**
 * Industrial Electrical Component Definitions
 * Based on IEC 60617 standard symbols
 * 
 * Categories:
 * - Power Sources (Grid, Generator, Battery)
 * - Transformers (2-winding, 3-winding, Auto)
 * - Switchgear (Circuit Breakers, Disconnectors, Fuses)
 * - Rotating Machines (Motors, Generators)
 * - Protection (CTs, PTs, Relays)
 * - Measurement (Meters, Instruments)
 * - Power Electronics (Rectifiers, VFDs)
 * - Control (Contactors, Timers, PLCs)
 */

// Terminal types for electrical connections
export const TerminalTypes = {
  AC_PHASE_A: 'ac_phase_a',     // Red (R)
  AC_PHASE_B: 'ac_phase_b',     // Yellow (Y)
  AC_PHASE_C: 'ac_phase_c',     // Blue (B)
  NEUTRAL: 'neutral',           // Black (N)
  EARTH: 'earth',               // Green (G)
  DC_POSITIVE: 'dc_positive',   // Red
  DC_NEGATIVE: 'dc_negative',   // Black
  CONTROL: 'control',           // Control circuit
  SIGNAL: 'signal',             // Instrumentation signal
};

// Phase colors (IEC standard)
export const PhaseColors = {
  A: '#ff0000',      // Red - Phase A (L1)
  B: '#ffff00',      // Yellow - Phase B (L2)
  C: '#0000ff',      // Blue - Phase C (L3)
  N: '#000000',      // Black - Neutral
  E: '#00ff00',      // Green - Earth
  DC_P: '#ff0000',   // Red - DC Positive
  DC_N: '#000000',   // Black - DC Negative
};

// Component categories
export const ElectricalCategories = {
  POWER_SOURCES: 'Power Sources',
  TRANSFORMERS: 'Transformers',
  SWITCHGEAR: 'Switchgear',
  ROTATING_MACHINES: 'Rotating Machines',
  PROTECTION: 'Protection',
  MEASUREMENT: 'Measurement',
  POWER_ELECTRONICS: 'Power Electronics',
  CONTROL: 'Control & Automation',
  POWER_QUALITY: 'Power Quality',
  CONDUCTORS: 'Conductors',
};

// Base component factory
function createElectricalComponent(config) {
  return {
    type: config.type,
    name: config.name,
    category: config.category,
    description: config.description || '',
    symbol: config.symbol || config.type,
    terminals: config.terminals || [],
    defaultProperties: {
      id: '',
      position: { x: 0, y: 0 },
      rotation: 0,
      label: config.defaultLabel || config.type,
      ...config.defaultProperties
    },
    state: config.state || {},
    svgRenderer: config.svgRenderer || null,
    propertySchema: config.propertySchema || [],
    simulation: config.simulation || {},
  };
}

// ============================================
// POWER SOURCES
// ============================================

export const AC_VOLTAGE_SOURCE_1PH = createElectricalComponent({
  type: 'AC_SOURCE_1PH',
  name: 'AC Voltage Source (1-Phase)',
  category: ElectricalCategories.POWER_SOURCES,
  description: 'Single-phase AC voltage source',
  defaultLabel: 'Vs',
  terminals: [
    { id: 'phase', type: TerminalTypes.AC_PHASE_A, x: 0, y: 25 },
    { id: 'neutral', type: TerminalTypes.NEUTRAL, x: 0, y: 75 },
  ],
  defaultProperties: {
    voltage: { value: 230, unit: 'V', min: 0, max: 1000 },
    frequency: { value: 50, unit: 'Hz', min: 0, max: 400 },
    phase: { value: 0, unit: '°', min: 0, max: 360 },
    impedance: { value: 0.01, unit: 'Ω', min: 0, max: 100 },
  },
  svgRenderer: (ctx, props, state) => {
    const { position, rotation } = props;
    const { voltage = 0, frequency = 50 } = state;
    
    // Draw circle with sine wave inside
    ctx.save();
    ctx.translate(position.x + 25, position.y + 50);
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Circle
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Sine wave
    ctx.beginPath();
    for (let i = -15; i <= 15; i++) {
      const y = Math.sin((i / 15) * Math.PI * 2) * 10;
      if (i === -15) ctx.moveTo(i, y);
      else ctx.lineTo(i, y);
    }
    ctx.stroke();
    
    ctx.restore();
  },
  propertySchema: [
    { key: 'voltage', label: 'Voltage', type: 'number', unit: 'V' },
    { key: 'frequency', label: 'Frequency', type: 'number', unit: 'Hz' },
    { key: 'phase', label: 'Phase Angle', type: 'number', unit: '°' },
    { key: 'impedance', label: 'Source Impedance', type: 'number', unit: 'Ω' },
  ],
});

export const AC_VOLTAGE_SOURCE_3PH = createElectricalComponent({
  type: 'AC_SOURCE_3PH',
  name: 'AC Voltage Source (3-Phase)',
  category: ElectricalCategories.POWER_SOURCES,
  description: 'Three-phase AC voltage source (wye connection)',
  defaultLabel: 'Grid',
  terminals: [
    { id: 'a', type: TerminalTypes.AC_PHASE_A, x: 0, y: 20 },
    { id: 'b', type: TerminalTypes.AC_PHASE_B, x: 0, y: 50 },
    { id: 'c', type: TerminalTypes.AC_PHASE_C, x: 0, y: 80 },
    { id: 'n', type: TerminalTypes.NEUTRAL, x: 0, y: 110 },
  ],
  defaultProperties: {
    voltage: { value: 400, unit: 'V', min: 0, max: 33000 },  // Line-to-line
    frequency: { value: 50, unit: 'Hz', min: 0, max: 400 },
    phaseSequence: { value: 'ABC', options: ['ABC', 'ACB'] },
    shortCircuitMVA: { value: 500, unit: 'MVA', min: 1, max: 10000 },
    x_r_ratio: { value: 10, unit: '', min: 1, max: 50 },
  },
  propertySchema: [
    { key: 'voltage', label: 'Line Voltage', type: 'number', unit: 'V' },
    { key: 'frequency', label: 'Frequency', type: 'number', unit: 'Hz' },
    { key: 'phaseSequence', label: 'Phase Sequence', type: 'select', options: ['ABC', 'ACB'] },
    { key: 'shortCircuitMVA', label: 'Short Circuit MVA', type: 'number', unit: 'MVA' },
    { key: 'x_r_ratio', label: 'X/R Ratio', type: 'number', unit: '' },
  ],
});

export const DC_VOLTAGE_SOURCE = createElectricalComponent({
  type: 'DC_SOURCE',
  name: 'DC Voltage Source',
  category: ElectricalCategories.POWER_SOURCES,
  description: 'DC voltage source / Battery',
  defaultLabel: 'Bat',
  terminals: [
    { id: 'positive', type: TerminalTypes.DC_POSITIVE, x: 0, y: 25 },
    { id: 'negative', type: TerminalTypes.DC_NEGATIVE, x: 0, y: 75 },
  ],
  defaultProperties: {
    voltage: { value: 48, unit: 'V', min: 0, max: 1000 },
    capacity: { value: 100, unit: 'Ah', min: 0, max: 10000 },
    internalResistance: { value: 0.01, unit: 'Ω', min: 0, max: 10 },
  },
  propertySchema: [
    { key: 'voltage', label: 'Voltage', type: 'number', unit: 'V' },
    { key: 'capacity', label: 'Capacity', type: 'number', unit: 'Ah' },
    { key: 'internalResistance', label: 'Internal Resistance', type: 'number', unit: 'Ω' },
  ],
});

export const GENERATOR_SYNC = createElectricalComponent({
  type: 'GENERATOR_SYNC',
  name: 'Synchronous Generator',
  category: ElectricalCategories.POWER_SOURCES,
  description: 'Three-phase synchronous generator',
  defaultLabel: 'G',
  terminals: [
    { id: 'a', type: TerminalTypes.AC_PHASE_A, x: 0, y: 30 },
    { id: 'b', type: TerminalTypes.AC_PHASE_B, x: 0, y: 50 },
    { id: 'c', type: TerminalTypes.AC_PHASE_C, x: 0, y: 70 },
    { id: 'n', type: TerminalTypes.NEUTRAL, x: 0, y: 90 },
  ],
  defaultProperties: {
    ratedPower: { value: 1000, unit: 'kVA', min: 1, max: 100000 },
    ratedVoltage: { value: 11000, unit: 'V', min: 400, max: 33000 },
    frequency: { value: 50, unit: 'Hz', min: 50, max: 60 },
    powerFactor: { value: 0.8, unit: '', min: 0, max: 1 },
    xd: { value: 1.5, unit: 'pu', min: 0.5, max: 3 },  // Direct-axis reactance
    xq: { value: 1.0, unit: 'pu', min: 0.5, max: 2 },  // Quadrature-axis reactance
    inertia: { value: 5, unit: 's', min: 1, max: 20 },  // Inertia constant H
  },
  propertySchema: [
    { key: 'ratedPower', label: 'Rated Power', type: 'number', unit: 'kVA' },
    { key: 'ratedVoltage', label: 'Rated Voltage', type: 'number', unit: 'V' },
    { key: 'frequency', label: 'Frequency', type: 'number', unit: 'Hz' },
    { key: 'powerFactor', label: 'Power Factor', type: 'number', unit: '' },
    { key: 'xd', label: 'Xd (pu)', type: 'number', unit: 'pu' },
    { key: 'xq', label: 'Xq (pu)', type: 'number', unit: 'pu' },
    { key: 'inertia', label: 'Inertia Constant H', type: 'number', unit: 's' },
  ],
});

// ============================================
// TRANSFORMERS
// ============================================

export const TRANSFORMER_2W = createElectricalComponent({
  type: 'TRANSFORMER_2W',
  name: 'Two-Winding Transformer',
  category: ElectricalCategories.TRANSFORMERS,
  description: 'Standard two-winding transformer',
  defaultLabel: 'Trf',
  terminals: [
    // Primary (HV)
    { id: 'hv_a', type: TerminalTypes.AC_PHASE_A, x: 0, y: 20 },
    { id: 'hv_b', type: TerminalTypes.AC_PHASE_B, x: 0, y: 50 },
    { id: 'hv_c', type: TerminalTypes.AC_PHASE_C, x: 0, y: 80 },
    // Secondary (LV)
    { id: 'lv_a', type: TerminalTypes.AC_PHASE_A, x: 100, y: 20 },
    { id: 'lv_b', type: TerminalTypes.AC_PHASE_B, x: 100, y: 50 },
    { id: 'lv_c', type: TerminalTypes.AC_PHASE_C, x: 100, y: 80 },
    // Neutral
    { id: 'hv_n', type: TerminalTypes.NEUTRAL, x: 0, y: 100 },
    { id: 'lv_n', type: TerminalTypes.NEUTRAL, x: 100, y: 100 },
  ],
  defaultProperties: {
    ratedPower: { value: 1000, unit: 'kVA', min: 1, max: 100000 },
    primaryVoltage: { value: 11000, unit: 'V', min: 400, max: 132000 },
    secondaryVoltage: { value: 415, unit: 'V', min: 100, max: 33000 },
    impedance: { value: 6, unit: '%', min: 1, max: 20 },
    noLoadLosses: { value: 1, unit: 'kW', min: 0, max: 100 },
    loadLosses: { value: 10, unit: 'kW', min: 0, max: 500 },
    tapPosition: { value: 0, unit: '', min: -5, max: 5 },
    vectorGroup: { value: 'Dyn11', options: ['Dyn11', 'Yyn0', 'Yd11', 'Dd0'] },
  },
  propertySchema: [
    { key: 'ratedPower', label: 'Rated Power', type: 'number', unit: 'kVA' },
    { key: 'primaryVoltage', label: 'Primary Voltage', type: 'number', unit: 'V' },
    { key: 'secondaryVoltage', label: 'Secondary Voltage', type: 'number', unit: 'V' },
    { key: 'impedance', label: 'Impedance', type: 'number', unit: '%' },
    { key: 'noLoadLosses', label: 'No-Load Losses', type: 'number', unit: 'kW' },
    { key: 'loadLosses', label: 'Load Losses', type: 'number', unit: 'kW' },
    { key: 'tapPosition', label: 'Tap Position', type: 'number', unit: '' },
    { key: 'vectorGroup', label: 'Vector Group', type: 'select', options: ['Dyn11', 'Yyn0', 'Yd11', 'Dd0'] },
  ],
});

export const TRANSFORMER_3W = createElectricalComponent({
  type: 'TRANSFORMER_3W',
  name: 'Three-Winding Transformer',
  category: ElectricalCategories.TRANSFORMERS,
  description: 'Three-winding transformer with tertiary',
  defaultLabel: 'Trf3W',
  terminals: [
    { id: 'hv_a', type: TerminalTypes.AC_PHASE_A, x: 0, y: 20 },
    { id: 'hv_b', type: TerminalTypes.AC_PHASE_B, x: 0, y: 40 },
    { id: 'hv_c', type: TerminalTypes.AC_PHASE_C, x: 0, y: 60 },
    { id: 'mv_a', type: TerminalTypes.AC_PHASE_A, x: 80, y: 10 },
    { id: 'mv_b', type: TerminalTypes.AC_PHASE_B, x: 80, y: 30 },
    { id: 'mv_c', type: TerminalTypes.AC_PHASE_C, x: 80, y: 50 },
    { id: 'lv_a', type: TerminalTypes.AC_PHASE_A, x: 80, y: 70 },
    { id: 'lv_b', type: TerminalTypes.AC_PHASE_B, x: 80, y: 90 },
    { id: 'lv_c', type: TerminalTypes.AC_PHASE_C, x: 80, y: 110 },
  ],
  defaultProperties: {
    ratedPowerHV: { value: 50000, unit: 'kVA', min: 1, max: 500000 },
    ratedPowerMV: { value: 30000, unit: 'kVA', min: 1, max: 500000 },
    ratedPowerLV: { value: 20000, unit: 'kVA', min: 1, max: 500000 },
    voltageHV: { value: 132000, unit: 'V', min: 1000, max: 400000 },
    voltageMV: { value: 33000, unit: 'V', min: 1000, max: 132000 },
    voltageLV: { value: 11000, unit: 'V', min: 1000, max: 33000 },
  },
  propertySchema: [
    { key: 'ratedPowerHV', label: 'HV Power', type: 'number', unit: 'kVA' },
    { key: 'ratedPowerMV', label: 'MV Power', type: 'number', unit: 'kVA' },
    { key: 'ratedPowerLV', label: 'LV Power', type: 'number', unit: 'kVA' },
    { key: 'voltageHV', label: 'HV Voltage', type: 'number', unit: 'V' },
    { key: 'voltageMV', label: 'MV Voltage', type: 'number', unit: 'V' },
    { key: 'voltageLV', label: 'LV Voltage', type: 'number', unit: 'V' },
  ],
});

export const AUTO_TRANSFORMER = createElectricalComponent({
  type: 'AUTOTRANSFORMER',
  name: 'Auto-Transformer',
  category: ElectricalCategories.TRANSFORMERS,
  description: 'Auto-transformer / Variac',
  defaultLabel: 'AT',
  terminals: [
    { id: 'in_a', type: TerminalTypes.AC_PHASE_A, x: 0, y: 30 },
    { id: 'in_n', type: TerminalTypes.NEUTRAL, x: 0, y: 70 },
    { id: 'out_a', type: TerminalTypes.AC_PHASE_A, x: 80, y: 30 },
    { id: 'out_n', type: TerminalTypes.NEUTRAL, x: 80, y: 70 },
  ],
  defaultProperties: {
    ratedPower: { value: 100, unit: 'kVA', min: 1, max: 10000 },
    inputVoltage: { value: 400, unit: 'V', min: 100, max: 1000 },
    outputVoltage: { value: 380, unit: 'V', min: 0, max: 500 },
    tapRange: { value: 10, unit: '%', min: 0, max: 50 },
  },
  propertySchema: [
    { key: 'ratedPower', label: 'Rated Power', type: 'number', unit: 'kVA' },
    { key: 'inputVoltage', label: 'Input Voltage', type: 'number', unit: 'V' },
    { key: 'outputVoltage', label: 'Output Voltage', type: 'number', unit: 'V' },
    { key: 'tapRange', label: 'Tap Range', type: 'number', unit: '%' },
  ],
});

// ============================================
// SWITCHGEAR
// ============================================

export const CIRCUIT_BREAKER = createElectricalComponent({
  type: 'CIRCUIT_BREAKER',
  name: 'Circuit Breaker',
  category: ElectricalCategories.SWITCHGEAR,
  description: 'Generic circuit breaker',
  defaultLabel: 'CB',
  terminals: [
    { id: 'in_1', type: TerminalTypes.AC_PHASE_A, x: 0, y: 20 },
    { id: 'in_2', type: TerminalTypes.AC_PHASE_B, x: 0, y: 50 },
    { id: 'in_3', type: TerminalTypes.AC_PHASE_C, x: 0, y: 80 },
    { id: 'out_1', type: TerminalTypes.AC_PHASE_A, x: 60, y: 20 },
    { id: 'out_2', type: TerminalTypes.AC_PHASE_B, x: 60, y: 50 },
    { id: 'out_3', type: TerminalTypes.AC_PHASE_C, x: 60, y: 80 },
  ],
  defaultProperties: {
    ratedCurrent: { value: 630, unit: 'A', min: 16, max: 6300 },
    ratedVoltage: { value: 415, unit: 'V', min: 230, max: 40000 },
    breakingCapacity: { value: 50, unit: 'kA', min: 6, max: 100 },
    type: { value: 'ACB', options: ['MCB', 'MCCB', 'ACB', 'VCB', 'SF6'] },
    poles: { value: 3, options: [1, 2, 3, 4] },
  },
  state: {
    closed: false,
    tripped: false,
    locked: false,
  },
  propertySchema: [
    { key: 'ratedCurrent', label: 'Rated Current', type: 'number', unit: 'A' },
    { key: 'ratedVoltage', label: 'Rated Voltage', type: 'number', unit: 'V' },
    { key: 'breakingCapacity', label: 'Breaking Capacity', type: 'number', unit: 'kA' },
    { key: 'type', label: 'Type', type: 'select', options: ['MCB', 'MCCB', 'ACB', 'VCB', 'SF6'] },
    { key: 'poles', label: 'Poles', type: 'select', options: [1, 2, 3, 4] },
  ],
});

export const DISCONNECTOR = createElectricalComponent({
  type: 'DISCONNECTOR',
  name: 'Disconnector / Isolator',
  category: ElectricalCategories.SWITCHGEAR,
  description: 'Isolating switch for isolation during maintenance',
  defaultLabel: 'DS',
  terminals: [
    { id: 'in', type: TerminalTypes.AC_PHASE_A, x: 0, y: 30 },
    { id: 'out', type: TerminalTypes.AC_PHASE_A, x: 60, y: 30 },
  ],
  defaultProperties: {
    ratedCurrent: { value: 630, unit: 'A', min: 100, max: 4000 },
    ratedVoltage: { value: 11000, unit: 'V', min: 400, max: 145000 },
    type: { value: 'Horizontal', options: ['Horizontal', 'Vertical', 'Center-Break'] },
  },
  state: {
    closed: false,
    earthed: false,
  },
  propertySchema: [
    { key: 'ratedCurrent', label: 'Rated Current', type: 'number', unit: 'A' },
    { key: 'ratedVoltage', label: 'Rated Voltage', type: 'number', unit: 'V' },
    { key: 'type', label: 'Type', type: 'select', options: ['Horizontal', 'Vertical', 'Center-Break'] },
  ],
});

export const FUSE = createElectricalComponent({
  type: 'FUSE',
  name: 'Fuse',
  category: ElectricalCategories.SWITCHGEAR,
  description: 'Protective fuse',
  defaultLabel: 'F',
  terminals: [
    { id: 'in', type: TerminalTypes.AC_PHASE_A, x: 0, y: 30 },
    { id: 'out', type: TerminalTypes.AC_PHASE_A, x: 50, y: 30 },
  ],
  defaultProperties: {
    ratedCurrent: { value: 100, unit: 'A', min: 1, max: 1250 },
    ratedVoltage: { value: 415, unit: 'V', min: 230, max: 33000 },
    type: { value: 'HRC', options: ['HRC', 'Cartridge', 'Resettable'] },
    breakingCapacity: { value: 80, unit: 'kA', min: 6, max: 200 },
  },
  state: {
    blown: false,
  },
  propertySchema: [
    { key: 'ratedCurrent', label: 'Rated Current', type: 'number', unit: 'A' },
    { key: 'ratedVoltage', label: 'Rated Voltage', type: 'number', unit: 'V' },
    { key: 'type', label: 'Type', type: 'select', options: ['HRC', 'Cartridge', 'Resettable'] },
    { key: 'breakingCapacity', label: 'Breaking Capacity', type: 'number', unit: 'kA' },
  ],
});

export const CONTACTOR = createElectricalComponent({
  type: 'CONTACTOR',
  name: 'Contactor',
  category: ElectricalCategories.SWITCHGEAR,
  description: 'Electromagnetically operated switch',
  defaultLabel: 'K',
  terminals: [
    { id: 'l1_in', type: TerminalTypes.AC_PHASE_A, x: 0, y: 20 },
    { id: 'l2_in', type: TerminalTypes.AC_PHASE_B, x: 0, y: 40 },
    { id: 'l3_in', type: TerminalTypes.AC_PHASE_C, x: 0, y: 60 },
    { id: 't1_out', type: TerminalTypes.AC_PHASE_A, x: 60, y: 20 },
    { id: 't2_out', type: TerminalTypes.AC_PHASE_B, x: 60, y: 40 },
    { id: 't3_out', type: TerminalTypes.AC_PHASE_C, x: 60, y: 60 },
    { id: 'a1', type: TerminalTypes.CONTROL, x: 20, y: 0 },
    { id: 'a2', type: TerminalTypes.CONTROL, x: 40, y: 0 },
  ],
  defaultProperties: {
    ratedCurrent: { value: 100, unit: 'A', min: 6, max: 2000 },
    coilVoltage: { value: 230, unit: 'V', min: 24, max: 400 },
    poles: { value: 3, options: [1, 2, 3, 4] },
    auxiliaryContacts: { value: '1NO+1NC', options: ['1NO', '1NC', '1NO+1NC', '2NO+2NC'] },
  },
  state: {
    energized: false,
  },
  propertySchema: [
    { key: 'ratedCurrent', label: 'Rated Current', type: 'number', unit: 'A' },
    { key: 'coilVoltage', label: 'Coil Voltage', type: 'number', unit: 'V' },
    { key: 'poles', label: 'Poles', type: 'select', options: [1, 2, 3, 4] },
    { key: 'auxiliaryContacts', label: 'Aux Contacts', type: 'select', options: ['1NO', '1NC', '1NO+1NC', '2NO+2NC'] },
  ],
});

// ============================================
// ROTATING MACHINES
// ============================================

export const INDUCTION_MOTOR = createElectricalComponent({
  type: 'INDUCTION_MOTOR',
  name: 'Induction Motor (Squirrel Cage)',
  category: ElectricalCategories.ROTATING_MACHINES,
  description: 'Three-phase squirrel cage induction motor',
  defaultLabel: 'M',
  terminals: [
    { id: 'u', type: TerminalTypes.AC_PHASE_A, x: 0, y: 30 },
    { id: 'v', type: TerminalTypes.AC_PHASE_B, x: 0, y: 50 },
    { id: 'w', type: TerminalTypes.AC_PHASE_C, x: 0, y: 70 },
  ],
  defaultProperties: {
    ratedPower: { value: 132, unit: 'kW', min: 0.1, max: 10000 },
    ratedVoltage: { value: 415, unit: 'V', min: 230, max: 11000 },
    ratedSpeed: { value: 1480, unit: 'RPM', min: 500, max: 3600 },
    poles: { value: 4, options: [2, 4, 6, 8, 10, 12] },
    ratedPowerFactor: { value: 0.85, unit: '', min: 0.5, max: 1 },
    efficiency: { value: 94, unit: '%', min: 70, max: 99 },
    startingMethod: { value: 'DOL', options: ['DOL', 'Star-Delta', 'Soft Starter', 'VFD'] },
    inertia: { value: 10, unit: 'kg·m²', min: 0.1, max: 1000 },
  },
  state: {
    running: false,
    speed: 0,
    current: 0,
    torque: 0,
  },
  propertySchema: [
    { key: 'ratedPower', label: 'Rated Power', type: 'number', unit: 'kW' },
    { key: 'ratedVoltage', label: 'Rated Voltage', type: 'number', unit: 'V' },
    { key: 'ratedSpeed', label: 'Rated Speed', type: 'number', unit: 'RPM' },
    { key: 'poles', label: 'Poles', type: 'select', options: [2, 4, 6, 8, 10, 12] },
    { key: 'ratedPowerFactor', label: 'Power Factor', type: 'number', unit: '' },
    { key: 'efficiency', label: 'Efficiency', type: 'number', unit: '%' },
    { key: 'startingMethod', label: 'Starting Method', type: 'select', options: ['DOL', 'Star-Delta', 'Soft Starter', 'VFD'] },
    { key: 'inertia', label: 'Inertia', type: 'number', unit: 'kg·m²' },
  ],
});

export const SYNCHRONOUS_MOTOR = createElectricalComponent({
  type: 'SYNCHRONOUS_MOTOR',
  name: 'Synchronous Motor',
  category: ElectricalCategories.ROTATING_MACHINES,
  description: 'Three-phase synchronous motor with excitation',
  defaultLabel: 'SM',
  terminals: [
    { id: 'u', type: TerminalTypes.AC_PHASE_A, x: 0, y: 25 },
    { id: 'v', type: TerminalTypes.AC_PHASE_B, x: 0, y: 50 },
    { id: 'w', type: TerminalTypes.AC_PHASE_C, x: 0, y: 75 },
    { id: 'field+', type: TerminalTypes.DC_POSITIVE, x: 0, y: 100 },
    { id: 'field-', type: TerminalTypes.DC_NEGATIVE, x: 0, y: 120 },
  ],
  defaultProperties: {
    ratedPower: { value: 500, unit: 'kW', min: 10, max: 50000 },
    ratedVoltage: { value: 11000, unit: 'V', min: 400, max: 33000 },
    ratedSpeed: { value: 1500, unit: 'RPM', min: 100, max: 3600 },
    poles: { value: 4, options: [2, 4, 6, 8, 10, 12] },
    excitationVoltage: { value: 125, unit: 'V', min: 50, max: 500 },
    powerFactor: { value: 1.0, unit: '', min: 0.8, max: 1.0 },  // Leading
  },
  state: {
    running: false,
    speed: 0,
    excitationCurrent: 0,
  },
  propertySchema: [
    { key: 'ratedPower', label: 'Rated Power', type: 'number', unit: 'kW' },
    { key: 'ratedVoltage', label: 'Rated Voltage', type: 'number', unit: 'V' },
    { key: 'ratedSpeed', label: 'Rated Speed', type: 'number', unit: 'RPM' },
    { key: 'poles', label: 'Poles', type: 'select', options: [2, 4, 6, 8, 10, 12] },
    { key: 'excitationVoltage', label: 'Excitation Voltage', type: 'number', unit: 'V' },
    { key: 'powerFactor', label: 'Power Factor', type: 'number', unit: '' },
  ],
});

export const DC_MOTOR = createElectricalComponent({
  type: 'DC_MOTOR',
  name: 'DC Motor (Shunt)',
  category: ElectricalCategories.ROTATING_MACHINES,
  description: 'DC shunt wound motor',
  defaultLabel: 'DCM',
  terminals: [
    { id: 'arm+', type: TerminalTypes.DC_POSITIVE, x: 0, y: 25 },
    { id: 'arm-', type: TerminalTypes.DC_NEGATIVE, x: 0, y: 50 },
    { id: 'field+', type: TerminalTypes.DC_POSITIVE, x: 0, y: 75 },
    { id: 'field-', type: TerminalTypes.DC_NEGATIVE, x: 0, y: 100 },
  ],
  defaultProperties: {
    ratedPower: { value: 50, unit: 'kW', min: 0.1, max: 5000 },
    ratedVoltage: { value: 440, unit: 'V', min: 24, max: 1000 },
    ratedSpeed: { value: 1500, unit: 'RPM', min: 100, max: 3600 },
    fieldVoltage: { value: 220, unit: 'V', min: 24, max: 500 },
    type: { value: 'Shunt', options: ['Shunt', 'Series', 'Compound'] },
  },
  state: {
    running: false,
    speed: 0,
    armatureCurrent: 0,
  },
  propertySchema: [
    { key: 'ratedPower', label: 'Rated Power', type: 'number', unit: 'kW' },
    { key: 'ratedVoltage', label: 'Armature Voltage', type: 'number', unit: 'V' },
    { key: 'ratedSpeed', label: 'Rated Speed', type: 'number', unit: 'RPM' },
    { key: 'fieldVoltage', label: 'Field Voltage', type: 'number', unit: 'V' },
    { key: 'type', label: 'Type', type: 'select', options: ['Shunt', 'Series', 'Compound'] },
  ],
});

// ============================================
// PROTECTION
// ============================================

export const CURRENT_TRANSFORMER = createElectricalComponent({
  type: 'CT',
  name: 'Current Transformer',
  category: ElectricalCategories.PROTECTION,
  description: 'Current transformer for measurement/protection',
  defaultLabel: 'CT',
  terminals: [
    { id: 'p1', type: TerminalTypes.AC_PHASE_A, x: 0, y: 30 },
    { id: 'p2', type: TerminalTypes.AC_PHASE_A, x: 50, y: 30 },
    { id: 's1', type: TerminalTypes.SIGNAL, x: 25, y: 0 },
    { id: 's2', type: TerminalTypes.SIGNAL, x: 25, y: 60 },
  ],
  defaultProperties: {
    primaryCurrent: { value: 1000, unit: 'A', min: 50, max: 10000 },
    secondaryCurrent: { value: 5, unit: 'A', options: [1, 5] },
    accuracyClass: { value: '0.5', options: ['0.1', '0.2', '0.5', '1', '5P10', '5P20', '10P10'] },
    burden: { value: 15, unit: 'VA', min: 2.5, max: 60 },
  },
  propertySchema: [
    { key: 'primaryCurrent', label: 'Primary Current', type: 'number', unit: 'A' },
    { key: 'secondaryCurrent', label: 'Secondary Current', type: 'select', options: [1, 5] },
    { key: 'accuracyClass', label: 'Accuracy Class', type: 'select', options: ['0.1', '0.2', '0.5', '1', '5P10', '5P20', '10P10'] },
    { key: 'burden', label: 'Burden', type: 'number', unit: 'VA' },
  ],
});

export const VOLTAGE_TRANSFORMER = createElectricalComponent({
  type: 'VT',
  name: 'Voltage Transformer',
  category: ElectricalCategories.PROTECTION,
  description: 'Voltage transformer (PT) for measurement/protection',
  defaultLabel: 'VT',
  terminals: [
    { id: 'hv_a', type: TerminalTypes.AC_PHASE_A, x: 0, y: 20 },
    { id: 'hv_b', type: TerminalTypes.AC_PHASE_B, x: 0, y: 40 },
    { id: 'hv_c', type: TerminalTypes.AC_PHASE_C, x: 0, y: 60 },
    { id: 'lv_a', type: TerminalTypes.SIGNAL, x: 60, y: 20 },
    { id: 'lv_b', type: TerminalTypes.SIGNAL, x: 60, y: 40 },
    { id: 'lv_c', type: TerminalTypes.SIGNAL, x: 60, y: 60 },
  ],
  defaultProperties: {
    primaryVoltage: { value: 11000, unit: 'V', min: 400, max: 145000 },
    secondaryVoltage: { value: 110, unit: 'V', options: [63.5, 110, 220] },
    accuracyClass: { value: '0.5', options: ['0.1', '0.2', '0.5', '1', '3P', '6P'] },
    burden: { value: 50, unit: 'VA', min: 10, max: 500 },
  },
  propertySchema: [
    { key: 'primaryVoltage', label: 'Primary Voltage', type: 'number', unit: 'V' },
    { key: 'secondaryVoltage', label: 'Secondary Voltage', type: 'select', options: [63.5, 110, 220] },
    { key: 'accuracyClass', label: 'Accuracy Class', type: 'select', options: ['0.1', '0.2', '0.5', '1', '3P', '6P'] },
    { key: 'burden', label: 'Burden', type: 'number', unit: 'VA' },
  ],
});

export const OVERCURRENT_RELAY = createElectricalComponent({
  type: 'RELAY_OC',
  name: 'Overcurrent Relay',
  category: ElectricalCategories.PROTECTION,
  description: 'Inverse time overcurrent relay (51/50)',
  defaultLabel: '51',
  terminals: [
    { id: 'ct_in', type: TerminalTypes.SIGNAL, x: 0, y: 30 },
    { id: 'trip', type: TerminalTypes.CONTROL, x: 80, y: 30 },
    { id: 'aux_nc', type: TerminalTypes.CONTROL, x: 40, y: 0 },
    { id: 'aux_no', type: TerminalTypes.CONTROL, x: 40, y: 60 },
  ],
  defaultProperties: {
    pickupCurrent: { value: 1.0, unit: 'In', min: 0.5, max: 10 },
    timeDial: { value: 0.5, unit: '', min: 0.05, max: 10 },
    curveType: { value: 'IEC Normal Inverse', options: ['IEC Normal Inverse', 'IEC Very Inverse', 'IEC Extremely Inverse', 'IEEE Moderately Inverse', 'Definite Time'] },
    instantaneousPickup: { value: 10, unit: 'In', min: 2, max: 50 },
  },
  state: {
    tripped: false,
    pickup: false,
    timer: 0,
  },
  propertySchema: [
    { key: 'pickupCurrent', label: 'Pickup Current', type: 'number', unit: '×In' },
    { key: 'timeDial', label: 'Time Dial', type: 'number', unit: '' },
    { key: 'curveType', label: 'Curve Type', type: 'select', options: ['IEC Normal Inverse', 'IEC Very Inverse', 'IEC Extremely Inverse', 'IEEE Moderately Inverse', 'Definite Time'] },
    { key: 'instantaneousPickup', label: 'Inst. Pickup', type: 'number', unit: '×In' },
  ],
});

export const DIFFERENTIAL_RELAY = createElectricalComponent({
  type: 'RELAY_DIFF',
  name: 'Differential Relay',
  category: ElectricalCategories.PROTECTION,
  description: 'Percentage differential relay (87)',
  defaultLabel: '87',
  terminals: [
    { id: 'ct1_a', type: TerminalTypes.SIGNAL, x: 0, y: 20 },
    { id: 'ct1_b', type: TerminalTypes.SIGNAL, x: 0, y: 40 },
    { id: 'ct1_c', type: TerminalTypes.SIGNAL, x: 0, y: 60 },
    { id: 'ct2_a', type: TerminalTypes.SIGNAL, x: 0, y: 80 },
    { id: 'ct2_b', type: TerminalTypes.SIGNAL, x: 0, y: 100 },
    { id: 'ct2_c', type: TerminalTypes.SIGNAL, x: 0, y: 120 },
    { id: 'trip', type: TerminalTypes.CONTROL, x: 80, y: 60 },
  ],
  defaultProperties: {
    pickupCurrent: { value: 0.3, unit: 'In', min: 0.1, max: 1.0 },
    slope1: { value: 20, unit: '%', min: 10, max: 50 },
    slope2: { value: 50, unit: '%', min: 30, max: 100 },
    breakpoint: { value: 2.0, unit: 'In', min: 1, max: 5 },
    harmonicRestraint: { value: 15, unit: '%', min: 5, max: 30 },
  },
  state: {
    tripped: false,
    operateSignal: 0,
    restraintSignal: 0,
  },
  propertySchema: [
    { key: 'pickupCurrent', label: 'Pickup Current', type: 'number', unit: '×In' },
    { key: 'slope1', label: 'Slope 1', type: 'number', unit: '%' },
    { key: 'slope2', label: 'Slope 2', type: 'number', unit: '%' },
    { key: 'breakpoint', label: 'Breakpoint', type: 'number', unit: '×In' },
    { key: 'harmonicRestraint', label: '2nd Harm. Restraint', type: 'number', unit: '%' },
  ],
});

// ============================================
// MEASUREMENT
// ============================================

export const AMMETER = createElectricalComponent({
  type: 'AMMETER',
  name: 'Ammeter',
  category: ElectricalCategories.MEASUREMENT,
  description: 'AC Ammeter',
  defaultLabel: 'A',
  terminals: [
    { id: 'in', type: TerminalTypes.SIGNAL, x: 0, y: 30 },
    { id: 'out', type: TerminalTypes.SIGNAL, x: 60, y: 30 },
  ],
  defaultProperties: {
    range: { value: 100, unit: 'A', min: 1, max: 10000 },
    type: { value: 'Moving Iron', options: ['Moving Iron', 'Moving Coil', 'Digital'] },
  },
  state: {
    value: 0,
  },
  propertySchema: [
    { key: 'range', label: 'Range', type: 'number', unit: 'A' },
    { key: 'type', label: 'Type', type: 'select', options: ['Moving Iron', 'Moving Coil', 'Digital'] },
  ],
});

export const VOLTMETER = createElectricalComponent({
  type: 'VOLTMETER',
  name: 'Voltmeter',
  category: ElectricalCategories.MEASUREMENT,
  description: 'AC Voltmeter',
  defaultLabel: 'V',
  terminals: [
    { id: 'in', type: TerminalTypes.SIGNAL, x: 0, y: 30 },
    { id: 'com', type: TerminalTypes.NEUTRAL, x: 0, y: 60 },
  ],
  defaultProperties: {
    range: { value: 500, unit: 'V', min: 10, max: 15000 },
    type: { value: 'Moving Iron', options: ['Moving Iron', 'Moving Coil', 'Digital'] },
  },
  state: {
    value: 0,
  },
  propertySchema: [
    { key: 'range', label: 'Range', type: 'number', unit: 'V' },
    { key: 'type', label: 'Type', type: 'select', options: ['Moving Iron', 'Moving Coil', 'Digital'] },
  ],
});

export const WATTMETER = createElectricalComponent({
  type: 'WATTMETER',
  name: 'Wattmeter',
  category: ElectricalCategories.MEASUREMENT,
  description: 'Power meter (kW)',
  defaultLabel: 'W',
  terminals: [
    { id: 'v_in', type: TerminalTypes.SIGNAL, x: 0, y: 20 },
    { id: 'v_com', type: TerminalTypes.NEUTRAL, x: 0, y: 40 },
    { id: 'i_in', type: TerminalTypes.SIGNAL, x: 0, y: 60 },
    { id: 'i_out', type: TerminalTypes.SIGNAL, x: 0, y: 80 },
  ],
  defaultProperties: {
    range: { value: 1000, unit: 'kW', min: 1, max: 100000 },
    type: { value: 'Digital', options: ['Electrodynamometer', 'Digital'] },
  },
  state: {
    value: 0,
    reactivePower: 0,
    apparentPower: 0,
    powerFactor: 1,
  },
  propertySchema: [
    { key: 'range', label: 'Range', type: 'number', unit: 'kW' },
    { key: 'type', label: 'Type', type: 'select', options: ['Electrodynamometer', 'Digital'] },
  ],
});

export const POWER_FACTOR_METER = createElectricalComponent({
  type: 'PF_METER',
  name: 'Power Factor Meter',
  category: ElectricalCategories.MEASUREMENT,
  description: 'Power factor meter (cos phi)',
  defaultLabel: 'PF',
  terminals: [
    { id: 'v_a', type: TerminalTypes.AC_PHASE_A, x: 0, y: 20 },
    { id: 'v_b', type: TerminalTypes.AC_PHASE_B, x: 0, y: 40 },
    { id: 'v_c', type: TerminalTypes.AC_PHASE_C, x: 0, y: 60 },
    { id: 'i_in', type: TerminalTypes.SIGNAL, x: 0, y: 80 },
    { id: 'i_out', type: TerminalTypes.SIGNAL, x: 0, y: 100 },
  ],
  defaultProperties: {
    scale: { value: '0.5-1-0.5', options: ['0.5-1-0.5', '0-1', '0.8-1-0.5'] },
  },
  state: {
    value: 1.0,
    leading: false,
  },
  propertySchema: [
    { key: 'scale', label: 'Scale', type: 'select', options: ['0.5-1-0.5', '0-1', '0.8-1-0.5'] },
  ],
});

export const ENERGY_METER = createElectricalComponent({
  type: 'ENERGY_METER',
  name: 'Energy Meter',
  category: ElectricalCategories.MEASUREMENT,
  description: 'kWh meter for energy measurement',
  defaultLabel: 'kWh',
  terminals: [
    { id: 'a_in', type: TerminalTypes.AC_PHASE_A, x: 0, y: 20 },
    { id: 'b_in', type: TerminalTypes.AC_PHASE_B, x: 0, y: 40 },
    { id: 'c_in', type: TerminalTypes.AC_PHASE_C, x: 0, y: 60 },
    { id: 'n_in', type: TerminalTypes.NEUTRAL, x: 0, y: 80 },
    { id: 'a_out', type: TerminalTypes.AC_PHASE_A, x: 80, y: 20 },
    { id: 'b_out', type: TerminalTypes.AC_PHASE_B, x: 80, y: 40 },
    { id: 'c_out', type: TerminalTypes.AC_PHASE_C, x: 80, y: 60 },
    { id: 'n_out', type: TerminalTypes.NEUTRAL, x: 80, y: 80 },
  ],
  defaultProperties: {
    ctRatio: { value: 100, unit: 'A', min: 5, max: 10000 },
    ptRatio: { value: 1, unit: '', min: 1, max: 1000 },
    class: { value: '0.5S', options: ['0.2S', '0.5S', '1.0', '2.0'] },
  },
  state: {
    activeEnergy: 0,     // kWh
    reactiveEnergy: 0,   // kVArh
    demand: 0,           // kW
  },
  propertySchema: [
    { key: 'ctRatio', label: 'CT Ratio', type: 'number', unit: 'A' },
    { key: 'ptRatio', label: 'PT Ratio', type: 'number', unit: '' },
    { key: 'class', label: 'Accuracy Class', type: 'select', options: ['0.2S', '0.5S', '1.0', '2.0'] },
  ],
});

// ============================================
// POWER ELECTRONICS
// ============================================

export const RECTIFIER_6P = createElectricalComponent({
  type: 'RECTIFIER_6P',
  name: '6-Pulse Rectifier',
  category: ElectricalCategories.POWER_ELECTRONICS,
  description: 'Six-pulse diode rectifier bridge',
  defaultLabel: 'Rec',
  terminals: [
    { id: 'a', type: TerminalTypes.AC_PHASE_A, x: 0, y: 30 },
    { id: 'b', type: TerminalTypes.AC_PHASE_B, x: 0, y: 50 },
    { id: 'c', type: TerminalTypes.AC_PHASE_C, x: 0, y: 70 },
    { id: 'dc+', type: TerminalTypes.DC_POSITIVE, x: 80, y: 30 },
    { id: 'dc-', type: TerminalTypes.DC_NEGATIVE, x: 80, y: 70 },
  ],
  defaultProperties: {
    ratedCurrent: { value: 500, unit: 'A', min: 10, max: 10000 },
    acVoltage: { value: 415, unit: 'V', min: 100, max: 1000 },
    dcVoltage: { value: 560, unit: 'V', min: 100, max: 1500 },
  },
  state: {
    dcOutput: 0,
    ripple: 0,
  },
  propertySchema: [
    { key: 'ratedCurrent', label: 'Rated Current', type: 'number', unit: 'A' },
    { key: 'acVoltage', label: 'AC Voltage', type: 'number', unit: 'V' },
    { key: 'dcVoltage', label: 'DC Voltage', type: 'number', unit: 'V' },
  ],
});

export const VFD = createElectricalComponent({
  type: 'VFD',
  name: 'Variable Frequency Drive',
  category: ElectricalCategories.POWER_ELECTRONICS,
  description: 'AC variable frequency drive for motor control',
  defaultLabel: 'VFD',
  terminals: [
    { id: 'l1', type: TerminalTypes.AC_PHASE_A, x: 0, y: 20 },
    { id: 'l2', type: TerminalTypes.AC_PHASE_B, x: 0, y: 40 },
    { id: 'l3', type: TerminalTypes.AC_PHASE_C, x: 0, y: 60 },
    { id: 'u', type: TerminalTypes.AC_PHASE_A, x: 100, y: 20 },
    { id: 'v', type: TerminalTypes.AC_PHASE_B, x: 100, y: 40 },
    { id: 'w', type: TerminalTypes.AC_PHASE_C, x: 100, y: 60 },
    { id: 'ctrl', type: TerminalTypes.CONTROL, x: 50, y: 0 },
  ],
  defaultProperties: {
    ratedPower: { value: 132, unit: 'kW', min: 0.75, max: 10000 },
    inputVoltage: { value: 415, unit: 'V', min: 200, max: 690 },
    outputVoltage: { value: 415, unit: 'V', min: 0, max: 690 },
    maxFrequency: { value: 50, unit: 'Hz', min: 50, max: 400 },
    controlMode: { value: 'V/f', options: ['V/f', 'Vector', 'DTC'] },
    switchingFrequency: { value: 4, unit: 'kHz', min: 2, max: 16 },
  },
  state: {
    running: false,
    outputFrequency: 0,
    outputVoltage: 0,
    current: 0,
    speed: 0,
    torque: 0,
  },
  propertySchema: [
    { key: 'ratedPower', label: 'Rated Power', type: 'number', unit: 'kW' },
    { key: 'inputVoltage', label: 'Input Voltage', type: 'number', unit: 'V' },
    { key: 'outputVoltage', label: 'Max Output Voltage', type: 'number', unit: 'V' },
    { key: 'maxFrequency', label: 'Max Frequency', type: 'number', unit: 'Hz' },
    { key: 'controlMode', label: 'Control Mode', type: 'select', options: ['V/f', 'Vector', 'DTC'] },
    { key: 'switchingFrequency', label: 'Switching Freq.', type: 'number', unit: 'kHz' },
  ],
});

export const SOFT_STARTER = createElectricalComponent({
  type: 'SOFT_STARTER',
  name: 'Soft Starter',
  category: ElectricalCategories.POWER_ELECTRONICS,
  description: 'Motor soft starter with thyristor control',
  defaultLabel: 'SS',
  terminals: [
    { id: 'l1', type: TerminalTypes.AC_PHASE_A, x: 0, y: 20 },
    { id: 'l2', type: TerminalTypes.AC_PHASE_B, x: 0, y: 40 },
    { id: 'l3', type: TerminalTypes.AC_PHASE_C, x: 0, y: 60 },
    { id: 't1', type: TerminalTypes.AC_PHASE_A, x: 80, y: 20 },
    { id: 't2', type: TerminalTypes.AC_PHASE_B, x: 80, y: 40 },
    { id: 't3', type: TerminalTypes.AC_PHASE_C, x: 80, y: 60 },
  ],
  defaultProperties: {
    ratedPower: { value: 132, unit: 'kW', min: 1, max: 1000 },
    ratedVoltage: { value: 415, unit: 'V', min: 200, max: 690 },
    startVoltage: { value: 30, unit: '%', min: 10, max: 70 },
    startTime: { value: 10, unit: 's', min: 1, max: 60 },
    rampTime: { value: 15, unit: 's', min: 5, max: 120 },
    currentLimit: { value: 350, unit: '%', min: 200, max: 600 },
  },
  state: {
    running: false,
    starting: false,
    voltage: 0,
    current: 0,
  },
  propertySchema: [
    { key: 'ratedPower', label: 'Rated Power', type: 'number', unit: 'kW' },
    { key: 'ratedVoltage', label: 'Rated Voltage', type: 'number', unit: 'V' },
    { key: 'startVoltage', label: 'Start Voltage', type: 'number', unit: '%' },
    { key: 'startTime', label: 'Start Time', type: 'number', unit: 's' },
    { key: 'rampTime', label: 'Ramp Time', type: 'number', unit: 's' },
    { key: 'currentLimit', label: 'Current Limit', type: 'number', unit: '%' },
  ],
});

// ============================================
// CONTROL & AUTOMATION
// ============================================

export const PLC = createElectricalComponent({
  type: 'PLC',
  name: 'PLC I/O Module',
  category: ElectricalCategories.CONTROL,
  description: 'Programmable Logic Controller I/O block',
  defaultLabel: 'PLC',
  terminals: [
    // Inputs
    { id: 'i0', type: TerminalTypes.CONTROL, x: 0, y: 15 },
    { id: 'i1', type: TerminalTypes.CONTROL, x: 0, y: 30 },
    { id: 'i2', type: TerminalTypes.CONTROL, x: 0, y: 45 },
    { id: 'i3', type: TerminalTypes.CONTROL, x: 0, y: 60 },
    { id: 'com_i', type: TerminalTypes.CONTROL, x: 0, y: 75 },
    // Outputs
    { id: 'q0', type: TerminalTypes.CONTROL, x: 80, y: 15 },
    { id: 'q1', type: TerminalTypes.CONTROL, x: 80, y: 30 },
    { id: 'q2', type: TerminalTypes.CONTROL, x: 80, y: 45 },
    { id: 'q3', type: TerminalTypes.CONTROL, x: 80, y: 60 },
    { id: 'com_o', type: TerminalTypes.CONTROL, x: 80, y: 75 },
    // Power
    { id: 'v+', type: TerminalTypes.DC_POSITIVE, x: 40, y: 0 },
    { id: 'v-', type: TerminalTypes.DC_NEGATIVE, x: 40, y: 90 },
  ],
  defaultProperties: {
    inputs: { value: 4, options: [4, 8, 16, 32] },
    outputs: { value: 4, options: [4, 8, 16, 32] },
    supplyVoltage: { value: 24, unit: 'VDC', options: [24, 48, 110, 220] },
    inputType: { value: 'Digital', options: ['Digital', 'Analog'] },
    outputType: { value: 'Relay', options: ['Relay', 'Transistor', 'Triac'] },
  },
  state: {
    inputValues: [false, false, false, false],
    outputValues: [false, false, false, false],
  },
  propertySchema: [
    { key: 'inputs', label: 'Number of Inputs', type: 'select', options: [4, 8, 16, 32] },
    { key: 'outputs', label: 'Number of Outputs', type: 'select', options: [4, 8, 16, 32] },
    { key: 'supplyVoltage', label: 'Supply Voltage', type: 'select', options: [24, 48, 110, 220] },
    { key: 'inputType', label: 'Input Type', type: 'select', options: ['Digital', 'Analog'] },
    { key: 'outputType', label: 'Output Type', type: 'select', options: ['Relay', 'Transistor', 'Triac'] },
  ],
});

export const TIMER = createElectricalComponent({
  type: 'TIMER',
  name: 'Timer Relay',
  category: ElectricalCategories.CONTROL,
  description: 'ON/OFF delay timer relay',
  defaultLabel: 'KT',
  terminals: [
    { id: 'a1', type: TerminalTypes.CONTROL, x: 0, y: 20 },
    { id: 'a2', type: TerminalTypes.CONTROL, x: 0, y: 40 },
    { id: 'com', type: TerminalTypes.CONTROL, x: 60, y: 20 },
    { id: 'no', type: TerminalTypes.CONTROL, x: 60, y: 40 },
    { id: 'nc', type: TerminalTypes.CONTROL, x: 60, y: 60 },
  ],
  defaultProperties: {
    timeRange: { value: 10, unit: 's', min: 0.1, max: 9999 },
    function: { value: 'ON Delay', options: ['ON Delay', 'OFF Delay', 'One Shot', 'Flasher', 'Star-Delta'] },
    mode: { value: 'A', options: ['A', 'B', 'C', 'D', 'E'] },
  },
  state: {
    energized: false,
    timedOut: false,
    timer: 0,
  },
  propertySchema: [
    { key: 'timeRange', label: 'Time Setting', type: 'number', unit: 's' },
    { key: 'function', label: 'Function', type: 'select', options: ['ON Delay', 'OFF Delay', 'One Shot', 'Flasher', 'Star-Delta'] },
    { key: 'mode', label: 'Mode', type: 'select', options: ['A', 'B', 'C', 'D', 'E'] },
  ],
});

export const PUSHBUTTON = createElectricalComponent({
  type: 'PUSHBUTTON',
  name: 'Push Button',
  category: ElectricalCategories.CONTROL,
  description: 'Momentary push button',
  defaultLabel: 'PB',
  terminals: [
    { id: 'no_com', type: TerminalTypes.CONTROL, x: 0, y: 20 },
    { id: 'no', type: TerminalTypes.CONTROL, x: 40, y: 20 },
    { id: 'nc_com', type: TerminalTypes.CONTROL, x: 0, y: 50 },
    { id: 'nc', type: TerminalTypes.CONTROL, x: 40, y: 50 },
  ],
  defaultProperties: {
    color: { value: 'Green', options: ['Red', 'Green', 'Yellow', 'Blue', 'Black', 'White'] },
    contacts: { value: '1NO+1NC', options: ['1NO', '1NC', '1NO+1NC'] },
    momentary: { value: true, options: [true, false] },
  },
  state: {
    pressed: false,
  },
  propertySchema: [
    { key: 'color', label: 'Color', type: 'select', options: ['Red', 'Green', 'Yellow', 'Blue', 'Black', 'White'] },
    { key: 'contacts', label: 'Contacts', type: 'select', options: ['1NO', '1NC', '1NO+1NC'] },
    { key: 'momentary', label: 'Momentary', type: 'boolean' },
  ],
});

export const INDICATOR_LAMP = createElectricalComponent({
  type: 'LAMP',
  name: 'Indicator Lamp',
  category: ElectricalCategories.CONTROL,
  description: 'Signal lamp / indicator',
  defaultLabel: 'H',
  terminals: [
    { id: 'a1', type: TerminalTypes.CONTROL, x: 0, y: 30 },
    { id: 'a2', type: TerminalTypes.CONTROL, x: 0, y: 50 },
  ],
  defaultProperties: {
    color: { value: 'Red', options: ['Red', 'Green', 'Yellow', 'Blue', 'White', 'Amber'] },
    voltage: { value: 24, unit: 'V', options: [24, 48, 110, 230, 400] },
    type: { value: 'LED', options: ['LED', 'Incandescent', 'Neon'] },
  },
  state: {
    on: false,
  },
  propertySchema: [
    { key: 'color', label: 'Color', type: 'select', options: ['Red', 'Green', 'Yellow', 'Blue', 'White', 'Amber'] },
    { key: 'voltage', label: 'Voltage', type: 'select', options: [24, 48, 110, 230, 400] },
    { key: 'type', label: 'Type', type: 'select', options: ['LED', 'Incandescent', 'Neon'] },
  ],
});

// ============================================
// POWER QUALITY
// ============================================

export const CAPACITOR_BANK = createElectricalComponent({
  type: 'CAPACITOR_BANK',
  name: 'Capacitor Bank',
  category: ElectricalCategories.POWER_QUALITY,
  description: 'Power factor correction capacitor bank',
  defaultLabel: 'CAP',
  terminals: [
    { id: 'a', type: TerminalTypes.AC_PHASE_A, x: 0, y: 20 },
    { id: 'b', type: TerminalTypes.AC_PHASE_B, x: 0, y: 40 },
    { id: 'c', type: TerminalTypes.AC_PHASE_C, x: 0, y: 60 },
    { id: 'n', type: TerminalTypes.NEUTRAL, x: 0, y: 80 },
  ],
  defaultProperties: {
    reactivePower: { value: 100, unit: 'kVAr', min: 5, max: 10000 },
    ratedVoltage: { value: 415, unit: 'V', min: 230, max: 33000 },
    steps: { value: 4, options: [1, 2, 3, 4, 6, 8] },
    type: { value: 'Fixed', options: ['Fixed', 'Automatic', 'APFC'] },
  },
  state: {
    activeSteps: 0,
    reactivePower: 0,
  },
  propertySchema: [
    { key: 'reactivePower', label: 'Total Reactive Power', type: 'number', unit: 'kVAr' },
    { key: 'ratedVoltage', label: 'Rated Voltage', type: 'number', unit: 'V' },
    { key: 'steps', label: 'Number of Steps', type: 'select', options: [1, 2, 3, 4, 6, 8] },
    { key: 'type', label: 'Type', type: 'select', options: ['Fixed', 'Automatic', 'APFC'] },
  ],
});

export const REACTOR = createElectricalComponent({
  type: 'REACTOR',
  name: 'Current Limiting Reactor',
  category: ElectricalCategories.POWER_QUALITY,
  description: 'Air-core or iron-core reactor',
  defaultLabel: 'X',
  terminals: [
    { id: 'a_in', type: TerminalTypes.AC_PHASE_A, x: 0, y: 20 },
    { id: 'b_in', type: TerminalTypes.AC_PHASE_B, x: 0, y: 40 },
    { id: 'c_in', type: TerminalTypes.AC_PHASE_C, x: 0, y: 60 },
    { id: 'a_out', type: TerminalTypes.AC_PHASE_A, x: 60, y: 20 },
    { id: 'b_out', type: TerminalTypes.AC_PHASE_B, x: 60, y: 40 },
    { id: 'c_out', type: TerminalTypes.AC_PHASE_C, x: 60, y: 60 },
  ],
  defaultProperties: {
    reactance: { value: 10, unit: '%', min: 1, max: 50 },
    ratedCurrent: { value: 1000, unit: 'A', min: 100, max: 5000 },
    ratedVoltage: { value: 11000, unit: 'V', min: 1000, max: 145000 },
    type: { value: 'Air Core', options: ['Air Core', 'Iron Core', 'Dry Type'] },
  },
  propertySchema: [
    { key: 'reactance', label: 'Reactance', type: 'number', unit: '%' },
    { key: 'ratedCurrent', label: 'Rated Current', type: 'number', unit: 'A' },
    { key: 'ratedVoltage', label: 'Rated Voltage', type: 'number', unit: 'V' },
    { key: 'type', label: 'Type', type: 'select', options: ['Air Core', 'Iron Core', 'Dry Type'] },
  ],
});

// ============================================
// CONDUCTORS
// ============================================

export const BUSBAR = createElectricalComponent({
  type: 'BUSBAR',
  name: 'Busbar',
  category: ElectricalCategories.CONDUCTORS,
  description: 'Horizontal or vertical busbar',
  defaultLabel: 'BB',
  terminals: [
    { id: 'a', type: TerminalTypes.AC_PHASE_A, x: 0, y: 15 },
    { id: 'b', type: TerminalTypes.AC_PHASE_B, x: 0, y: 35 },
    { id: 'c', type: TerminalTypes.AC_PHASE_C, x: 0, y: 55 },
    { id: 'n', type: TerminalTypes.NEUTRAL, x: 0, y: 75 },
  ],
  defaultProperties: {
    ratedCurrent: { value: 2500, unit: 'A', min: 100, max: 10000 },
    ratedVoltage: { value: 415, unit: 'V', min: 230, max: 40000 },
    material: { value: 'Copper', options: ['Copper', 'Aluminum'] },
    orientation: { value: 'Horizontal', options: ['Horizontal', 'Vertical'] },
    length: { value: 1000, unit: 'mm', min: 100, max: 10000 },
  },
  propertySchema: [
    { key: 'ratedCurrent', label: 'Rated Current', type: 'number', unit: 'A' },
    { key: 'ratedVoltage', label: 'Rated Voltage', type: 'number', unit: 'V' },
    { key: 'material', label: 'Material', type: 'select', options: ['Copper', 'Aluminum'] },
    { key: 'orientation', label: 'Orientation', type: 'select', options: ['Horizontal', 'Vertical'] },
    { key: 'length', label: 'Length', type: 'number', unit: 'mm' },
  ],
});

export const CABLE = createElectricalComponent({
  type: 'CABLE',
  name: 'Cable',
  category: ElectricalCategories.CONDUCTORS,
  description: 'Power cable / conductor',
  defaultLabel: 'Cab',
  terminals: [
    { id: 'a_in', type: TerminalTypes.AC_PHASE_A, x: 0, y: 15 },
    { id: 'b_in', type: TerminalTypes.AC_PHASE_B, x: 0, y: 30 },
    { id: 'c_in', type: TerminalTypes.AC_PHASE_C, x: 0, y: 45 },
    { id: 'n_in', type: TerminalTypes.NEUTRAL, x: 0, y: 60 },
    { id: 'a_out', type: TerminalTypes.AC_PHASE_A, x: 100, y: 15 },
    { id: 'b_out', type: TerminalTypes.AC_PHASE_B, x: 100, y: 30 },
    { id: 'c_out', type: TerminalTypes.AC_PHASE_C, x: 100, y: 45 },
    { id: 'n_out', type: TerminalTypes.NEUTRAL, x: 100, y: 60 },
  ],
  defaultProperties: {
    crossSection: { value: 95, unit: 'mm²', options: [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400] },
    cores: { value: 4, options: [2, 3, 4, 5] },
    length: { value: 100, unit: 'm', min: 1, max: 10000 },
    insulation: { value: 'XLPE', options: ['PVC', 'XLPE', 'EPR', 'MI'] },
    voltageRating: { value: 0.6, unit: 'kV', options: [0.6, 1, 1.8, 3.6, 6, 11, 33] },
  },
  propertySchema: [
    { key: 'crossSection', label: 'Cross Section', type: 'select', options: [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400] },
    { key: 'cores', label: 'Cores', type: 'select', options: [2, 3, 4, 5] },
    { key: 'length', label: 'Length', type: 'number', unit: 'm' },
    { key: 'insulation', label: 'Insulation', type: 'select', options: ['PVC', 'XLPE', 'EPR', 'MI'] },
    { key: 'voltageRating', label: 'Voltage Rating', type: 'select', options: [0.6, 1, 1.8, 3.6, 6, 11, 33] },
  ],
});

export const LOAD = createElectricalComponent({
  type: 'LOAD',
  name: 'Generic Load',
  category: ElectricalCategories.POWER_SOURCES,
  description: 'Generic electrical load',
  defaultLabel: 'Load',
  terminals: [
    { id: 'a', type: TerminalTypes.AC_PHASE_A, x: 0, y: 20 },
    { id: 'b', type: TerminalTypes.AC_PHASE_B, x: 0, y: 40 },
    { id: 'c', type: TerminalTypes.AC_PHASE_C, x: 0, y: 60 },
    { id: 'n', type: TerminalTypes.NEUTRAL, x: 0, y: 80 },
  ],
  defaultProperties: {
    activePower: { value: 100, unit: 'kW', min: 0, max: 100000 },
    reactivePower: { value: 50, unit: 'kVAr', min: 0, max: 100000 },
    powerFactor: { value: 0.85, unit: '', min: 0.1, max: 1 },
    loadType: { value: 'Constant Power', options: ['Constant Power', 'Constant Current', 'Constant Impedance'] },
  },
  state: {
    currentA: 0,
    currentB: 0,
    currentC: 0,
  },
  propertySchema: [
    { key: 'activePower', label: 'Active Power', type: 'number', unit: 'kW' },
    { key: 'reactivePower', label: 'Reactive Power', type: 'number', unit: 'kVAr' },
    { key: 'powerFactor', label: 'Power Factor', type: 'number', unit: '' },
    { key: 'loadType', label: 'Load Type', type: 'select', options: ['Constant Power', 'Constant Current', 'Constant Impedance'] },
  ],
});

// ============================================
// EXPORT ALL COMPONENTS
// ============================================

export const ElectricalComponents = {
  // Power Sources
  AC_SOURCE_1PH: AC_VOLTAGE_SOURCE_1PH,
  AC_SOURCE_3PH: AC_VOLTAGE_SOURCE_3PH,
  DC_SOURCE: DC_VOLTAGE_SOURCE,
  GENERATOR_SYNC,
  LOAD,
  
  // Transformers
  TRANSFORMER_2W,
  TRANSFORMER_3W,
  AUTO_TRANSFORMER,
  
  // Switchgear
  CIRCUIT_BREAKER,
  DISCONNECTOR,
  FUSE,
  CONTACTOR,
  
  // Rotating Machines
  INDUCTION_MOTOR,
  SYNCHRONOUS_MOTOR,
  DC_MOTOR,
  
  // Protection
  CT: CURRENT_TRANSFORMER,
  VT: VOLTAGE_TRANSFORMER,
  RELAY_OC: OVERCURRENT_RELAY,
  RELAY_DIFF: DIFFERENTIAL_RELAY,
  
  // Measurement
  AMMETER,
  VOLTMETER,
  WATTMETER,
  PF_METER: POWER_FACTOR_METER,
  ENERGY_METER,
  
  // Power Electronics
  RECTIFIER_6P,
  VFD,
  SOFT_STARTER,
  
  // Control
  PLC,
  TIMER,
  PUSHBUTTON,
  LAMP: INDICATOR_LAMP,
  
  // Power Quality
  CAPACITOR_BANK,
  REACTOR,
  
  // Conductors
  BUSBAR,
  CABLE,
};

export default ElectricalComponents;
