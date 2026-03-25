import React from 'react';
import { ComponentType } from '../types';
import { DCSourceIcon, ACSourceIcon, ResistorIcon, LedIcon, SwitchIcon, RelayCoilIcon, ContactorIcon, ContactNOIcon, ContactNCIcon, PushButtonIcon, LampIcon, MotorIcon, MCBIcon, AmmeterIcon, VoltmeterIcon, PLCIOIcon, FuseIcon, MCCBIcon, ACBIcon, TransformerIcon, MotorProtectorIcon, OverloadRelayIcon, RCBOIcon, DCMotorIcon, ServoMotorIcon, StepperMotorIcon, ContactorCoilIcon, AndGateIcon, OrGateIcon, NotGateIcon, NandGateIcon, NorGateIcon, XorGateIcon, JunctionIcon } from './icons';

interface ToolboxProps {
  onDragStart: (e: React.DragEvent, type: ComponentType) => void;
}

const getComponentDescription = (type: ComponentType): string => {
    switch(type) {
        case ComponentType.DCSource: return "Provides a constant DC voltage.";
        case ComponentType.ACSource: return "Provides a single-phase or three-phase AC voltage supply.";
        case ComponentType.Resistor: return "Resists the flow of electrical current.";
        case ComponentType.Switch: return "Manually opens or closes a circuit.";
        case ComponentType.PushButton: return "A momentary switch, typically used for start/stop controls.";
        case ComponentType.Lamp: return "A visual indicator light.";
        case ComponentType.Motor: return "Converts electrical energy into mechanical motion.";
        case ComponentType.LED: return "A light-emitting diode, a semiconductor light source.";
        case ComponentType.RelayCoil: return "An electromagnetic coil that operates one or more contacts.";
        case ComponentType.Contactor: return "A heavy-duty switch for motor loads. Must be linked to a Contactor Coil.";
        case ComponentType.ContactorCoil: return "The coil that operates a linked Contactor's main contacts.";
        case ComponentType.ContactNO: return "A normally-open contact, closes when its linked coil is energized.";
        case ComponentType.ContactNC: return "A normally-closed contact, opens when its linked coil is energized.";
        case ComponentType.Fuse: return "A one-time overcurrent protection device that melts to open a circuit.";
        case ComponentType.MCB: return "Miniature Circuit Breaker. Protects circuits from overcurrents. Can be reset.";
        case ComponentType.MCCB: return "Molded Case Circuit Breaker. A robust breaker for higher currents.";
        case ComponentType.ACB: return "Air Circuit Breaker. A large-scale breaker for main power distribution.";
        case ComponentType.MotorProtector: return "A specialized breaker with settings tailored for motor protection.";
        case ComponentType.OverloadRelay: return "Protects a motor from thermal overload. Trips after a sustained overcurrent.";
        case ComponentType.RCBO: return "Residual Current Breaker with Overcurrent. Provides both overload and earth-fault protection.";
        case ComponentType.Transformer: return "Steps voltage up or down between isolated circuits.";
        case ComponentType.Ammeter: return "Measures the current flowing through a point in the circuit.";
        case ComponentType.Voltmeter: return "Measures the voltage difference between two points.";
        case ComponentType.DCMotor: return "A motor that runs on Direct Current (DC).";
        case ComponentType.ServoMotor: return "A motor for precise control of angular or linear position.";
        case ComponentType.StepperMotor: return "A brushless DC motor that divides a full rotation into a number of equal steps.";
        case ComponentType.PLCInput: return "A terminal for connecting sensors or switches to the PLC.";
        case ComponentType.PLCOutput: return "A terminal for connecting PLC logic to coils or lamps.";
        case ComponentType.Junction: return "A connection point to join multiple wires together.";
        case ComponentType.AND: return "Outputs HIGH only if both inputs are HIGH.";
        case ComponentType.OR: return "Outputs HIGH if at least one input is HIGH.";
        case ComponentType.NOT: return "Outputs the inverse of the input (HIGH if input is LOW).";
        case ComponentType.NAND: return "Outputs LOW only if both inputs are HIGH (inverse of AND).";
        case ComponentType.NOR: return "Outputs HIGH only if both inputs are LOW (inverse of OR).";
        case ComponentType.XOR: return "Outputs HIGH if the inputs are different.";
        default: return "A circuit component.";
    }
}


