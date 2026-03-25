import React from 'react';

// --- LOGIC GATES ---
const GateBase: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 40 }) => (
    <svg width={size*1.2} height={size} viewBox="0 0 48 40" fill="none" stroke="currentColor" strokeWidth="2">
        {children}
        {/* Inputs */}
        <path d="M0 10 H 10 M0 30 H 10" />
        {/* Output */}
        <path d="M40 20 H 48" />
    </svg>
);

export const AndGateIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
    <GateBase size={size}>
        <path d="M10 0 H 25 C 35 0 40 10 40 20 C 40 30 35 40 25 40 H 10 V 0 Z" />
    </GateBase>
);

export const OrGateIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
     <GateBase size={size}>
        <path d="M10 0 C 20 10, 20 30, 10 40" />
        <path d="M10 0 C 30 5, 40 20, 40 20 C 40 20, 30 35, 10 40" />
    </GateBase>
);

export const XorGateIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
     <GateBase size={size}>
        <path d="M5 0 C 15 10, 15 30, 5 40" />
        <path d="M10 0 C 20 10, 20 30, 10 40" />
        <path d="M10 0 C 30 5, 40 20, 40 20 C 40 20, 30 35, 10 40" />
    </GateBase>
);

export const NotGateIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
     <svg width={size*1.2} height={size} viewBox="0 0 48 40" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M0 20 H 10" />
        <path d="M10 5 L 10 35 L 35 20 Z" />
        <circle cx="40" cy="20" r="3" />
        <path d="M43 20 H 48" />
    </svg>
);

export const NandGateIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
     <GateBase size={size}>
        <path d="M10 0 H 25 C 35 0 40 10 40 20 C 40 30 35 40 25 40 H 10 V 0 Z" />
        <circle cx="43" cy="20" r="3" transform="translate(-3, 0)"/>
    </GateBase>
);

export const NorGateIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
     <GateBase size={size}>
        <path d="M10 0 C 20 10, 20 30, 10 40" />
        <path d="M10 0 C 30 5, 40 20, 40 20 C 40 20, 30 35, 10 40" />
        <circle cx="43" cy="20" r="3" transform="translate(-3, 0)"/>
    </GateBase>
);

export const JunctionIcon: React.FC<{ size?: number }> = ({ size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 10 10">
    <circle cx="5" cy="5" r="5" fill="currentColor" />
  </svg>
);


// --- SOURCES ---
export const DCSourceIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="16" y1="5" x2="16" y2="11" />
    <line x1="16" y1="21" x2="16" y2="27" />
    <line x1="10" y1="11" x2="22" y2="11" />
    <line x1="13" y1="16" x2="19" y2="16" />
    <line x1="10" y1="21" x2="22" y2="21" />
    <text x="26" y="11" fontSize="10" fill="currentColor" textAnchor="middle">+</text>
    <text x="26" y="25" fontSize="10" fill="currentColor" textAnchor="middle">-</text>
  </svg>
);

export const ACSourceIcon: React.FC<{ size?: number; phases?: 1 | 3 }> = ({ size = 40, phases = 1 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M7.5 14.5 C 9 11.5, 10.5 11.5, 12 14.5 S 15 17.5, 16.5 14.5" strokeWidth="1"/>
        {phases === 3 && <text x="12" y="8" textAnchor="middle" fontSize="6" fill="currentColor">3~</text>}
    </svg>
);

// --- PASSIVE COMPONENTS ---
export const ResistorIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size*1.5} height={size*0.8} viewBox="0 0 60 32" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 16 H 15 V 8 H 45 V 24 H 15 V 16 H 45" />
    <path d="M45 16 H 55" />
  </svg>
);

export const FuseIcon: React.FC<{ size?: number; isTripped?: boolean }> = ({ size = 40, isTripped = false }) => (
    <svg width={size*1.5} height={size*0.8} viewBox="0 0 60 32" fill="none" stroke={isTripped ? 'var(--component-tripped)' : 'currentColor'} strokeWidth="2">
      <rect x="15" y="8" width="30" height="16" rx="1" fill="none"/>
      <path d="M5 16 H 15 M 45 16 H 55" />
      {isTripped && <line x1="15" y1="8" x2="45" y2="24" strokeWidth="1.5" />}
    </svg>
);

