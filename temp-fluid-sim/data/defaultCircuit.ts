import { Circuit, ComponentType } from '../types';

export const defaultCircuit: Circuit = {
  id: 'default-interactive-circuit-1',
  name: 'Basic Cylinder Actuation',
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
      id: 'dc-source-1', type: ComponentType.DCSource, label: '24V DC', category: 'Power & Sources',
      position: { x: 50, y: 50 }, rotation: 0, state: { isPowered: true },
      parameters: { voltage: { label: 'Voltage', value: 24, unit: 'V', type: 'number' } },
      io: [ { id: 'pos', label: '+', position: { x: 50, y: 0 }, type: 'electric' }, { id: 'neg', label: '-', position: { x: 50, y: 100 }, type: 'electric' } ],
    },
    {
      id: 'pb-1', type: ComponentType.PushButton, label: 'Extend', category: 'Input',
      position: { x: 50, y: 150 }, rotation: 0, state: { isPressed: false },
      parameters: { normally: { label: 'Type', value: 'NO', type: 'select', options: ['NO', 'NC'] } },
      io: [ { id: 'in', label: 'In', position: { x: 0, y: 50 }, type: 'electric' }, { id: 'out', label: 'Out', position: { x: 100, y: 50 }, type: 'electric' } ],
    },
    {
      id: 'relay-1', type: ComponentType.RelayCoil, label: 'CR1', category: 'Control & Switching',
      position: { x: 50, y: 250 }, rotation: 0, state: { isEnergized: false },
      parameters: { voltage: { label: 'Voltage', value: 24, unit: 'V', type: 'number' }, tag: { label: 'Tag', value: 'CR1', type: 'string' } },
      io: [ { id: 'a1', label: 'A1', position: { x: 50, y: 0 }, type: 'electric' }, { id: 'a2', label: 'A2', position: { x: 50, y: 100 }, type: 'electric' } ],
    },
    {
      id: 'contact-1', type: ComponentType.ContactNO, label: 'CR1 NO', category: 'Control & Switching',
      position: { x: 50, y: 350 }, rotation: 0, state: { isClosed: false },
      parameters: { tag: { label: 'Tag', value: 'CR1', type: 'string' } },
      io: [ { id: 'in', label: 'In', position: { x: 0, y: 50 }, type: 'electric' }, { id: 'out', label: 'Out', position: { x: 100, y: 50 }, type: 'electric' } ],
    },

    // --- Fluid Power Circuit ---
    {
      id: 'pump-1', type: ComponentType.HydraulicPump, label: 'Pump', category: 'Fluid Power',
      position: { x: 400, y: 400 }, rotation: 0, state: {},
      parameters: { displacement: { label: 'Displacement', value: 10, unit: 'cc/rev', type: 'number' }, speed: { label: 'Speed', value: 1500, unit: 'rpm', type: 'number' }, pressure: { label: 'Max Pressure', value: 210, unit: 'bar', type: 'number' }, },
      io: [ { id: 'in', label: 'Inlet', position: { x: 50, y: 80 }, type: 'hydraulic' }, { id: 'out', label: 'Outlet', position: { x: 50, y: 20 }, type: 'hydraulic' } ],
    },
    {
      id: 'tank-1', type: ComponentType.Reservoir, label: 'Reservoir', category: 'Fluid Power',
      position: { x: 400, y: 550 }, rotation: 0, state: {},
      parameters: { volume: { label: 'Volume', value: 100, unit: 'L', type: 'number' } },
      io: [ { id: 'a', label: 'A', position: { x: 35, y: 10 }, type: 'hydraulic' }, { id: 'b', label: 'B', position: { x: 65, y: 10 }, type: 'hydraulic' } ],
    },
    {
      id: 'dcv-1', type: ComponentType.DirectionalControlValve, label: 'DCV', category: 'Fluid Power',
      position: { x: 600, y: 200 }, rotation: 0, state: { position: 'center' },
      parameters: { spoolType: { label: 'Spool Type', value: 'Tandem Center', type: 'select', options: ['Tandem Center', 'Open Center', 'Closed Center'] }, },
      io: [ { id: 'p', label: 'P', position: { x: 40, y: 75 }, type: 'hydraulic' }, { id: 't', label: 'T', position: { x: 60, y: 75 }, type: 'hydraulic' }, { id: 'a', label: 'A', position: { x: 40, y: 25 }, type: 'hydraulic' }, { id: 'b', label: 'B', position: { x: 60, y: 25 }, type: 'hydraulic' }, { id: 'sol_a', label: 'Sol A', position: { x: 15, y: 15 }, type: 'electric' }, { id: 'sol_b', label: 'Sol B', position: { x: 85, y: 15 }, type: 'electric' }, ],
    },
    {
      id: 'cyl-1', type: ComponentType.DoubleActingCylinder, label: 'Actuator', category: 'Fluid Power',
      position: { x: 800, y: 200 }, rotation: 0, state: { position: 0, velocity: 0 },
      parameters: { bore: { label: 'Bore Diameter', value: 50, unit: 'mm', type: 'number' }, rod: { label: 'Rod Diameter', value: 25, unit: 'mm', type: 'number' }, stroke: { label: 'Stroke', value: 200, unit: 'mm', type: 'number' }, load: { label: 'External Load', value: 100, unit: 'kg', type: 'number' }, },
      io: [ { id: 'a', label: 'Port A', position: { x: 15, y: 25 }, type: 'hydraulic' }, { id: 'b', label: 'Port B', position: { x: 65, y: 25 }, type: 'hydraulic' }, ],
    },
  ],
  connections: [
    // Electrical
    { id: 'conn-e1', from: { componentId: 'dc-source-1', ioId: 'pos' }, to: { componentId: 'pb-1', ioId: 'in' }, mediaType: 'electric' },
    { id: 'conn-e2', from: { componentId: 'pb-1', ioId: 'out' }, to: { componentId: 'relay-1', ioId: 'a1' }, mediaType: 'electric' },
    { id: 'conn-e3', from: { componentId: 'relay-1', ioId: 'a2' }, to: { componentId: 'dc-source-1', ioId: 'neg' }, mediaType: 'electric' },
    { id: 'conn-e4', from: { componentId: 'dc-source-1', ioId: 'pos' }, to: { componentId: 'contact-1', ioId: 'in' }, mediaType: 'electric' },
    { id: 'conn-e5', from: { componentId: 'contact-1', ioId: 'out' }, to: { componentId: 'dcv-1', ioId: 'sol_a' }, mediaType: 'electric' },
    
    // Hydraulic
    { id: 'conn-h1', from: { componentId: 'pump-1', ioId: 'out' }, to: { componentId: 'dcv-1', ioId: 'p' }, mediaType: 'hydraulic' },
    { id: 'conn-h2', from: { componentId: 'dcv-1', ioId: 'a' }, to: { componentId: 'cyl-1', ioId: 'a' }, mediaType: 'hydraulic' },
    { id: 'conn-h3', from: { componentId: 'dcv-1', ioId: 'b' }, to: { componentId: 'cyl-1', ioId: 'b' }, mediaType: 'hydraulic' },
    { id: 'conn-h4', from: { componentId: 'dcv-1', ioId: 't' }, to: { componentId: 'tank-1', ioId: 'a' }, mediaType: 'hydraulic' },
    { id: 'conn-h5', from: { componentId: 'pump-1', ioId: 'in' }, to: { componentId: 'tank-1', ioId: 'b' }, mediaType: 'hydraulic' },
  ],
};