
import { Circuit, ComponentType } from '../types';

export const sampleHydraulicCircuit: Circuit = {
  id: 'sample-plc-control-1',
  name: 'PLC Cylinder Control',
  unitSystem: 'SI',
  simulationSettings: {
    timestep: 50, // ms
    duration: 60, // s
    solver: 'Euler',
    environment: {
      temperature: 25, // Celsius
      fluidViscosity: 46, // cSt
      fluidDensity: 870, // kg/m^3
    },
  },
  ladderLogic: [
    {
      id: "rung_1",
      conditions: [{ componentId: "pb-1", type: "NO" }],
      output: { componentId: "relay-1" }
    }
  ],
  components: [
    // --- Electrical Control Circuit ---
    {
      id: 'dc-source-1',
      type: ComponentType.DCSource,
      label: '24V DC',
      category: 'Power & Sources',
      position: { x: 50, y: 50 },
      rotation: 0,
      parameters: { voltage: { label: 'Voltage', value: 24, unit: 'V', type: 'number' } },
      io: [
        { id: 'pos', label: '+', position: { x: 50, y: 0 }, type: 'electric' },
        { id: 'neg', label: '-', position: { x: 50, y: 100 }, type: 'electric' },
      ],
      state: { isPowered: true }
    },
    {
      id: 'pb-1',
      type: ComponentType.PushButton,
      label: 'Extend',
      category: 'Input',
      position: { x: 50, y: 150 },
      rotation: 0,
      parameters: { normally: { label: 'Type', value: 'NO', type: 'select', options: ['NO', 'NC'] } },
      io: [
        { id: 'in', label: 'In', position: { x: 0, y: 50 }, type: 'electric' },
        { id: 'out', label: 'Out', position: { x: 100, y: 50 }, type: 'electric' },
      ],
      state: { isPressed: false } // User interaction will toggle this
    },
    {
      id: 'relay-1',
      type: ComponentType.RelayCoil,
      label: 'CR1',
      category: 'Control & Switching',
      position: { x: 50, y: 250 },
      rotation: 0,
      parameters: { voltage: { label: 'Voltage', value: 24, unit: 'V', type: 'number' }, tag: { label: 'Tag', value: 'CR1', type: 'string' } },
      io: [
        { id: 'a1', label: 'A1', position: { x: 50, y: 0 }, type: 'electric' },
        { id: 'a2', label: 'A2', position: { x: 50, y: 100 }, type: 'electric' },
      ],
      state: { isEnergized: false }
    },
    {
      id: 'contact-1',
      type: ComponentType.ContactNO,
      label: 'CR1 NO',
      category: 'Control & Switching',
      position: { x: 200, y: 150 },
      rotation: 0,
      parameters: { tag: { label: 'Tag', value: 'CR1', type: 'string' } },
      io: [
        { id: 'in', label: 'In', position: { x: 0, y: 50 }, type: 'electric' },
        { id: 'out', label: 'Out', position: { x: 100, y: 50 }, type: 'electric' },
      ],
      state: { isClosed: false }
    },

    // --- Fluid Power Circuit ---
    {
      id: 'pump-1',
      type: ComponentType.HydraulicPump,
      label: 'Main Pump',
      category: 'Fluid Power',
      position: { x: 500, y: 400 },
      rotation: 0,
      parameters: {
        displacement: { label: 'Displacement', value: 10, unit: 'cc/rev', type: 'number' },
        speed: { label: 'Speed', value: 1500, unit: 'rpm', type: 'number' },
        pressure: { label: 'Max Pressure', value: 210, unit: 'bar', type: 'number' },
      },
      io: [
        { id: 'in', label: 'Inlet', position: { x: 50, y: 100 }, type: 'hydraulic' },
        { id: 'out', label: 'Outlet', position: { x: 50, y: 0 }, type: 'hydraulic' },
      ], 
      state: {}
    },
    {
      id: 'tank-1',
      type: ComponentType.Reservoir,
      label: 'Reservoir',
      category: 'Fluid Power',
      position: { x: 500, y: 500 },
      rotation: 0,
      parameters: {
        volume: { label: 'Volume', value: 100, unit: 'L', type: 'number' },
      },
      io: [
        { id: 'a', label: 'A', position: { x: 35, y: 0 }, type: 'hydraulic' },
        { id: 'b', label: 'B', position: { x: 65, y: 0 }, type: 'hydraulic' },
      ], 
      state: {}
    },
    {
      id: 'dcv-1',
      type: ComponentType.DirectionalControlValve,
      label: 'DCV',
      category: 'Fluid Power',
      position: { x: 650, y: 250 },
      rotation: 0,
      parameters: {
        spoolType: { label: 'Spool Type', value: 'Tandem Center', type: 'select', options: ['Tandem Center', 'Open Center', 'Closed Center'] },
      },
      io: [
        { id: 'p', label: 'P', position: { x: 40, y: 75 }, type: 'hydraulic' },
        { id: 't', label: 'T', position: { x: 60, y: 75 }, type: 'hydraulic' },
        { id: 'a', label: 'A', position: { x: 40, y: 25 }, type: 'hydraulic' },
        { id: 'b', label: 'B', position: { x: 60, y: 25 }, type: 'hydraulic' },
        { id: 'sol_a', label: 'Sol A', position: { x: 15, y: 15 }, type: 'electric' },
        { id: 'sol_b', label: 'Sol B', position: { x: 85, y: 15 }, type: 'electric' },
      ], 
      state: { position: 'center', solenoidA_isPowered: false, solenoidB_isPowered: false }
    },
    {
      id: 'cyl-1',
      type: ComponentType.DoubleActingCylinder,
      label: 'Actuator',
      category: 'Fluid Power',
      position: { x: 850, y: 250 },
      rotation: 0,
      parameters: {
        bore: { label: 'Bore Diameter', value: 50, unit: 'mm', type: 'number' },
        rod: { label: 'Rod Diameter', value: 25, unit: 'mm', type: 'number' },
        stroke: { label: 'Stroke', value: 200, unit: 'mm', type: 'number' },
        load: { label: 'External Load', value: 500, unit: 'kg', type: 'number' },
      },
      io: [
        { id: 'a', label: 'Port A', position: { x: 0, y: 50 }, type: 'hydraulic' },
        { id: 'b', label: 'Port B', position: { x: 65, y: 50 }, type: 'hydraulic' },
      ], 
      state: { position: 0, velocity: 0 }
    },
  ],
  connections: [
    // Electrical connections
    { id: 'conn-e1', from: { componentId: 'dc-source-1', ioId: 'pos' }, to: { componentId: 'pb-1', ioId: 'in' }, mediaType: 'electric' },
    { id: 'conn-e2', from: { componentId: 'pb-1', ioId: 'out' }, to: { componentId: 'relay-1', ioId: 'a1' }, mediaType: 'electric' },
    { id: 'conn-e3', from: { componentId: 'relay-1', ioId: 'a2' }, to: { componentId: 'dc-source-1', ioId: 'neg' }, mediaType: 'electric' },
    { id: 'conn-e4', from: { componentId: 'dc-source-1', ioId: 'pos' }, to: { componentId: 'contact-1', ioId: 'in' }, mediaType: 'electric' },
    { id: 'conn-e5', from: { componentId: 'contact-1', ioId: 'out' }, to: { componentId: 'dcv-1', ioId: 'sol_a' }, mediaType: 'electric' },

    // Hydraulic connections
    { id: 'conn-h1', from: { componentId: 'pump-1', ioId: 'out' }, to: { componentId: 'dcv-1', ioId: 'p' }, mediaType: 'hydraulic' },
    { id: 'conn-h2', from: { componentId: 'dcv-1', ioId: 'a' }, to: { componentId: 'cyl-1', ioId: 'a' }, mediaType: 'hydraulic' },
    { id: 'conn-h3', from: { componentId: 'dcv-1', ioId: 'b' }, to: { componentId: 'cyl-1', ioId: 'b' }, mediaType: 'hydraulic' },
    { id: 'conn-h4', from: { componentId: 'dcv-1', ioId: 't' }, to: { componentId: 'tank-1', ioId: 'a' }, mediaType: 'hydraulic' },
    { id: 'conn-h5', from: { componentId: 'pump-1', ioId: 'in' }, to: { componentId: 'tank-1', ioId: 'b' }, mediaType: 'hydraulic' },
  ],
};