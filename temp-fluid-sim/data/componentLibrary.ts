
import { CircuitComponent, ComponentType } from '../types';

export const componentLibrary: Omit<CircuitComponent, 'id' | 'position' | 'rotation' | 'state'>[] = [
  // =================================================================
  // Fluid Power Components
  // =================================================================

  // --- Sources & Conditioning ---
  {
    type: ComponentType.HydraulicPump,
    label: 'Hydraulic Pump',
    category: 'Fluid Power',
    brand: 'Generic',
    series: 'Fixed',
    parameters: {
      displacement: { label: 'Displacement', value: 10, unit: 'cc/rev', type: 'number' },
      speed: { label: 'Speed', value: 1500, unit: 'rpm', type: 'number' },
      pressure: { label: 'Max Pressure', value: 210, unit: 'bar', type: 'number' },
    },
    io: [
      { id: 'in', label: 'Inlet', position: { x: 50, y: 80 }, type: 'hydraulic' },
      { id: 'out', label: 'Outlet', position: { x: 50, y: 20 }, type: 'hydraulic' },
    ],
  },
  {
    type: ComponentType.Reservoir,
    label: 'Reservoir',
    category: 'Fluid Power',
    brand: 'Generic',
    series: 'Vented',
    parameters: {
      volume: { label: 'Volume', value: 100, unit: 'L', type: 'number' },
    },
    io: [
      { id: 'a', label: 'A', position: { x: 35, y: 10 }, type: 'hydraulic' },
      { id: 'b', label: 'B', position: { x: 65, y: 10 }, type: 'hydraulic' },
    ],
  },
  
  // --- Valves ---
  {
    type: ComponentType.PressureReliefValve,
    label: 'Relief Valve',
    category: 'Valves',
    brand: 'Generic',
    series: 'Direct Acting',
    parameters: {
      pressureSetting: { label: 'Pressure Setting', value: 100, unit: 'bar', type: 'number' },
    },
    io: [
      { id: 'in', label: 'Inlet', position: { x: 50, y: 80 }, type: 'hydraulic' },
      { id: 'out', label: 'Outlet', position: { x: 50, y: 20 }, type: 'hydraulic' },
    ],
  },
  {
    type: ComponentType.DirectionalControlValve,
    label: 'Directional Valve (4/3)',
    category: 'Valves',
    brand: 'Bosch Rexroth',
    series: '4WE6',
    parameters: {
      spoolType: { label: 'Spool Type', value: 'Tandem Center', type: 'select', options: ['Tandem Center', 'Open Center', 'Closed Center'] },
    },
    io: [
      // Hydraulic Ports
      { id: 'p', label: 'P', position: { x: 40, y: 75 }, type: 'hydraulic' },
      { id: 't', label: 'T', position: { x: 60, y: 75 }, type: 'hydraulic' },
      { id: 'a', label: 'A', position: { x: 40, y: 25 }, type: 'hydraulic' },
      { id: 'b', label: 'B', position: { x: 60, y: 25 }, type: 'hydraulic' },
      // Electrical Ports
      { id: 'sol_a', label: 'Sol A', position: { x: 15, y: 15 }, type: 'electric' },
      { id: 'sol_b', label: 'Sol B', position: { x: 85, y: 15 }, type: 'electric' },
    ],
  },
  {
    type: ComponentType.CheckValve,
    label: 'Check Valve',
    category: 'Valves',
    parameters: { crackingPressure: { label: 'Cracking Pressure', value: 0.5, unit: 'bar', type: 'number' } },
    io: [
        { id: 'in', label: 'In', position: { x: 20, y: 50 }, type: 'hydraulic' },
        { id: 'out', label: 'Out', position: { x: 80, y: 50 }, type: 'hydraulic' },
    ],
  },
  {
    type: ComponentType.PilotOperatedCheckValve,
    label: 'PO Check Valve',
    category: 'Valves',
    parameters: { 
        crackingPressure: { label: 'Cracking Pressure', value: 1, unit: 'bar', type: 'number' },
        pilotRatio: { label: 'Pilot Ratio', value: 3, unit: ':1', type: 'number' },
    },
    io: [
        { id: 'in', label: 'In', position: { x: 20, y: 50 }, type: 'hydraulic' },
        { id: 'out', label: 'Out', position: { x: 80, y: 50 }, type: 'hydraulic' },
        { id: 'pilot', label: 'Pilot', position: { x: 50, y: 90 }, type: 'pilot' },
    ],
  },
  {
    type: ComponentType.FlowControlValve,
    label: 'Flow Control Valve',
    category: 'Valves',
    parameters: { 
        maxFlow: { label: 'Max Flow', value: 50, unit: 'L/min', type: 'number' },
        setting: { label: 'Setting', value: 50, unit: '%', type: 'number' },
    },
    io: [
        { id: 'in', label: 'In', position: { x: 20, y: 50 }, type: 'hydraulic' },
        { id: 'out', label: 'Out', position: { x: 80, y: 50 }, type: 'hydraulic' },
    ],
  },
  {
    type: ComponentType.PressureReducingValve,
    label: 'Pressure Reducing Valve',
    category: 'Valves',
    parameters: { 
        pressureSetting: { label: 'Pressure Setting', value: 50, unit: 'bar', type: 'number' },
        maxFlow: { label: 'Max Flow', value: 100, unit: 'L/min', type: 'number' },
    },
    io: [
        { id: 'in', label: 'In', position: { x: 20, y: 50 }, type: 'hydraulic' },
        { id: 'out', label: 'Out', position: { x: 80, y: 50 }, type: 'hydraulic' },
    ],
  },
  
  // --- Actuators ---
  {
    type: ComponentType.DoubleActingCylinder,
    label: 'Double-Acting Cylinder',
    category: 'Actuators',
    brand: 'Festo',
    series: 'DSNU',
    parameters: {
      bore: { label: 'Bore Diameter', value: 50, unit: 'mm', type: 'select', options: ['32', '40', '50', '63', '80', '100', '125'] },
      rod: { label: 'Rod Diameter', value: 25, unit: 'mm', type: 'number' },
      stroke: { label: 'Stroke', value: 200, unit: 'mm', type: 'number' },
      load: { label: 'External Load', value: 100, unit: 'kg', type: 'number' },
    },
    io: [
      { id: 'a', label: 'Port A', position: { x: 15, y: 25 }, type: 'hydraulic' },
      { id: 'b', label: 'Port B', position: { x: 65, y: 25 }, type: 'hydraulic' },
    ],
  },
  {
    type: ComponentType.RotaryActuator,
    label: 'Rotary Actuator',
    category: 'Actuators',
    parameters: { 
        displacement: { label: 'Displacement', value: 50, unit: 'cc/rev', type: 'number' },
        maxTorque: { label: 'Max Torque', value: 100, unit: 'Nm', type: 'number' },
    },
    io: [
        { id: 'a', label: 'Port A', position: { x: 30, y: 80 }, type: 'hydraulic' },
        { id: 'b', label: 'Port B', position: { x: 70, y: 80 }, type: 'hydraulic' },
    ],
  },

  // --- Instruments & Fittings ---
  {
    type: ComponentType.ConnectionTee,
    label: 'T-Junction',
    category: 'Instruments',
    brand: 'Generic',
    series: '',
    parameters: {},
    io: [
      { id: 'a', label: 'A', position: { x: 50, y: 10 }, type: 'hydraulic' },
      { id: 'b', label: 'B', position: { x: 10, y: 50 }, type: 'hydraulic' },
      { id: 'c', label: 'C', position: { x: 90, y: 50 }, type: 'hydraulic' },
    ],
  },
   {
    type: ComponentType.PressureGauge,
    label: 'Pressure Gauge',
    category: 'Instruments',
    brand: 'Generic',
    series: '',
    parameters: {
        maxPressure: { label: 'Max Pressure', value: 400, unit: 'bar', type: 'number' },
    },
    io: [
      { id: 'in', label: 'In', position: { x: 50, y: 80 }, type: 'hydraulic' },
    ],
  },
  {
    type: ComponentType.FlowMeter,
    label: 'Flow Meter',
    category: 'Instruments',
    brand: 'Generic',
    series: '',
    parameters: {
        maxFlow: { label: 'Max Flow', value: 100, unit: 'L/min', type: 'number' },
    },
    io: [
      { id: 'in', label: 'In', position: { x: 20, y: 50 }, type: 'hydraulic' },
      { id: 'out', label: 'Out', position: { x: 80, y: 50 }, type: 'hydraulic' },
    ],
  },

  // =================================================================
  // Electrical Components
  // =================================================================
  
  // --- Power & Sources ---
  {
    type: ComponentType.DCSource,
    label: 'DC Source',
    category: 'Power & Sources',
    parameters: { voltage: { label: 'Voltage', value: 24, unit: 'V', type: 'number' } },
    io: [
        { id: 'pos', label: '+', position: { x: 50, y: 0 }, type: 'electric' },
        { id: 'neg', label: '-', position: { x: 50, y: 100 }, type: 'electric' },
    ],
  },
  {
    type: ComponentType.ACSource,
    label: 'AC 3-Phase',
    category: 'Power & Sources',
    parameters: { voltage: { label: 'Voltage', value: 480, unit: 'V', type: 'number' }, frequency: { label: 'Frequency', value: 60, unit: 'Hz', type: 'number' } },
    io: [
        { id: 'l1', label: 'L1', position: { x: 20, y: 0 }, type: 'electric' },
        { id: 'l2', label: 'L2', position: { x: 50, y: 0 }, type: 'electric' },
        { id: 'l3', label: 'L3', position: { x: 80, y: 0 }, type: 'electric' },
    ],
  },
  
  // --- Inputs & Controllers ---
  {
    type: ComponentType.Switch,
    label: 'Switch',
    category: 'Input',
    parameters: { state: { label: 'State', value: 'Open', type: 'select', options: ['Open', 'Closed'] } },
    io: [
        { id: 'in', label: 'In', position: { x: 0, y: 50 }, type: 'electric' },
        { id: 'out', label: 'Out', position: { x: 100, y: 50 }, type: 'electric' },
    ],
  },
  {
    type: ComponentType.PushButton,
    label: 'Push Button',
    category: 'Input',
    parameters: { normally: { label: 'Type', value: 'NO', type: 'select', options: ['NO', 'NC'] } },
    io: [
        { id: 'in', label: 'In', position: { x: 0, y: 50 }, type: 'electric' },
        { id: 'out', label: 'Out', position: { x: 100, y: 50 }, type: 'electric' },
    ],
  },
  {
    type: ComponentType.EStopButton,
    label: 'E-Stop Button',
    category: 'Input',
    parameters: { channels: { label: 'Channels', value: 'Dual NC', type: 'select', options: ['Dual NC'] } },
    io: [
        { id: 'in1', label: 'In 1', position: { x: 35, y: 70 }, type: 'electric' },
        { id: 'out1', label: 'Out 1', position: { x: 35, y: 90 }, type: 'electric' },
        { id: 'in2', label: 'In 2', position: { x: 65, y: 70 }, type: 'electric' },
        { id: 'out2', label: 'Out 2', position: { x: 65, y: 90 }, type: 'electric' },
    ],
  },
  {
    type: ComponentType.Joystick,
    label: 'Joystick',
    category: 'Input',
    parameters: {
        x_range: { label: 'X-Axis Range', value: '+/- 10V', type: 'string' },
        y_range: { label: 'Y-Axis Range', value: '+/- 10V', type: 'string' },
    },
    io: [
        { id: 'x_out', label: 'X', position: { x: 20, y: 20 }, type: 'electric' },
        { id: 'y_out', label: 'Y', position: { x: 80, y: 20 }, type: 'electric' },
        { id: 'com', label: 'COM', position: { x: 50, y: 90 }, type: 'electric' },
    ],
  },
  {
    type: ComponentType.FootPedal,
    label: 'Foot Pedal',
    category: 'Input',
    parameters: {
        output_range: { label: 'Output Range', value: '0-10V', type: 'string' },
    },
    io: [
        { id: 'out', label: 'Out', position: { x: 50, y: 20 }, type: 'electric' },
        { id: 'com', label: 'COM', position: { x: 50, y: 80 }, type: 'electric' },
    ],
  },
  
  // --- Loads & Outputs ---
  {
    type: ComponentType.Resistor,
    label: 'Resistor',
    category: 'Loads & Outputs',
    parameters: { resistance: { label: 'Resistance', value: 1000, unit: 'Ω', type: 'number' } },
    io: [
        { id: 'in', label: 'In', position: { x: 0, y: 50 }, type: 'electric' },
        { id: 'out', label: 'Out', position: { x: 100, y: 50 }, type: 'electric' },
    ],
  },
  {
    type: ComponentType.Lamp,
    label: 'Lamp',
    category: 'Loads & Outputs',
    parameters: { voltage: { label: 'Voltage', value: 24, unit: 'V', type: 'number' }, power: { label: 'Power', value: 5, unit: 'W', type: 'number' } },
    io: [
        { id: 'in', label: 'In', position: { x: 30, y: 100 }, type: 'electric' },
        { id: 'out', label: 'Out', position: { x: 70, y: 100 }, type: 'electric' },
    ],
  },
  {
    type: ComponentType.Motor,
    label: 'Motor',
    category: 'Loads & Outputs',
    parameters: { voltage: { label: 'Voltage', value: 480, unit: 'V', type: 'number' }, power: { label: 'Power', value: 1.5, unit: 'kW', type: 'number' } },
    io: [
        { id: 'l1', label: 'L1', position: { x: 30, y: 0 }, type: 'electric' },
        { id: 'l2', label: 'L2', position: { x: 50, y: 0 }, type: 'electric' },
        { id: 'l3', label: 'L3', position: { x: 70, y: 0 }, type: 'electric' },
    ],
  },
  {
    type: ComponentType.LED,
    label: 'LED',
    category: 'Loads & Outputs',
    parameters: { color: { label: 'Color', value: 'Red', type: 'select', options: ['Red', 'Green', 'Blue', 'Yellow'] } },
    io: [
        { id: 'in', label: 'A', position: { x: 50, y: 100 }, type: 'electric' },
        { id: 'out', label: 'K', position: { x: 50, y: 0 }, type: 'electric' },
    ],
  },
  
  // --- Control & Switching ---
  {
    type: ComponentType.RelayCoil,
    label: 'Relay Coil',
    category: 'Control & Switching',
    parameters: { voltage: { label: 'Voltage', value: 24, unit: 'V', type: 'number' }, tag: { label: 'Tag', value: 'K1', type: 'string' } },
    io: [
        { id: 'a1', label: 'A1', position: { x: 50, y: 0 }, type: 'electric' },
        { id: 'a2', label: 'A2', position: { x: 50, y: 100 }, type: 'electric' },
    ],
  },
  {
    type: ComponentType.ContactNO,
    label: 'Contact NO',
    category: 'Control & Switching',
    parameters: { tag: { label: 'Tag', value: 'K1', type: 'string' } },
    io: [
        { id: 'in', label: 'In', position: { x: 0, y: 50 }, type: 'electric' },
        { id: 'out', label: 'Out', position: { x: 100, y: 50 }, type: 'electric' },
    ],
  },
  {
    type: ComponentType.ContactNC,
    label: 'Contact NC',
    category: 'Control & Switching',
    parameters: { tag: { label: 'Tag', value: 'K1', type: 'string' } },
    io: [
        { id: 'in', label: 'In', position: { x: 0, y: 50 }, type: 'electric' },
        { id: 'out', label: 'Out', position: { x: 100, y: 50 }, type: 'electric' },
    ],
  },
];