const ToolboxItem: React.FC<{ type: ComponentType, onDragStart: (e: React.DragEvent, type: ComponentType) => void, children: React.ReactNode, label: string }> = ({ type, onDragStart, children, label }) => {
    return (
        <div 
            className="relative group flex flex-col items-center p-2 rounded-lg cursor-grab bg-[var(--bg-tertiary)] hover:bg-[var(--bg-interactive)] transition-colors duration-200"
            draggable
            onDragStart={(e) => onDragStart(e, type)}
        >
            {children}
            <span className="text-xs mt-1 text-center">{label}</span>
            <div className="absolute left-full ml-4 w-48 p-2 bg-[var(--bg-tooltip)] text-[var(--text-primary)] text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 border border-[var(--border-secondary)] hidden lg:block">
                <h5 className="font-bold mb-1 text-sm">{label}</h5>
                <p className="font-normal text-[var(--text-secondary)]">{getComponentDescription(type)}</p>
            </div>
        </div>
    );
}

const ToolboxHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h4 className="col-span-2 text-sm font-semibold text-[var(--text-muted)] mt-4 border-b border-[var(--border-primary)] pb-1">{children}</h4>
)

export const Toolbox: React.FC<ToolboxProps> = ({ onDragStart }) => {
  return (
    <div className="w-64 bg-[var(--bg-secondary)] p-4 overflow-y-auto">
      <h3 className="text-lg font-bold border-b border-[var(--border-secondary)] pb-2 mb-4">Components</h3>
      <div className="grid grid-cols-2 gap-4">
        
        <ToolboxHeader>Power &amp; Sources</ToolboxHeader>
        <ToolboxItem type={ComponentType.DCSource} onDragStart={onDragStart} label="DC Source"><DCSourceIcon /></ToolboxItem>
        <ToolboxItem type={ComponentType.ACSource} onDragStart={onDragStart} label="AC Source"><ACSourceIcon phases={3} /></ToolboxItem>
        
        <ToolboxHeader>Input</ToolboxHeader>
        <ToolboxItem type={ComponentType.Switch} onDragStart={onDragStart} label="Switch"><SwitchIcon on={false} /></ToolboxItem>
        <ToolboxItem type={ComponentType.PushButton} onDragStart={onDragStart} label="Push Button"><PushButtonIcon on={false} /></ToolboxItem>

        <ToolboxHeader>Loads &amp; Outputs</ToolboxHeader>
        <ToolboxItem type={ComponentType.Resistor} onDragStart={onDragStart} label="Resistor"><ResistorIcon /></ToolboxItem>
        <ToolboxItem type={ComponentType.Lamp} onDragStart={onDragStart} label="Lamp"><LampIcon /></ToolboxItem>
        <ToolboxItem type={ComponentType.Motor} onDragStart={onDragStart} label="3-Phase Motor"><MotorIcon /></ToolboxItem>
        <ToolboxItem type={ComponentType.LED} onDragStart={onDragStart} label="LED"><LedIcon /></ToolboxItem>
        
        <ToolboxHeader>Wiring</ToolboxHeader>
        <ToolboxItem type={ComponentType.Junction} onDragStart={onDragStart} label="Junction"><JunctionIcon /></ToolboxItem>

        <ToolboxHeader>Control &amp; Switching</ToolboxHeader>
        <ToolboxItem type={ComponentType.RelayCoil} onDragStart={onDragStart} label="Relay Coil"><RelayCoilIcon /></ToolboxItem>
        <ToolboxItem type={ComponentType.ContactorCoil} onDragStart={onDragStart} label="Contactor Coil"><ContactorCoilIcon /></ToolboxItem>
        <ToolboxItem type={ComponentType.ContactNO} onDragStart={onDragStart} label="Contact NO"><ContactNOIcon /></ToolboxItem>
        <ToolboxItem type={ComponentType.ContactNC} onDragStart={onDragStart} label="Contact NC"><ContactNCIcon /></ToolboxItem>

        <ToolboxHeader>Logic Gates</ToolboxHeader>
        <ToolboxItem type={ComponentType.AND} onDragStart={onDragStart} label="AND Gate"><AndGateIcon /></ToolboxItem>
        <ToolboxItem type={ComponentType.OR} onDragStart={onDragStart} label="OR Gate"><OrGateIcon /></ToolboxItem>
        <ToolboxItem type={ComponentType.NOT} onDragStart={onDragStart} label="NOT Gate"><NotGateIcon /></ToolboxItem>
        <ToolboxItem type={ComponentType.NAND} onDragStart={onDragStart} label="NAND Gate"><NandGateIcon /></ToolboxItem>
        <ToolboxItem type={ComponentType.NOR} onDragStart={onDragStart} label="NOR Gate"><NorGateIcon /></ToolboxItem>
        <ToolboxItem type={ComponentType.XOR} onDragStart={onDragStart} label="XOR Gate"><XorGateIcon /></ToolboxItem>

        <ToolboxHeader>Power Switching</ToolboxHeader>
        <ToolboxItem type={ComponentType.Contactor} onDragStart={onDragStart} label="Contactor"><ContactorIcon /></ToolboxItem>
        
        <ToolboxHeader>Protection</ToolboxHeader>
        <ToolboxItem type={ComponentType.Fuse} onDragStart={onDragStart} label="Fuse"><FuseIcon /></ToolboxItem>
        <ToolboxItem type={ComponentType.MCB} onDragStart={onDragStart} label="MCB"><MCBIcon /></ToolboxItem>
        <ToolboxItem type={ComponentType.MCCB} onDragStart={onDragStart} label="MCCB"><MCCBIcon /></ToolboxItem>
        <ToolboxItem type={ComponentType.ACB} onDragStart={onDragStart} label="ACB"><ACBIcon /></ToolboxItem>
        <ToolboxItem type={ComponentType.MotorProtector} onDragStart={onDragStart} label="Motor Protector"><MotorProtectorIcon /></ToolboxItem>
        <ToolboxItem type={ComponentType.OverloadRelay} onDragStart={onDragStart} label="Overload Relay"><OverloadRelayIcon /></ToolboxItem>
        <ToolboxItem type={ComponentType.RCBO} onDragStart={onDragStart} label="RCBO"><RCBOIcon /></ToolboxItem>

        <ToolboxHeader>Power Conversion</ToolboxHeader>
        <ToolboxItem type={ComponentType.Transformer} onDragStart={onDragStart} label="Transformer"><TransformerIcon /></ToolboxItem>

        <ToolboxHeader>Specialized Motors</ToolboxHeader>
        <ToolboxItem type={ComponentType.DCMotor} onDragStart={onDragStart} label="DC Motor"><DCMotorIcon /></ToolboxItem>
        <ToolboxItem type={ComponentType.ServoMotor} onDragStart={onDragStart} label="Servo Motor"><ServoMotorIcon /></ToolboxItem>
        <ToolboxItem type={ComponentType.StepperMotor} onDragStart={onDragStart} label="Stepper Motor"><StepperMotorIcon /></ToolboxItem>

        <ToolboxHeader>Measurement</ToolboxHeader>
        <ToolboxItem type={ComponentType.Ammeter} onDragStart={onDragStart} label="Ammeter"><AmmeterIcon /></ToolboxItem>
        <ToolboxItem type={ComponentType.Voltmeter} onDragStart={onDragStart} label="Voltmeter"><VoltmeterIcon /></ToolboxItem>

        <ToolboxHeader>PLC I/O</ToolboxHeader>
        <ToolboxItem type={ComponentType.PLCInput} onDragStart={onDragStart} label="PLC Input"><PLCIOIcon isInput={true}/></ToolboxItem>
        <ToolboxItem type={ComponentType.PLCOutput} onDragStart={onDragStart} label="PLC Output"><PLCIOIcon isInput={false}/></ToolboxItem>

      </div>
    </div>
  );
};