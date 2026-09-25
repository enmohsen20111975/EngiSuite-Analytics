export enum ComponentType {
  DCSource = 'DCSource',
  ACSource = 'ACSource',
  Resistor = 'Resistor',
  LED = 'LED',
  Switch = 'Switch',
  Junction = 'Junction',

  // Logic Gates
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
  NAND = 'NAND',
  NOR = 'NOR',
  XOR = 'XOR',
  
  // Industrial Components
  RelayCoil = 'RelayCoil',
  Contactor = 'Contactor',
  ContactorCoil = 'ContactorCoil',
  ContactNO = 'ContactNO',
  ContactNC = 'ContactNC',
  PushButton = 'PushButton',
  Lamp = 'Lamp',
  Motor = 'Motor',
  Fuse = 'Fuse',
  MCB = 'MCB', // Miniature Circuit Breaker
  MCCB = 'MCCB', // Molded Case Circuit Breaker
  ACB = 'ACB', // Air Circuit Breaker
  MotorProtector = 'MotorProtector',
  OverloadRelay = 'OverloadRelay',
  RCBO = 'RCBO',
  Transformer = 'Transformer',
  Ammeter = 'Ammeter',
  Voltmeter = 'Voltmeter',

  // Specialized Motors
  DCMotor = 'DCMotor',
  ServoMotor = 'ServoMotor',
  StepperMotor = 'StepperMotor',
  
  // PLC I/O
  PLCInput = 'PLCInput',
  PLCOutput = 'PLCOutput',
}

export interface ComponentProperties {
  // General
  label?: string;
  on?: boolean; // For switches, push buttons
  
  // Manufacturer Data
  brand?: string;
  model?: string;
  
  // Electrical Specs
  voltage?: number; // For sources, or rated voltage for loads
  phases?: 1 | 3; // For AC Sources
  // FIX: Added ratedVoltage property to match component database specs for motors.
  ratedVoltage?: number;
  resistance?: number;
  powerKW?: number;
  ratedCurrent?: number;
  powerFactor?: number;
  efficiency?: number;
  coilVoltage?: string; // e.g., "24V DC"
  contactsConfig?: string; // e.g., "3NO+1NC"
  residualCurrent?: number; // For RCBOs in mA
  inrushCurrentMultiplier?: number; // For motors
  numInputs?: number; // For logic gates

  // Transformer
  primaryVoltage?: number;
  secondaryVoltage?: number;
  powerKVA?: number;

  // Breaker
  tripCurve?: string;
  magneticMultiplier?: number;
  adjustableRange?: [number, number]; // For motor protectors
  // FIX: Add properties from component DB to fix type errors in AnalysisPanel.tsx
  magnetic_trip_current_multiplier?: [number, number];
  instant_trip_time_ms?: number;

  // Visual
  color?: string;

  // Linking & Mapping
  linkId?: string; // For linking relays/contactors to contacts
  ioAddress?: string; // For PLC I/O, e.g., "I0.0" or "Q0.1"

  // Live Simulation Data
  liveVoltage?: number;
  liveCurrent?: number;
  livePower?: number; // Real Power (W)
  liveApparentPower?: number; // Apparent Power (VA)
  liveReactivePower?: number; // Reactive Power (VAR)


  // Fault Simulation
  fault?: 'none' | 'open_circuit' | 'short_circuit';
  failureRate?: number; // Probability per simulation tick (e.g., 0.0001)
}

export interface Terminal {
  id: string;
  x: number;
  y: number;
  isInput?: boolean; 
  nodeId?: number; // Electrical node ID for simulation
}

export interface ComponentInstance {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  rotation?: number;
  properties: ComponentProperties;
  terminals: Terminal[];
  diagram: 'power' | 'control';
  // Transient state for simulation
  isEnergized?: boolean;
  isTripped?: boolean;
  motorState?: 'stopped' | 'starting' | 'running';
  startupTimer?: number; // Timestamp when motor started
  bouncingUntil?: number; // Timestamp until which the contact is bouncing
}

export enum WireMaterial {
    Copper = 'Copper',
    Aluminum = 'Aluminum',
}

export interface Wire {
  id:string;
  startComponentId: string;
  startTerminalId: string;
  endComponentId: string;
  endTerminalId: string;
  points?: Array<{x: number, y: number}>;
  diagram: 'power' | 'control';
  // Simulation state
  isEnergized?: boolean;
  liveVoltage?: number;
  liveCurrent?: number;
  // Physical properties
  length?: number; // meters
  size?: number; // mm^2
  material?: WireMaterial;
  resistance?: number; // Ohms, calculated for simulation
}

export interface PLCState {
    I: boolean[];
    Q: boolean[];
    M: boolean[];
}

export type LadderElementType = 'NO' | 'NC' | 'Coil';
export interface LadderElement {
    id: string;
    type: LadderElementType;
    address: string;
}

export interface LadderRung {
    id: string;
    // Network is an array of series elements.
    // A nested array represents a parallel branch.
    // e.g., [ NC, [NO, NO], Coil ] = --|/|--+--| |--+--()--
    //                             |       |
    //                             +--| |--+
    network: (LadderElement | LadderElement[])[];
}

// For the component database
export interface ComponentSpec {
  brand: string;
  model: string;
  [key: string]: any;
}

export interface ComponentDatabase {
  contactor: ComponentSpec[];
  motor: ComponentSpec[];
  mcb: ComponentSpec[];
  mccb: ComponentSpec[];
  acb: ComponentSpec[];
  motorProtector: ComponentSpec[];
  rcbo: ComponentSpec[];
}