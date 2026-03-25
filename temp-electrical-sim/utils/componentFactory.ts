import { ComponentType, ComponentInstance, Terminal } from '../types';
import { circuitBreakers } from '../Data/circuit_breakers';
import { motors } from '../Data/motors';

// FIX: Removed 'value' property as it is not defined in the Terminal interface.
const createTerminal = (id: string, x: number, y: number, isInput?: boolean): Terminal => ({
    id, x, y, isInput
});

export const createLogicGateTerminals = (numInputs: number): Terminal[] => {
    const terminals: Terminal[] = [];
    const height = 40;
    const verticalPadding = 5;
    const availableHeight = height - verticalPadding * 2; // 30
    
    // If only one input, center it
    if (numInputs === 1) {
        terminals.push(createTerminal(`in1`, -24, 0, true));
    } else if (numInputs > 1) {
        const spacing = availableHeight / (numInputs - 1);
        for (let i = 0; i < numInputs; i++) {
            // Distribute from -availableHeight/2 to +availableHeight/2
            const yPos = -(availableHeight / 2) + i * spacing;
            terminals.push(createTerminal(`in${i + 1}`, -24, yPos, true));
        }
    }

    terminals.push(createTerminal('out', 24, 0, false));
    return terminals;
};


const getDiagramForType = (type: ComponentType): 'power' | 'control' => {
  const powerTypes: ComponentType[] = [
    ComponentType.ACSource,
    ComponentType.Motor,
    ComponentType.Transformer,
    ComponentType.Contactor,
    ComponentType.DCMotor,
    ComponentType.ServoMotor,
    ComponentType.StepperMotor,
    ComponentType.OverloadRelay,
  ];

  if (powerTypes.includes(type)) {
    return 'power';
  }
  return 'control';
};


