// This file is compiled from types.ts
window.AppModules = window.AppModules || {};

(function() {
    'use strict';

    AppModules.ComponentType = {
        DCSource: 'DCSource',
        ACSource: 'ACSource',
        Resistor: 'Resistor',
        LED: 'LED',
        Switch: 'Switch',
        RelayCoil: 'RelayCoil',
        Contactor: 'Contactor',
        ContactorCoil: 'ContactorCoil',
        ContactNO: 'ContactNO',
        ContactNC: 'ContactNC',
        PushButton: 'PushButton',
        Lamp: 'Lamp',
        Motor: 'Motor',
        Fuse: 'Fuse',
        MCB: 'MCB',
        MCCB: 'MCCB',
        ACB: 'ACB',
        MotorProtector: 'MotorProtector',
        RCBO: 'RCBO',
        Transformer: 'Transformer',
        Ammeter: 'Ammeter',
        Voltmeter: 'Voltmeter',
        DCMotor: 'DCMotor',
        ServoMotor: 'ServoMotor',
        StepperMotor: 'StepperMotor',
        PLCInput: 'PLCInput',
        PLCOutput: 'PLCOutput',
    };

    AppModules.WireMaterial = {
        Copper: 'Copper',
        Aluminum: 'Aluminum',
    };

    /*
    // Original TypeScript Interfaces for reference:

    export interface ComponentProperties {
        label?: string;
        on?: boolean;
        brand?: string;
        model?: string;
        voltage?: number;
        phases?: 1 | 3;
        ratedVoltage?: number;
        resistance?: number;
        powerKW?: number;
        ratedCurrent?: number;
        powerFactor?: number;
        efficiency?: number;
        coilVoltage?: string;
        contactsConfig?: string;
        residualCurrent?: number;
        inrushCurrentMultiplier?: number;
        primaryVoltage?: number;
        secondaryVoltage?: number;
        powerKVA?: number;
        tripCurve?: string;
        magneticMultiplier?: number;
        adjustableRange?: [number, number];
        magnetic_trip_current_multiplier?: [number, number];
        instant_trip_time_ms?: number;
        color?: string;
        linkId?: string;
        ioAddress?: string;
        liveVoltage?: number;
        liveCurrent?: number;
        livePower?: number; // Real Power (W)
        liveApparentPower?: number; // Apparent Power (VA)
        liveReactivePower?: number; // Reactive Power (VAR)
        fault?: 'none' | 'open_circuit' | 'short_circuit';
        failureRate?: number;
    }

    export interface Terminal {
        id: string;
        x: number;
        y: number;
        isInput?: boolean; 
        nodeId?: number;
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
        isEnergized?: boolean;
        isTripped?: boolean;
        motorState?: 'stopped' | 'starting' | 'running';
        startupTimer?: number;
        bouncingUntil?: number; // Timestamp until which the contact is bouncing
    }

    export interface Wire {
        id:string;
        startComponentId: string;
        startTerminalId: string;
        endComponentId: string;
        endTerminalId: string;
        points?: Array<{x: number, y: number}>;
        diagram: 'power' | 'control';
        isEnergized?: boolean;
        liveVoltage?: number;
        liveCurrent?: number;
        length?: number;
        size?: number;
        material?: WireMaterial;
        resistance?: number;
    }

    export interface PLCState {
        I: boolean[];
        Q: boolean[];
        M: boolean[];
    }
    */

})();