export const TransformerIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
    <svg width={size*1.2} height={size} viewBox="0 0 48 40" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 10 a 10 10 0 1 0 0 20" />
        <path d="M9 10 a 10 10 0 1 0 0 20" />
        <path d="M43 10 a 10 10 0 1 1 0 20" />
        <path d="M39 10 a 10 10 0 1 1 0 20" />
        <path d="M22 5v30" />
        <path d="M26 5v30" />
    </svg>
);

// --- OUTPUTS / LOADS ---
export const LedIcon: React.FC<{ size?: number; on?: boolean; color?: string }> = ({ size = 40, on = false, color = '#22c55e' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    {on && <defs><filter id="glow-led"><feGaussianBlur stdDeviation="2.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>}
    {/* Wires to terminals */}
    <path d="M12 0 V 8" />
    <path d="M12 16 V 24" />
    
    {/* Diode Symbol */}
    <path d="M8 16 h 8" />
    <path d="M8 8 h 8 v 8 l -8 -8 z" fill="currentColor" strokeWidth="1"/>

    {/* Arrows for light */}
    <path d="M17 6 l-2 -2 M17 6 l2 -2" />
    <path d="M19 8 l-2 -2 M19 8 l2 -2" />
    
    {/* Polarity */}
    <text x="16" y="22" fontSize="6" fill="currentColor" textAnchor="middle">-</text>
    <text x="16" y="5" fontSize="6" fill="currentColor" textAnchor="middle">+</text>
    
    {/* Optional Glow Circle */}
    {on && <circle cx="12" cy="12" r="8" strokeWidth="2" stroke={color} fill="none" filter="url(#glow-led)"/>}
  </svg>
);

export const LampIcon: React.FC<{ size?: number; on?: boolean; color?: string }> = ({ size = 40, on = false, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    {on && <defs><filter id="glow-lamp"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>}
    {/* Lines to terminals */}
    <line x1="12" y1="4" x2="12" y2="0" />
    <line x1="12" y1="20" x2="12" y2="24" />
    <circle cx="12" cy="12" r="8" stroke={on ? color : 'currentColor'} fill="none" filter={on ? 'url(#glow-lamp)' : 'none'} />
    <path d="m8 8 8 8M16 8l-8 8" stroke={on ? color : 'currentColor'} />
  </svg>
);

export const MotorIcon: React.FC<{ size?: number; on?: boolean }> = ({ size=40, on=false }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <text x="12" y="14" textAnchor="middle" stroke="currentColor" fill="currentColor" fontSize="8" className={on ? "motor-spin": ""}>M</text>
        <text x="12" y="19" textAnchor="middle" stroke="currentColor" fill="currentColor" fontSize="6">3~</text>
    </svg>
);

export const DCMotorIcon: React.FC<{ size?: number, on?: boolean }> = ({ size = 40, on = false }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <text x="12" y="16" textAnchor="middle" stroke="currentColor" fill="currentColor" fontSize="10" className={on ? "motor-spin": ""}>M</text>
        <path d="M7 12 h-5 M22 12 h-5" />
        <text x="2" y="11" fontSize="6" textAnchor="middle" fill="currentColor">+</text>
        <text x="22" y="11" fontSize="6" textAnchor="middle" fill="currentColor">-</text>
    </svg>
);

export const ServoMotorIcon: React.FC<{ size?: number, on?: boolean }> = ({ size = 40, on = false }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <text x="12" y="14" textAnchor="middle" stroke="currentColor" fill="currentColor" fontSize="8" >M</text>
        <path d="M9 16 c 3 -2 3 -2 6 0" />
    </svg>
);

export const StepperMotorIcon: React.FC<{ size?: number, on?: boolean }> = ({ size = 40, on = false }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 9.5 h2 v2 h4 v-2 h2" />
        <path d="M8 14.5 h2 v-2 h4 v2 h2" />
    </svg>
);

// --- SWITCHES & CONTACTS ---
export const SwitchIcon: React.FC<{ size?: number; on?: boolean }> = ({ size = 40, on = false }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 40 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12 h10 M25 12 h10" />
    <circle cx="15" cy="12" r="3" fill="var(--bg-secondary)" />
    <circle cx="25" cy="12" r="3" fill="var(--bg-secondary)" />
    <line x1="15" y1="12" x2="25" y2={on ? "12" : "5"} style={{transition: 'all 0.2s ease-in-out'}}/>
  </svg>
);

export const PushButtonIcon: React.FC<{ size?: number; on?: boolean }> = ({ size = 40, on = false }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 40 32" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 24 h10 M25 24 h10" />
    <circle cx="15" cy="24" r="3" fill="var(--bg-secondary)" />
    <circle cx="25" cy="24" r="3" fill="var(--bg-secondary)" />
    <line x1="20" y1="5" x2="20" y2={on ? "19" : "16"} style={{transition: 'all 0.1s'}} />
    <line x1="15" y1="5" x2="25" y2="5" />
    <line x1="15" y1={on ? "19" : "16"} x2="25" y2={on ? "19" : "16"} style={{transition: 'all 0.1s'}} />
  </svg>
);


export const ContactNOIcon: React.FC<{ size?: number; on?: boolean }> = ({ size = 40, on = false }) => (
    <svg width={size*0.4} height={size} viewBox="0 0 16 40" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 5 v10 M8 25 v10" />
        <path d="M8 15 v-1 h-6" />
        <path d="M8 25 v1 h-6" transform={ on ? 'translate(0, -10)' : ''} style={{transition: 'transform 0.2s ease-in-out'}}/>
    </svg>
);

export const ContactNCIcon: React.FC<{ size?: number; on?: boolean }> = ({ size = 40, on = true }) => (
    <svg width={size*0.4} height={size} viewBox="0 0 16 40" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 5 v10 M8 25 v10" />
        <path d="M8 15 v-1 h-6" />
        <path d="M8 25 v1 h-6" transform={ on ? '' : 'translate(0, -10)'} style={{transition: 'transform 0.2s ease-in-out'}}/>
        <line x1="2" y1="26" x2="8" y2="14" stroke={ on ? 'currentColor' : 'transparent'} style={{transition: 'stroke 0.2s ease-in-out'}}/>
    </svg>
);

// --- COILS ---
export const RelayCoilIcon: React.FC<{ size?: number; on?: boolean }> = ({ size = 40, on = false }) => (
    <svg width={size} height={size*0.5} viewBox="0 0 40 20" fill="none" stroke="currentColor" strokeWidth="2">
        {on && <defs><filter id="glow-coil"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>}
        <rect x="5" y="2" width="30" height="16" rx="1" filter={on ? 'url(#glow-coil)' : 'none'}/>
    </svg>
);

export const ContactorCoilIcon: React.FC<{ size?: number; on?: boolean }> = ({ size = 40, on = false }) => (
     <svg width={size} height={size*0.5} viewBox="0 0 40 20" fill="none" stroke="currentColor" strokeWidth="2">
        {on && <defs><filter id="glow-coil"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>}
        <rect x="5" y="2" width="30" height="16" rx="1" filter={on ? 'url(#glow-coil)' : 'none'} />
    </svg>
);

export const ContactorIcon: React.FC<{ size?: number; on?: boolean }> = ({ size = 40, on = false }) => (
    <svg width={size * 1.5} height={size} viewBox="0 0 60 40" fill="none" stroke="currentColor" strokeWidth="2">
        {/* Main Contacts */}
        <g transform={on ? 'translate(0, 5)' : ''} style={{transition: 'transform 0.2s ease-in-out'}}>
            <path d="M10 5 v10" /> 
            <path d="M10 15 v-1 h-6" />

            <path d="M25 5 v10" /> 
            <path d="M25 15 v-1 h-6" />

            <path d="M40 5 v10" />
            <path d="M40 15 v-1 h-6" />
        </g>
        
        <path d="M10 25 v10 M25 25 v10 M40 25 v10" />
        <path d="M10 25 v1 h-6 M25 25 v1 h-6 M40 25 v1 h-6" />
        
        {/* Linkage line */}
        <path d="M4 20 h36" strokeDasharray="2 2" />
    </svg>
);


// --- PROTECTION DEVICES ---
const BreakerBaseIcon: React.FC<{ isTripped?: boolean }> = ({ isTripped }) => (
  <>
    <path d="M5 12 h10 M25 12 h10" />
    <circle cx="15" cy="12" r="3" fill="var(--bg-secondary)" />
    <circle cx="25" cy="12" r="3" fill="var(--bg-secondary)" />
    <line x1="15" y1="12" x2="25" y2="5" stroke={isTripped ? 'var(--component-tripped)' : 'currentColor'} />
    <rect x="23" y="16" width="8" height="8" strokeWidth="1" />
    <path d="M12 18 c 2 -2 2 -5 0 -7" strokeWidth="1"/>
  </>
);

export const MCBIcon: React.FC<{ size?: number; isTripped?: boolean }> = ({ size = 40, isTripped = false }) => (
    <svg width={size} height={size*0.75} viewBox="0 0 40 30" fill="none" stroke="currentColor" strokeWidth="2">
        <BreakerBaseIcon isTripped={isTripped} />
    </svg>
);

export const MCCBIcon: React.FC<{ size?: number; isTripped?: boolean }> = ({ size = 40, isTripped = false }) => (
    <svg width={size*1.1} height={size*0.75} viewBox="0 0 44 30" fill="none" stroke="currentColor" strokeWidth="2">
        <BreakerBaseIcon isTripped={isTripped} />
    </svg>
);

export const ACBIcon: React.FC<{ size?: number; isTripped?: boolean }> = ({ size = 40, isTripped = false }) => (
     <svg width={size*1.2} height={size*0.75} viewBox="0 0 48 30" fill="none" stroke="currentColor" strokeWidth="2">
        <BreakerBaseIcon isTripped={isTripped} />
    </svg>
);

export const MotorProtectorIcon: React.FC<{ size?: number; isTripped?: boolean }> = ({ size = 40, isTripped = false }) => (
    <svg width={size} height={size*0.75} viewBox="0 0 40 30" fill="none" stroke="currentColor" strokeWidth="2">
        <BreakerBaseIcon isTripped={isTripped} />
        <path d="M8 18 c 2 -2 2 -5 0 -7" strokeWidth="1"/>
    </svg>
);

export const OverloadRelayIcon: React.FC<{ size?: number; isTripped?: boolean }> = ({ size = 40, isTripped = false }) => (
    <svg width={size} height={size * 0.75} viewBox="0 0 40 30" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 15 H 10 M 30 15 H 35" />
      <rect x="10" y="5" width="20" height="20" rx="1" stroke={isTripped ? 'var(--component-tripped)' : 'currentColor'} fill="none"/>
      <path d="M16 20 c 2 -3 2 -7 0 -10" strokeWidth="1.5" stroke={isTripped ? 'var(--component-tripped)' : 'currentColor'}/>
    </svg>
);

export const RCBOIcon: React.FC<{ size?: number; isTripped?: boolean }> = ({ size = 40, isTripped = false }) => (
    <svg width={size} height={size*0.75} viewBox="0 0 40 30" fill="none" stroke="currentColor" strokeWidth="2">
        <BreakerBaseIcon isTripped={isTripped} />
        <circle cx="8" cy="20" r="4" strokeWidth="1"/>
    </svg>
);


// --- MEASUREMENT & PLC ---
export const AmmeterIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <text x="12" y="16" textAnchor="middle" stroke="none" fill="currentColor" fontSize="10">A</text>
    </svg>
);

export const VoltmeterIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <text x="12" y="16" textAnchor="middle" stroke="none" fill="currentColor" fontSize="10">V</text>
    </svg>
);

export const PLCIOIcon: React.FC<{ size?: number, isInput?: boolean }> = ({ size = 40, isInput = true }) => (
    <svg width={size*0.6} height={size*0.8} viewBox="0 0 24 32" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="6" width="20" height="20" rx="2" fill="var(--bg-tertiary)" />
        <text x="12" y="20" textAnchor="middle" fill="currentColor" fontSize="8" className="font-bold">
            {isInput ? "IN" : "OUT"}
        </text>
    </svg>
);