import { ComponentInstance, Wire, ComponentType, WireMaterial, LadderRung } from '../types';
import { createComponent } from '../utils/componentFactory';

export const dolStarterDemo = (): { components: ComponentInstance[], wires: Wire[], ladderRungs: LadderRung[], plcCode: string } => {
    // Power Components
    const acSource = createComponent(ComponentType.ACSource, 150, 100);
    acSource.id = "ac_source";
    
    const mcb3P = createComponent(ComponentType.MCB, 150, 200);
    mcb3P.id = "F1";
    mcb3P.diagram = 'power';
    mcb3P.properties = { ...mcb3P.properties, on: true, ratedCurrent: 10, tripCurve: 'D', label: "F1" };
    mcb3P.terminals = [ {id: 'L1', x: -20, y:0}, {id: 'L2', x: 0, y:0}, {id: 'L3', x: 20, y:0}, {id: 'T1', x: -20, y:20}, {id: 'T2', x: 0, y:20}, {id: 'T3', x: 20, y:20}];
    
    const contactor = createComponent(ComponentType.Contactor, 150, 300);
    contactor.id = "KM1_power";
    contactor.properties = { ...contactor.properties, linkId: "Q0.0", on: false, label: "KM1 (Q0.0)" };

    const overloadRelay = createComponent(ComponentType.OverloadRelay, 150, 400);
    overloadRelay.id = "F3";
    overloadRelay.properties = { ...overloadRelay.properties, on: true, linkId: "F3", ratedCurrent: 0.8, label: "F3" };

    const motor = createComponent(ComponentType.Motor, 150, 500);
    motor.id = "M1";
    motor.properties = { ...motor.properties, brand: "ABB", model: "M2BAX 71MA 4", powerKW: 0.37, ratedCurrent: 0.96, label: "M1" };

    // Control Components
    const dcSource = createComponent(ComponentType.DCSource, 500, 100);
    dcSource.id = "dc_source";
    dcSource.properties = { ...dcSource.properties, voltage: 24 };

    const mcb1P = createComponent(ComponentType.MCB, 500, 180);
    mcb1P.id = "F2";
    mcb1P.properties = { ...mcb1P.properties, on: true, ratedCurrent: 2, tripCurve: 'B', label: "F2" };

    const stopBtn = createComponent(ComponentType.PushButton, 500, 260);
    stopBtn.id = "S0";
    stopBtn.properties = { ...stopBtn.properties, on: true, label: "S0 (Stop)" }; // NC

    const overloadContact = createComponent(ComponentType.ContactNC, 500, 340);
    overloadContact.id = "F3_NC";
    overloadContact.properties = { ...overloadContact.properties, on: true, linkId: "F3", label: "F3 (95-96)" };

    const startBtn = createComponent(ComponentType.PushButton, 500, 420);
    startBtn.id = "S1";
    startBtn.properties = { ...startBtn.properties, on: false, label: "S1 (Start)" }; // NO
    
    const plcInputStart = createComponent(ComponentType.PLCInput, 650, 420);
    plcInputStart.properties.ioAddress = "I0.0";
    plcInputStart.properties.label = "Start Signal";

    const plcInputStop = createComponent(ComponentType.PLCInput, 650, 300);
    plcInputStop.properties.ioAddress = "I0.1";
    plcInputStop.properties.label = "Stop Signal";
    
    const plcOutputMotor = createComponent(ComponentType.PLCOutput, 650, 500);
    plcOutputMotor.properties.ioAddress = "Q0.0";
    plcOutputMotor.properties.label = "Motor Contactor";

    const contactorCoil = createComponent(ComponentType.ContactorCoil, 750, 500);
    contactorCoil.id = "KM1_coil";
    contactorCoil.properties = { ...contactorCoil.properties, linkId: "Q0.0", label: "KM1 Coil" };
    contactorCoil.diagram = 'control';
    
    const components: ComponentInstance[] = [acSource, mcb3P, contactor, overloadRelay, motor, dcSource, mcb1P, stopBtn, overloadContact, startBtn, plcInputStart, plcInputStop, plcOutputMotor, contactorCoil];

    const wires: Wire[] = [
        // Power Circuit
        { id: 'w-L1', startComponentId: acSource.id, startTerminalId: 'L1', endComponentId: mcb3P.id, endTerminalId: 'L1', points: [], material: WireMaterial.Copper, size: 2.5, diagram: 'power' },
        { id: 'w-L2', startComponentId: acSource.id, startTerminalId: 'L2', endComponentId: mcb3P.id, endTerminalId: 'L2', points: [], material: WireMaterial.Copper, size: 2.5, diagram: 'power' },
        { id: 'w-L3', startComponentId: acSource.id, startTerminalId: 'L3', endComponentId: mcb3P.id, endTerminalId: 'L3', points: [], material: WireMaterial.Copper, size: 2.5, diagram: 'power' },
        { id: 'w-mcb-c-1', startComponentId: mcb3P.id, startTerminalId: 'T1', endComponentId: contactor.id, endTerminalId: '1/L1', points: [], material: WireMaterial.Copper, size: 2.5, diagram: 'power' },
        { id: 'w-mcb-c-2', startComponentId: mcb3P.id, startTerminalId: 'T2', endComponentId: contactor.id, endTerminalId: '3/L2', points: [], material: WireMaterial.Copper, size: 2.5, diagram: 'power' },
        { id: 'w-mcb-c-3', startComponentId: mcb3P.id, startTerminalId: 'T3', endComponentId: contactor.id, endTerminalId: '5/L3', points: [], material: WireMaterial.Copper, size: 2.5, diagram: 'power' },
        { id: 'w-c-ol-1', startComponentId: contactor.id, startTerminalId: '2/T1', endComponentId: overloadRelay.id, endTerminalId: 'L1', points: [], material: WireMaterial.Copper, size: 2.5, diagram: 'power' },
        { id: 'w-c-ol-2', startComponentId: contactor.id, startTerminalId: '4/T2', endComponentId: overloadRelay.id, endTerminalId: 'L2', points: [], material: WireMaterial.Copper, size: 2.5, diagram: 'power' },
        { id: 'w-c-ol-3', startComponentId: contactor.id, startTerminalId: '6/T3', endComponentId: overloadRelay.id, endTerminalId: 'L3', points: [], material: WireMaterial.Copper, size: 2.5, diagram: 'power' },
        { id: 'w-ol-m-1', startComponentId: overloadRelay.id, startTerminalId: 'T1', endComponentId: motor.id, endTerminalId: 'U1', points: [], material: WireMaterial.Copper, size: 2.5, diagram: 'power' },
        { id: 'w-ol-m-2', startComponentId: overloadRelay.id, startTerminalId: 'T2', endComponentId: motor.id, endTerminalId: 'V1', points: [], material: WireMaterial.Copper, size: 2.5, diagram: 'power' },
        { id: 'w-ol-m-3', startComponentId: overloadRelay.id, startTerminalId: 'T3', endComponentId: motor.id, endTerminalId: 'W1', points: [], material: WireMaterial.Copper, size: 2.5, diagram: 'power' },
        
        // Control Circuit Power
        { id: 'cw-p1', startComponentId: dcSource.id, startTerminalId: 't1', endComponentId: mcb1P.id, endTerminalId: 't1', points: [], material: WireMaterial.Copper, size: 1.5, diagram: 'control' },
        { id: 'cw-p2', startComponentId: mcb1P.id, startTerminalId: 't2', endComponentId: stopBtn.id, endTerminalId: 't1', points: [{x: 500, y: 220}], material: WireMaterial.Copper, size: 1.5, diagram: 'control' },
        { id: 'cw-p3', startComponentId: overloadContact.id, startTerminalId: 't2', endComponentId: startBtn.id, endTerminalId: 't1', points: [], material: WireMaterial.Copper, size: 1.5, diagram: 'control' },
        { id: 'cw-stop-ol', startComponentId: stopBtn.id, startTerminalId: 't2', endComponentId: overloadContact.id, endTerminalId: 't1', points: [], material: WireMaterial.Copper, size: 1.5, diagram: 'control' },

        // PLC Input Wiring
        { id: 'cw-j1', startComponentId: mcb1P.id, startTerminalId: 't2', endComponentId: plcInputStop.id, endTerminalId: 'com', points:[{x: 500, y: 220}, {x: 600, y: 220}, {x: 600, y: 316}], material: WireMaterial.Copper, size: 1.5, diagram: 'control' },
        { id: 'cw-stop-in', startComponentId: stopBtn.id, startTerminalId: 't1', endComponentId: plcInputStop.id, endTerminalId: 'in', points: [], material: WireMaterial.Copper, size: 1.5, diagram: 'control' },
        { id: 'cw-start-in', startComponentId: startBtn.id, startTerminalId: 't2', endComponentId: plcInputStart.id, endTerminalId: 'in', points: [], material: WireMaterial.Copper, size: 1.5, diagram: 'control' },
        
        // PLC Output to Coil
        { id: 'cw-out-coil', startComponentId: plcOutputMotor.id, startTerminalId: 'out', endComponentId: contactorCoil.id, endTerminalId: 'A1', points: [], material: WireMaterial.Copper, size: 1.5, diagram: 'control' },

        // Commons to 0V
        { id: 'cw-n1', startComponentId: plcInputStart.id, startTerminalId: 'com', endComponentId: dcSource.id, endTerminalId: 't2', points:[{x: 650, y: 436}, {x: 620, y: 436}, {x: 620, y: 116}], material: WireMaterial.Copper, size: 1.5, diagram: 'control' },
        { id: 'cw-n2', startComponentId: plcOutputMotor.id, startTerminalId: 'com', endComponentId: dcSource.id, endTerminalId: 't2', points:[{x: 650, y: 516}, {x: 630, y: 516}, {x: 630, y: 116}], material: WireMaterial.Copper, size: 1.5, diagram: 'control' },
        { id: 'cw-n3', startComponentId: contactorCoil.id, startTerminalId: 'A2', endComponentId: dcSource.id, endTerminalId: 't2', points:[{x: 750, y: 510}, {x: 780, y: 510}, {x: 780, y: 116}], material: WireMaterial.Copper, size: 1.5, diagram: 'control' },
    ];
    
    const ladderRungs: LadderRung[] = [
        {
            id: 'rung-0',
            network: [
                {id: 'el-0-0', type: 'NO', address: 'I0.1'}, // Stop Button (NC phys, NO logic)
                [
                    {id: 'el-0-1-0', type: 'NO', address: 'I0.0'}, // Start Button
                    {id: 'el-0-1-1', type: 'NO', address: 'Q0.0'}  // Latching Contact
                ],
                {id: 'el-0-2', type: 'Coil', address: 'Q0.0'}, // Motor Contactor Coil
            ]
        }
    ];
    
    const plcCode = `// DOL starter logic\n// (Start OR Latch) AND (Stop Not Pressed) -> Motor\nQ[0] = (I[0] || Q[0]) && I[1];`;

    return { components, wires, ladderRungs, plcCode };
};