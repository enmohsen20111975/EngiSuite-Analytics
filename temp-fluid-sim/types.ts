
export type UnitSystem = 'SI' | 'Imperial';

export interface Point {
  x: number;
  y: number;
}

export enum ComponentType {
  // Hydraulic
  HydraulicPump = 'HYDRAULIC_PUMP',
  Reservoir = 'RESERVOIR',
  PressureReliefValve = 'PRESSURE_RELIEF_VALVE',
  DirectionalControlValve = 'DIRECTIONAL_CONTROL_VALVE',
  DoubleActingCylinder = 'DOUBLE_ACTING_CYLINDER',
  RotaryActuator = 'ROTARY_ACTUATOR',
  
  // New Valves
  CheckValve = 'CHECK_VALVE',
  PilotOperatedCheckValve = 'PILOT_OPERATED_CHECK_VALVE',
  FlowControlValve = 'FLOW_CONTROL_VALVE', // Pressure compensated
  PressureReducingValve = 'PRESSURE_REDUCING_VALVE',

  // Pneumatic
  Compressor = 'COMPRESSOR',
  PneumaticCylinder = 'PNEUMATIC_CYLINDER',
  
  // Generic
  ConnectionTee = 'CONNECTION_TEE',
  PressureGauge = 'PRESSURE_GAUGE',
  FlowMeter = 'FLOW_METER',

  // Electrical
  DCSource = 'DC_SOURCE',
  ACSource = 'AC_SOURCE',
  Switch = 'SWITCH',
  PushButton = 'PUSH_BUTTON',
  EStopButton = 'ESTOP_BUTTON',
  Joystick = 'JOYSTICK',
  FootPedal = 'FOOT_PEDAL',
  Resistor = 'RESISTOR',
  Lamp = 'LAMP',
  Motor = 'MOTOR',
  LED = 'LED',
  RelayCoil = 'RELAY_COIL',
  Contactor = 'CONTACTOR',
  ContactNO = 'CONTACT_NO',
  ContactNC = 'CONTACT_NC',
}

export interface ComponentIO {
  id: string;
  label: string;
  position: Point; // Relative to component origin
  type?: 'hydraulic' | 'pneumatic' | 'electric' | 'pilot';
}

export interface ComponentParameter {
  label:string;
  value: number | string;
  unit?: string;
  type: 'number' | 'string' | 'select';
  options?: string[];
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  category: string;
  brand?: string;
  series?: string;
  label: string;
  position: Point;
  rotation: number; // In degrees
  parameters: Record<string, ComponentParameter>;
  io: ComponentIO[];
  // Dynamic state updated by the simulation
  state: {
      isPowered?: boolean;
      isEnergized?: boolean;
      [key: string]: any;
  };
}

export interface Connection {
  id: string;
  from: {
    componentId: string;
    ioId: string;
  };
  to: {
    componentId: string;
    ioId: string;
  };
  mediaType: 'hydraulic' | 'pneumatic' | 'electric' | 'pilot';
  vertices?: Point[];
  // Dynamic state updated by the simulation
  state?: {
      flowRate?: number;
      [key: string]: any;
  };
}

// --- PLC Logic Types ---
export interface LogicCondition {
    componentId: string;
    type: 'NO' | 'NC'; // Normally Open / Normally Closed contact logic
}
export interface LogicOutput {
    componentId: string; // ID of the RelayCoil to energize
}
export interface LadderRung {
    id: string;
    conditions: LogicCondition[];
    output: LogicOutput;
}
// ------------------------

export interface SimulationSettings {
  timestep: number; // in ms
  duration: number; // in s
  solver: 'Euler';
  environment: {
    temperature: number; // Celsius
    fluidViscosity: number; // cSt
    fluidDensity: number; // kg/m^3
    airHumidity?: number; // %
  };
}

export interface Circuit {
  id: string;
  name: string;
  unitSystem: UnitSystem;
  components: CircuitComponent[];
  connections: Connection[];
  simulationSettings: SimulationSettings;
  ladderLogic: LadderRung[];
}

// PLC Types
export interface PlcTag {
  id: string;
  name: string;
  type: 'bool' | 'int' | 'real';
  direction: 'input' | 'output';
}

export interface PlcMapping {
  componentId: string;
  paramKey: string;
  tagId: string;
}

export interface PlcInputMapping {
  componentId: string;
  stateKey: string; // e.g., 'isPressed', 'isClosed'
  tagId: string;
}