export const createComponent = (type: ComponentType, x: number, y: number, diagramOverride?: 'power' | 'control'): ComponentInstance => {
  const diagram = diagramOverride || getDiagramForType(type);
  const baseComponent: Omit<ComponentInstance, 'properties' | 'terminals'> = {
    id: `${type}-${Date.now()}`,
    type,
    x,
    y,
    rotation: 0,
    isEnergized: false,
    isTripped: false,
    diagram,
  };

  const defaultFaultProps = { fault: 'none' as const, failureRate: 0.0001 };

  switch (type) {
    case ComponentType.DCSource:
      return { ...baseComponent, properties: { ...defaultFaultProps, voltage: 24 }, terminals: [createTerminal('t1', 0, -16), createTerminal('t2', 0, 16)] };
    case ComponentType.ACSource:
      return { ...baseComponent, properties: { ...defaultFaultProps, voltage: 400, phases: 3, label: "400V 3~" }, terminals: [createTerminal('L1', 0, -12), createTerminal('L2', -10, 6), createTerminal('L3', 10, 6)] };
    case ComponentType.Resistor:
      return { ...baseComponent, properties: { ...defaultFaultProps, resistance: 1000 }, terminals: [createTerminal('t1', -30, 0), createTerminal('t2', 30, 0)] };
    case ComponentType.LED:
      return { ...baseComponent, properties: { ...defaultFaultProps, color: '#ef4444', voltage: 2.2, ratedCurrent: 0.02 }, terminals: [createTerminal('t1', 0, -12, true), createTerminal('t2', 0, 12, false)] };
    case ComponentType.Switch:
      return { ...baseComponent, properties: { ...defaultFaultProps, on: false }, terminals: [createTerminal('t1', -20, 0), createTerminal('t2', 20, 0)] };
    case ComponentType.Junction:
      return { ...baseComponent, properties: { ...defaultFaultProps }, terminals: [createTerminal('t1', 0,0), createTerminal('t2', 0,0), createTerminal('t3', 0,0), createTerminal('t4', 0,0)]};
    case ComponentType.RelayCoil:
      return { ...baseComponent, properties: { ...defaultFaultProps, linkId: "K1" }, terminals: [createTerminal('A1', 0, -10, true), createTerminal('A2', 0, 10, true)] };
    case ComponentType.Contactor:
        return { ...baseComponent, diagram: 'power', properties: { ...defaultFaultProps, on: false, linkId: "KM1", brand: "Siemens", model: "3RT2015-1BB41" }, terminals: [
            createTerminal('1/L1', -20, -20), createTerminal('2/T1', -20, 20),
            createTerminal('3/L2', 0, -20),   createTerminal('4/T2', 0, 20),
            createTerminal('5/L3', 20, -20),  createTerminal('6/T3', 20, 20),
        ]};
    case ComponentType.ContactorCoil:
      return { ...baseComponent, diagram: 'control', properties: { ...defaultFaultProps, linkId: "KM1", coilVoltage: "24V DC" }, terminals: [createTerminal('A1', 0, -10, true), createTerminal('A2', 0, 10, true)] };
    case ComponentType.ContactNO:
      return { ...baseComponent, properties: { ...defaultFaultProps, linkId: "K1", on: false }, terminals: [createTerminal('t1', 0, -20), createTerminal('t2', 0, 20)] };
    case ComponentType.ContactNC:
      return { ...baseComponent, properties: { ...defaultFaultProps, linkId: "K1", on: true }, terminals: [createTerminal('t1', 0, -20), createTerminal('t2', 0, 20)] };
    case ComponentType.PushButton:
      return { ...baseComponent, properties: { ...defaultFaultProps, on: false }, terminals: [createTerminal('t1', -20, 8), createTerminal('t2', 20, 8)] };
    case ComponentType.Lamp:
      return { ...baseComponent, properties: { ...defaultFaultProps, color: "#f59e0b", voltage: 24, powerKW: 0.002 }, terminals: [createTerminal('t1', 0, -12, true), createTerminal('t2', 0, 12, true)] };
    case ComponentType.Motor:
      const defaultMotor = motors.find(m => m.category === "AC_Induction")!;
      return { ...baseComponent, motorState: 'stopped', properties: { ...defaultFaultProps, brand: defaultMotor.brand, model: defaultMotor.model, powerKW: defaultMotor.rated_power_kw, ratedCurrent: defaultMotor.rated_current_a, ratedVoltage: defaultMotor.rated_voltage_v, inrushCurrentMultiplier: 6 }, terminals: [createTerminal('U1', 0, -12), createTerminal('V1', -10, 6), createTerminal('W1', 10, 6)] };
    case ComponentType.Fuse:
        return { ...baseComponent, properties: { ...defaultFaultProps, failureRate: 0.0005, on: true, ratedCurrent: 10 }, terminals: [createTerminal('t1', -30, 0), createTerminal('t2', 30, 0)]};
    case ComponentType.MCB:
        const defaultMcb = circuitBreakers.find(cb => cb.type === "MCB")!;
        return { ...baseComponent, properties: { ...defaultFaultProps, on: true, brand: defaultMcb.brand, model: defaultMcb.model, ratedCurrent: defaultMcb.rated_current_a, ratedVoltage: defaultMcb.rated_voltage_v, tripCurve: defaultMcb.trip_curve_type, magneticMultiplier: defaultMcb.magnetic_trip_current_multiplier[0] }, terminals: [createTerminal('t1', -20, 0), createTerminal('t2', 20, 0)]};
    case ComponentType.MCCB:
        const defaultMccb = circuitBreakers.find(cb => cb.type === "MCCB")!;
        return { ...baseComponent, properties: { ...defaultFaultProps, on: true, brand: defaultMccb.brand, model: defaultMccb.model, ratedCurrent: defaultMccb.rated_current_a, ratedVoltage: defaultMccb.rated_voltage_v, tripCurve: defaultMccb.trip_curve_type, magneticMultiplier: defaultMccb.magnetic_trip_current_multiplier[0] }, terminals: [createTerminal('t1', -22, 0), createTerminal('t2', 22, 0)]};
    case ComponentType.ACB:
        const defaultAcb = circuitBreakers.find(cb => cb.type === "ACB")!;
        return { ...baseComponent, properties: { ...defaultFaultProps, on: true, brand: defaultAcb.brand, model: defaultAcb.model, ratedCurrent: defaultAcb.rated_current_a, ratedVoltage: defaultAcb.rated_voltage_v, tripCurve: defaultAcb.trip_curve_type, magneticMultiplier: defaultAcb.magnetic_trip_current_multiplier[0] }, terminals: [createTerminal('t1', -24, 0), createTerminal('t2', 24, 0)]};
    case ComponentType.MotorProtector:
        const defaultMpb = circuitBreakers.find(cb => cb.type === "Motor Protector")!;
        return { ...baseComponent, properties: { ...defaultFaultProps, on: true, brand: defaultMpb.brand, model: defaultMpb.model, ratedCurrent: defaultMpb.rated_current_a, ratedVoltage: defaultMpb.rated_voltage_v, tripCurve: (defaultMpb as any).trip_curve_type, magneticMultiplier: defaultMpb.magnetic_trip_current_multiplier[0] }, terminals: [createTerminal('t1', -20, 0), createTerminal('t2', 20, 0)]};
    case ComponentType.OverloadRelay:
        return { ...baseComponent, diagram: 'power', properties: { ...defaultFaultProps, on: true, linkId: "F3", ratedCurrent: 1 }, terminals: [
            createTerminal('L1', -20, 0), createTerminal('T1', -20, 20),
            createTerminal('L2', 0, 0),   createTerminal('T2', 0, 20),
            createTerminal('L3', 20, 0),  createTerminal('T3', 20, 20),
        ]};
    case ComponentType.RCBO:
        const defaultRcbo = circuitBreakers.find(cb => cb.type === "RCBO")!;
        return { ...baseComponent, properties: { ...defaultFaultProps, on: true, brand: defaultRcbo.brand, model: defaultRcbo.model, ratedCurrent: defaultRcbo.rated_current_a, ratedVoltage: defaultRcbo.rated_voltage_v, tripCurve: defaultRcbo.trip_curve_type, magneticMultiplier: defaultRcbo.magnetic_trip_current_multiplier[0], residualCurrent: (defaultRcbo as any).residual_current_ma }, terminals: [createTerminal('t1', -20, 0), createTerminal('t2', 20, 0)]};
    case ComponentType.Transformer:
      return { ...baseComponent, properties: { ...defaultFaultProps, primaryVoltage: 400, secondaryVoltage: 230, powerKVA: 10 }, terminals: [
          createTerminal('P1', -24, -15), createTerminal('P2', -24, 15), // Primary
          createTerminal('S1', 24, -15), createTerminal('S2', 24, 15)   // Secondary
      ]};
    case ComponentType.Ammeter:
        return { ...baseComponent, properties: { ...defaultFaultProps, liveCurrent: 0 }, terminals: [createTerminal('t1', -12, 0), createTerminal('t2', 12, 0)]};
    case ComponentType.Voltmeter:
        return { ...baseComponent, properties: { ...defaultFaultProps, liveVoltage: 0 }, terminals: [createTerminal('t1', 0, -12), createTerminal('t2', 0, 12)]};
    case ComponentType.DCMotor:
      const defaultDcMotor = motors.find(m => m.category === "DC_Motor")!;
      return { ...baseComponent, motorState: 'stopped', properties: { ...defaultFaultProps, brand: defaultDcMotor.brand, model: defaultDcMotor.model, powerKW: defaultDcMotor.rated_power_kw, ratedCurrent: defaultDcMotor.rated_current_a, ratedVoltage: defaultDcMotor.rated_voltage_v, inrushCurrentMultiplier: 4 }, terminals: [createTerminal('A1', -12, 0), createTerminal('A2', 12, 0)] };
    case ComponentType.ServoMotor:
      const defaultServo = motors.find(m => m.category === "Servo_Motor")!;
      return { ...baseComponent, motorState: 'stopped', properties: { ...defaultFaultProps, brand: defaultServo.brand, model: defaultServo.model, powerKW: defaultServo.rated_power_kw, ratedCurrent: defaultServo.rated_current_a, ratedVoltage: defaultServo.rated_voltage_v, inrushCurrentMultiplier: 3 }, terminals: [createTerminal('L1', -8, -8), createTerminal('L2', 8, -8), createTerminal('GND', 0, 12)] };
    case ComponentType.StepperMotor:
      const defaultStepper = motors.find(m => m.category === "Stepper_Motor")!;
      return { ...baseComponent, motorState: 'stopped', properties: { ...defaultFaultProps, brand: defaultStepper.brand, model: defaultStepper.model, ratedCurrent: defaultStepper.rated_current_a, ratedVoltage: defaultStepper.rated_voltage_v, inrushCurrentMultiplier: 2 }, terminals: [createTerminal('A1', -12, -6), createTerminal('A2', -12, 6), createTerminal('B1', 12, -6), createTerminal('B2', 12, 6)] };
    case ComponentType.PLCInput:
      return { ...baseComponent, diagram: 'control', properties: { ...defaultFaultProps, ioAddress: "I0.0" }, terminals: [createTerminal('in', 0, -16, true), createTerminal('com', 0, 16, true)] };
    case ComponentType.PLCOutput:
      return { ...baseComponent, diagram: 'control', properties: { ...defaultFaultProps, on: false, ioAddress: "Q0.0" }, terminals: [createTerminal('out', 0, -16, false), createTerminal('com', 0, 16, false)] };
    case ComponentType.AND:
    case ComponentType.OR:
    case ComponentType.NAND:
    case ComponentType.NOR:
    case ComponentType.XOR:
        const defaultInputs = 2;
        return { ...baseComponent, properties: {...defaultFaultProps, numInputs: defaultInputs}, terminals: createLogicGateTerminals(defaultInputs) };
    case ComponentType.NOT:
        return { ...baseComponent, properties: {...defaultFaultProps, numInputs: 1}, terminals: createLogicGateTerminals(1) };
    default:
      throw new Error(`Unknown component type: ${type}`);
  }
};