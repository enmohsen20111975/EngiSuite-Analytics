import React from 'react';
import { ComponentInstance, ComponentType } from '../types';
import { DCSourceIcon, ACSourceIcon, ResistorIcon, LedIcon, SwitchIcon, RelayCoilIcon, ContactorIcon, ContactNOIcon, ContactNCIcon, PushButtonIcon, LampIcon, MotorIcon, MCBIcon, AmmeterIcon, VoltmeterIcon, PLCIOIcon, FuseIcon, MCCBIcon, ACBIcon, TransformerIcon, MotorProtectorIcon, OverloadRelayIcon, RCBOIcon, DCMotorIcon, ServoMotorIcon, StepperMotorIcon, ContactorCoilIcon, AndGateIcon, OrGateIcon, NotGateIcon, NandGateIcon, NorGateIcon, XorGateIcon, JunctionIcon } from './icons';
import { FaultIcon } from './ActionIcons';

interface ComponentRendererProps {
  component: ComponentInstance;
}

const ComponentRendererInternal: React.FC<ComponentRendererProps> = ({ component }) => {
  const isDigitalOn = typeof component.properties.on === 'boolean' ? component.properties.on : false;
  const isEnergized = !!component.isEnergized;
  const isTripped = !!component.isTripped;
  const isFaulted = component.properties.fault && component.properties.fault !== 'none';
  const isStarting = component.motorState === 'starting';

  const renderContent = () => {
    const motorOn = isEnergized || isStarting;
    switch (component.type) {
      case ComponentType.DCSource:
        return <DCSourceIcon />;
      case ComponentType.ACSource:
        return <ACSourceIcon phases={component.properties.phases} />;
      case ComponentType.Resistor:
        return <ResistorIcon />;
      case ComponentType.LED:
        return <LedIcon on={isEnergized} color={component.properties.color || '#22c55e'} />;
      case ComponentType.Switch:
        return <SwitchIcon on={isDigitalOn} />;
      case ComponentType.Junction:
        return <JunctionIcon />;
       case ComponentType.AND:
        return <AndGateIcon />;
      case ComponentType.OR:
        return <OrGateIcon />;
      case ComponentType.NOT:
        return <NotGateIcon />;
      case ComponentType.NAND:
        return <NandGateIcon />;
      case ComponentType.NOR:
        return <NorGateIcon />;
      case ComponentType.XOR:
        return <XorGateIcon />;
      case ComponentType.RelayCoil:
        return <RelayCoilIcon on={isEnergized} />;
      case ComponentType.Contactor:
        return <ContactorIcon on={isDigitalOn} />;
      case ComponentType.ContactorCoil:
        return <ContactorCoilIcon on={isEnergized} />;
      case ComponentType.ContactNO:
        return <ContactNOIcon on={isDigitalOn} />;
      case ComponentType.ContactNC:
        return <ContactNCIcon on={isDigitalOn} />;
      case ComponentType.PushButton:
        return <PushButtonIcon on={isDigitalOn} />;
      case ComponentType.Lamp:
        return <LampIcon on={isEnergized} color={component.properties.color || '#f59e0b'} />;
      case ComponentType.Motor:
        return <MotorIcon on={motorOn} />;
      case ComponentType.Fuse:
          return <FuseIcon isTripped={isTripped} />;
      case ComponentType.MCB:
          return <MCBIcon isTripped={isTripped} />;
      case ComponentType.MCCB:
          return <MCCBIcon isTripped={isTripped} />;
      case ComponentType.ACB:
          return <ACBIcon isTripped={isTripped} />;
      case ComponentType.MotorProtector:
          return <MotorProtectorIcon isTripped={isTripped} />;
      case ComponentType.OverloadRelay:
          return <OverloadRelayIcon isTripped={isTripped} />;
      case ComponentType.RCBO:
          return <RCBOIcon isTripped={isTripped} />;
      case ComponentType.Transformer:
          return <TransformerIcon />;
      case ComponentType.Ammeter:
          return <div className="relative"><AmmeterIcon /><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-primary)] pointer-events-none">{component.properties.liveCurrent?.toFixed(1) ?? '0.0'}</span></div>;
      case ComponentType.Voltmeter:
          return <div className="relative"><VoltmeterIcon /><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-primary)] pointer-events-none">{component.properties.liveVoltage?.toFixed(1) ?? '0.0'}</span></div>;
      case ComponentType.DCMotor:
          return <DCMotorIcon on={motorOn} />;
      case ComponentType.ServoMotor:
          return <ServoMotorIcon on={motorOn} />;
      case ComponentType.StepperMotor:
          return <StepperMotorIcon on={motorOn} />;
      case ComponentType.PLCInput:
        return <PLCIOIcon isInput={true} />;
      case ComponentType.PLCOutput:
        return <PLCIOIcon isInput={false} />;
      default:
        return <div className="w-10 h-10 border-2 border-dashed border-red-500" />;
    }
  };
  
  const getLabel = () => {
    const props = component.properties;
    switch(component.type){
        case ComponentType.Junction:
             return '';
        case ComponentType.DCSource:
            return `${props.voltage || 0}V DC`;
        case ComponentType.ACSource:
            return `${props.voltage || 0}V AC (${props.phases || 1}~)`;
        case ComponentType.Resistor:
            return `${props.resistance || 0}Ω`;
        case ComponentType.Contactor:
        case ComponentType.RelayCoil:
        case ComponentType.ContactorCoil:
        case ComponentType.ContactNO:
        case ComponentType.ContactNC:
        case ComponentType.OverloadRelay:
            return props.linkId || 'unlinked';
        case ComponentType.Motor:
        case ComponentType.DCMotor:
        case ComponentType.ServoMotor:
        case ComponentType.StepperMotor:
            return props.model || component.type;
        case ComponentType.Transformer:
            return `${props.primaryVoltage || 0}/${props.secondaryVoltage || 0}V`;
        case ComponentType.PLCInput:
        case ComponentType.PLCOutput:
            return props.ioAddress || 'unset';
        default:
            return props.label || component.type;
    }
  }

  return (
    <div className={`relative flex flex-col items-center justify-center select-none transition-all duration-100 ${isFaulted ? 'text-[var(--component-faulted)]' : isTripped ? 'text-[var(--component-tripped)]' : (isEnergized || isStarting) ? 'text-[var(--component-energized)]' : 'text-[var(--component-idle)]'}`}>
      {renderContent()}
      <span className="text-xs mt-1 text-center whitespace-nowrap">{getLabel()}</span>
       {isStarting && <span className="text-xs text-yellow-400 font-bold animate-pulse">Starting...</span>}
      {isFaulted && (
        <div className="absolute -top-1 -right-1" title={`Fault: ${component.properties.fault.replace('_', ' ')}`}>
            <FaultIcon />
        </div>
      )}
    </div>
  );
};

export const ComponentRenderer = React.memo(ComponentRendererInternal);