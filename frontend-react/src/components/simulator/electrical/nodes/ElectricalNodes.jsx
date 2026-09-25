/**
 * React-Flow Custom Nodes for Electrical Components
 * These nodes use @xyflow/react for the diagram editor
 */
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { PhaseColors } from '../definitions/electricalComponents';

// Base node styles
const baseNodeStyle = {
  padding: '8px',
  borderRadius: '4px',
  fontSize: '12px',
  border: '2px solid #333',
  backgroundColor: '#fff',
  minWidth: '60px',
  textAlign: 'center',
};

const labelStyle = {
  fontSize: '10px',
  fontWeight: 'bold',
  marginBottom: '4px',
};

const valueStyle = {
  fontSize: '9px',
  color: '#666',
};

// Handle styles by phase
const getHandleStyle = (type) => {
  switch (type) {
    case 'ac_phase_a':
      return { backgroundColor: PhaseColors.A };
    case 'ac_phase_b':
      return { backgroundColor: PhaseColors.B };
    case 'ac_phase_c':
      return { backgroundColor: PhaseColors.C };
    case 'neutral':
      return { backgroundColor: PhaseColors.N };
    case 'earth':
      return { backgroundColor: PhaseColors.E };
    case 'dc_positive':
      return { backgroundColor: PhaseColors.DC_P };
    case 'dc_negative':
      return { backgroundColor: PhaseColors.DC_N };
    default:
      return { backgroundColor: '#888' };
  }
};

// ============================================
// POWER SOURCE NODES
// ============================================

export const ACSource1PhNode = memo(({ data }) => {
  const { label, voltage, frequency, state = {} } = data;
  const isActive = state.voltage > 0;
  
  return (
    <div style={{ ...baseNodeStyle, borderColor: isActive ? '#22c55e' : '#333' }}>
      <Handle type="target" position={Position.Left} id="phase" 
        style={{ ...getHandleStyle('ac_phase_a'), top: '30%' }} />
      <Handle type="target" position={Position.Left} id="neutral" 
        style={{ ...getHandleStyle('neutral'), top: '70%' }} />
      
      <div style={labelStyle}>{label || 'Vs'}</div>
      <svg viewBox="0 0 40 40" width="40" height="40">
        <circle cx="20" cy="20" r="15" fill="none" stroke={isActive ? '#22c55e' : '#333'} strokeWidth="2" />
        <path d="M8,20 Q14,10 20,20 Q26,30 32,20" fill="none" stroke={isActive ? '#22c55e' : '#333'} strokeWidth="1.5" />
      </svg>
      <div style={valueStyle}>{voltage}V {frequency}Hz</div>
      
      <Handle type="source" position={Position.Right} id="phase_out" 
        style={{ ...getHandleStyle('ac_phase_a'), top: '30%' }} />
      <Handle type="source" position={Position.Right} id="neutral_out" 
        style={{ ...getHandleStyle('neutral'), top: '70%' }} />
    </div>
  );
});

export const ACSource3PhNode = memo(({ data }) => {
  const { label, voltage, frequency, state = {} } = data;
  const isActive = state.voltage > 0;
  
  return (
    <div style={{ ...baseNodeStyle, borderColor: isActive ? '#22c55e' : '#333', minWidth: '80px' }}>
      <Handle type="target" position={Position.Left} id="a" 
        style={{ ...getHandleStyle('ac_phase_a'), top: '20%' }} />
      <Handle type="target" position={Position.Left} id="b" 
        style={{ ...getHandleStyle('ac_phase_b'), top: '40%' }} />
      <Handle type="target" position={Position.Left} id="c" 
        style={{ ...getHandleStyle('ac_phase_c'), top: '60%' }} />
      <Handle type="target" position={Position.Left} id="n" 
        style={{ ...getHandleStyle('neutral'), top: '80%' }} />
      
      <div style={labelStyle}>{label || 'Grid'}</div>
      <svg viewBox="0 0 50 60" width="50" height="60">
        <circle cx="25" cy="30" r="20" fill="none" stroke={isActive ? '#22c55e' : '#333'} strokeWidth="2" />
        <path d="M10,30 Q17,15 25,30 Q33,45 40,30" fill="none" stroke={isActive ? '#22c55e' : '#333'} strokeWidth="1.5" />
        <text x="25" y="35" textAnchor="middle" fontSize="10" fill="#333">3~</text>
      </svg>
      <div style={valueStyle}>{voltage}V {frequency}Hz</div>
      
      <Handle type="source" position={Position.Right} id="a_out" 
        style={{ ...getHandleStyle('ac_phase_a'), top: '20%' }} />
      <Handle type="source" position={Position.Right} id="b_out" 
        style={{ ...getHandleStyle('ac_phase_b'), top: '40%' }} />
      <Handle type="source" position={Position.Right} id="c_out" 
        style={{ ...getHandleStyle('ac_phase_c'), top: '60%' }} />
      <Handle type="source" position={Position.Right} id="n_out" 
        style={{ ...getHandleStyle('neutral'), top: '80%' }} />
    </div>
  );
});

export const DCSourceNode = memo(({ data }) => {
  const { label, voltage, state = {} } = data;
  const isActive = state.voltage > 0;
  
  return (
    <div style={{ ...baseNodeStyle, borderColor: isActive ? '#22c55e' : '#333' }}>
      <Handle type="target" position={Position.Left} id="positive" 
        style={{ ...getHandleStyle('dc_positive'), top: '30%' }} />
      <Handle type="target" position={Position.Left} id="negative" 
        style={{ ...getHandleStyle('dc_negative'), top: '70%' }} />
      
      <div style={labelStyle}>{label || 'Bat'}</div>
      <svg viewBox="0 0 40 40" width="40" height="40">
        <rect x="10" y="15" width="20" height="10" fill="none" stroke={isActive ? '#22c55e' : '#333'} strokeWidth="2" />
        <line x1="30" y1="18" x2="35" y2="18" stroke={isActive ? '#22c55e' : '#333'} strokeWidth="2" />
        <line x1="32.5" y1="15" x2="32.5" y2="21" stroke={isActive ? '#22c55e' : '#333'} strokeWidth="2" />
        <line x1="5" y1="20" x2="10" y2="20" stroke={isActive ? '#22c55e' : '#333'} strokeWidth="2" />
      </svg>
      <div style={valueStyle}>{voltage}V DC</div>
      
      <Handle type="source" position={Position.Right} id="positive_out" 
        style={{ ...getHandleStyle('dc_positive'), top: '30%' }} />
      <Handle type="source" position={Position.Right} id="negative_out" 
        style={{ ...getHandleStyle('dc_negative'), top: '70%' }} />
    </div>
  );
});

// ============================================
// TRANSFORMER NODES
// ============================================

export const Transformer2WNode = memo(({ data }) => {
  const { label, ratedPower, primaryVoltage, secondaryVoltage, state = {} } = data;
  const loading = state.loading || 0;
  const loadingColor = loading > 100 ? '#ef4444' : loading > 80 ? '#f59e0b' : '#22c55e';
  
  return (
    <div style={{ ...baseNodeStyle, minWidth: '100px' }}>
      {/* Primary terminals */}
      <Handle type="target" position={Position.Left} id="hv_a" 
        style={{ ...getHandleStyle('ac_phase_a'), top: '15%' }} />
      <Handle type="target" position={Position.Left} id="hv_b" 
        style={{ ...getHandleStyle('ac_phase_b'), top: '35%' }} />
      <Handle type="target" position={Position.Left} id="hv_c" 
        style={{ ...getHandleStyle('ac_phase_c'), top: '55%' }} />
      <Handle type="target" position={Position.Left} id="hv_n" 
        style={{ ...getHandleStyle('neutral'), top: '75%' }} />
      
      <div style={labelStyle}>{label || 'Trf'}</div>
      <svg viewBox="0 0 80 80" width="80" height="80">
        {/* Primary winding */}
        <circle cx="25" cy="30" r="15" fill="none" stroke="#333" strokeWidth="2" />
        {/* Secondary winding */}
        <circle cx="25" cy="50" r="15" fill="none" stroke="#333" strokeWidth="2" />
        {/* Core */}
        <line x1="45" y1="15" x2="45" y2="65" stroke="#333" strokeWidth="3" />
        {/* Connection lines */}
        <line x1="10" y1="30" x2="10" y2="50" stroke="#333" strokeWidth="1" />
        {/* Loading indicator */}
        {loading > 0 && (
          <text x="60" y="45" fontSize="10" fill={loadingColor}>{loading.toFixed(0)}%</text>
        )}
      </svg>
      <div style={valueStyle}>{ratedPower}kVA</div>
      <div style={valueStyle}>{primaryVoltage}/{secondaryVoltage}V</div>
      
      {/* Secondary terminals */}
      <Handle type="source" position={Position.Right} id="lv_a" 
        style={{ ...getHandleStyle('ac_phase_a'), top: '15%' }} />
      <Handle type="source" position={Position.Right} id="lv_b" 
        style={{ ...getHandleStyle('ac_phase_b'), top: '35%' }} />
      <Handle type="source" position={Position.Right} id="lv_c" 
        style={{ ...getHandleStyle('ac_phase_c'), top: '55%' }} />
      <Handle type="source" position={Position.Right} id="lv_n" 
        style={{ ...getHandleStyle('neutral'), top: '75%' }} />
    </div>
  );
});

// ============================================
// SWITCHGEAR NODES
// ============================================

export const CircuitBreakerNode = memo(({ data }) => {
  const { label, ratedCurrent, state = {} } = data;
  const { closed = false, tripped = false } = state;
  
  const getStatusColor = () => {
    if (tripped) return '#ef4444';
    if (closed) return '#22c55e';
    return '#666';
  };
  
  return (
    <div style={{ ...baseNodeStyle, borderColor: getStatusColor(), minWidth: '70px' }}>
      <Handle type="target" position={Position.Left} id="in_1" 
        style={{ ...getHandleStyle('ac_phase_a'), top: '20%' }} />
      <Handle type="target" position={Position.Left} id="in_2" 
        style={{ ...getHandleStyle('ac_phase_b'), top: '50%' }} />
      <Handle type="target" position={Position.Left} id="in_3" 
        style={{ ...getHandleStyle('ac_phase_c'), top: '80%' }} />
      
      <div style={{ ...labelStyle, color: getStatusColor() }}>{label || 'CB'}</div>
      <svg viewBox="0 0 50 60" width="50" height="60">
        {/* Contacts */}
        <circle cx="15" cy="15" r="5" fill="none" stroke="#333" strokeWidth="2" />
        <circle cx="15" cy="30" r="5" fill="none" stroke="#333" strokeWidth="2" />
        <circle cx="15" cy="45" r="5" fill="none" stroke="#333" strokeWidth="2" />
        
        {/* Moving contact */}
        <line x1="20" y1="15" x2="35" y2={closed ? 15 : 25} stroke={getStatusColor()} strokeWidth="2" />
        <line x1="20" y1="30" x2="35" y2={closed ? 30 : 40} stroke={getStatusColor()} strokeWidth="2" />
        <line x1="20" y1="45" x2="35" y2={closed ? 45 : 55} stroke={getStatusColor()} strokeWidth="2" />
        
        {/* Fixed contact */}
        <line x1="35" y1="15" x2="45" y2="15" stroke="#333" strokeWidth="2" />
        <line x1="35" y1="30" x2="45" y2="30" stroke="#333" strokeWidth="2" />
        <line x1="35" y1="45" x2="45" y2="45" stroke="#333" strokeWidth="2" />
        
        {/* Trip indicator */}
        {tripped && (
          <text x="25" y="58" textAnchor="middle" fontSize="8" fill="#ef4444">TRIP</text>
        )}
      </svg>
      <div style={valueStyle}>{ratedCurrent}A</div>
      
      <Handle type="source" position={Position.Right} id="out_1" 
        style={{ ...getHandleStyle('ac_phase_a'), top: '20%' }} />
      <Handle type="source" position={Position.Right} id="out_2" 
        style={{ ...getHandleStyle('ac_phase_b'), top: '50%' }} />
      <Handle type="source" position={Position.Right} id="out_3" 
        style={{ ...getHandleStyle('ac_phase_c'), top: '80%' }} />
    </div>
  );
});

export const FuseNode = memo(({ data }) => {
  const { label, ratedCurrent, state = {} } = data;
  const { blown = false } = state;
  
  return (
    <div style={{ ...baseNodeStyle, borderColor: blown ? '#ef4444' : '#333', minWidth: '50px' }}>
      <Handle type="target" position={Position.Left} id="in" 
        style={{ ...getHandleStyle('ac_phase_a'), top: '50%' }} />
      
      <div style={{ ...labelStyle, color: blown ? '#ef4444' : '#333' }}>{label || 'F'}</div>
      <svg viewBox="0 0 40 20" width="40" height="20">
        <rect x="5" y="5" width="30" height="10" fill="none" stroke={blown ? '#ef4444' : '#333'} strokeWidth="2" rx="2" />
        <line x1="0" y1="10" x2="5" y2="10" stroke="#333" strokeWidth="2" />
        <line x1="35" y1="10" x2="40" y2="10" stroke="#333" strokeWidth="2" />
        {blown && <line x1="10" y1="5" x2="30" y2="15" stroke="#ef4444" strokeWidth="2" />}
      </svg>
      <div style={valueStyle}>{ratedCurrent}A</div>
      
      <Handle type="source" position={Position.Right} id="out" 
        style={{ ...getHandleStyle('ac_phase_a'), top: '50%' }} />
    </div>
  );
});

export const ContactorNode = memo(({ data }) => {
  const { label, ratedCurrent, state = {} } = data;
  const { energized = false } = state;
  
  return (
    <div style={{ ...baseNodeStyle, borderColor: energized ? '#22c55e' : '#333', minWidth: '70px' }}>
      <Handle type="target" position={Position.Left} id="l1_in" 
        style={{ ...getHandleStyle('ac_phase_a'), top: '20%' }} />
      <Handle type="target" position={Position.Left} id="l2_in" 
        style={{ ...getHandleStyle('ac_phase_b'), top: '40%' }} />
      <Handle type="target" position={Position.Left} id="l3_in" 
        style={{ ...getHandleStyle('ac_phase_c'), top: '60%' }} />
      <Handle type="target" position={Position.Top} id="a1" 
        style={{ ...getHandleStyle('control'), left: '30%' }} />
      <Handle type="target" position={Position.Top} id="a2" 
        style={{ ...getHandleStyle('control'), left: '70%' }} />
      
      <div style={labelStyle}>{label || 'K'}</div>
      <svg viewBox="0 0 50 50" width="50" height="50">
        {/* Main contacts */}
        <line x1="5" y1="10" x2="15" y2="10" stroke="#333" strokeWidth="2" />
        <line x1="5" y1="25" x2="15" y2="25" stroke="#333" strokeWidth="2" />
        <line x1="5" y1="40" x2="15" y2="40" stroke="#333" strokeWidth="2" />
        
        {/* Moving contacts */}
        <line x1="15" y1="10" x2="35" y2={energized ? 10 : 20} stroke={energized ? '#22c55e' : '#333'} strokeWidth="2" />
        <line x1="15" y1="25" x2="35" y2={energized ? 25 : 35} stroke={energized ? '#22c55e' : '#333'} strokeWidth="2" />
        <line x1="15" y1="40" x2="35" y2={energized ? 40 : 50} stroke={energized ? '#22c55e' : '#333'} strokeWidth="2" />
        
        {/* Fixed contacts */}
        <line x1="35" y1="10" x2="45" y2="10" stroke="#333" strokeWidth="2" />
        <line x1="35" y1="25" x2="45" y2="25" stroke="#333" strokeWidth="2" />
        <line x1="35" y1="40" x2="45" y2="40" stroke="#333" strokeWidth="2" />
      </svg>
      <div style={valueStyle}>{ratedCurrent}A</div>
      
      <Handle type="source" position={Position.Right} id="t1_out" 
        style={{ ...getHandleStyle('ac_phase_a'), top: '20%' }} />
      <Handle type="source" position={Position.Right} id="t2_out" 
        style={{ ...getHandleStyle('ac_phase_b'), top: '40%' }} />
      <Handle type="source" position={Position.Right} id="t3_out" 
        style={{ ...getHandleStyle('ac_phase_c'), top: '60%' }} />
    </div>
  );
});

// ============================================
// ROTATING MACHINE NODES
// ============================================

export const InductionMotorNode = memo(({ data }) => {
  const { label, ratedPower, ratedSpeed, state = {} } = data;
  const { running = false, speed = 0, current = 0 } = state;
  
  return (
    <div style={{ ...baseNodeStyle, borderColor: running ? '#22c55e' : '#333', minWidth: '80px' }}>
      <Handle type="target" position={Position.Left} id="u" 
        style={{ ...getHandleStyle('ac_phase_a'), top: '25%' }} />
      <Handle type="target" position={Position.Left} id="v" 
        style={{ ...getHandleStyle('ac_phase_b'), top: '50%' }} />
      <Handle type="target" position={Position.Left} id="w" 
        style={{ ...getHandleStyle('ac_phase_c'), top: '75%' }} />
      
      <div style={labelStyle}>{label || 'M'}</div>
      <svg viewBox="0 0 60 60" width="60" height="60">
        {/* Motor body */}
        <circle cx="30" cy="30" r="25" fill="none" stroke={running ? '#22c55e' : '#333'} strokeWidth="2" />
        
        {/* Shaft */}
        <line x1="55" y1="30" x2="65" y2="30" stroke="#333" strokeWidth="3" />
        
        {/* M symbol */}
        <text x="30" y="35" textAnchor="middle" fontSize="14" fontWeight="bold" fill={running ? '#22c55e' : '#333'}>M</text>
        
        {/* Rotation indicator */}
        {running && (
          <>
            <path d="M45,15 A20,20 0 0,1 45,45" fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="3,2" />
            <polygon points="45,45 40,40 48,42" fill="#22c55e" />
          </>
        )}
      </svg>
      <div style={valueStyle}>{ratedPower}kW</div>
      <div style={valueStyle}>{running ? `${speed} RPM` : `${ratedSpeed} RPM`}</div>
      
      <Handle type="source" position={Position.Right} id="shaft" 
        style={{ backgroundColor: '#888', top: '50%' }} />
    </div>
  );
});

export const SynchronousMotorNode = memo(({ data }) => {
  const { label, ratedPower, ratedSpeed, state = {} } = data;
  const { running = false, speed = 0 } = state;
  
  return (
    <div style={{ ...baseNodeStyle, borderColor: running ? '#22c55e' : '#333', minWidth: '80px' }}>
      <Handle type="target" position={Position.Left} id="u" 
        style={{ ...getHandleStyle('ac_phase_a'), top: '20%' }} />
      <Handle type="target" position={Position.Left} id="v" 
        style={{ ...getHandleStyle('ac_phase_b'), top: '35%' }} />
      <Handle type="target" position={Position.Left} id="w" 
        style={{ ...getHandleStyle('ac_phase_c'), top: '50%' }} />
      <Handle type="target" position={Position.Left} id="field+" 
        style={{ ...getHandleStyle('dc_positive'), top: '70%' }} />
      <Handle type="target" position={Position.Left} id="field-" 
        style={{ ...getHandleStyle('dc_negative'), top: '85%' }} />
      
      <div style={labelStyle}>{label || 'SM'}</div>
      <svg viewBox="0 0 60 70" width="60" height="70">
        {/* Motor body */}
        <circle cx="30" cy="30" r="25" fill="none" stroke={running ? '#22c55e' : '#333'} strokeWidth="2" />
        
        {/* Shaft */}
        <line x1="55" y1="30" x2="65" y2="30" stroke="#333" strokeWidth="3" />
        
        {/* SM symbol */}
        <text x="30" y="30" textAnchor="middle" fontSize="10" fontWeight="bold" fill={running ? '#22c55e' : '#333'}>SM</text>
        
        {/* Excitation indicator */}
        <rect x="20" y="40" width="20" height="10" fill="none" stroke="#333" strokeWidth="1" />
        <text x="30" y="48" textAnchor="middle" fontSize="6" fill="#333">EXC</text>
      </svg>
      <div style={valueStyle}>{ratedPower}kW Sync</div>
      
      <Handle type="source" position={Position.Right} id="shaft" 
        style={{ backgroundColor: '#888', top: '40%' }} />
    </div>
  );
});

// ============================================
// PROTECTION NODES
// ============================================

export const CTNode = memo(({ data }) => {
  const { label, primaryCurrent, secondaryCurrent, state = {} } = data;
  const currentValue = state.current || 0;
  
  return (
    <div style={{ ...baseNodeStyle, minWidth: '50px' }}>
      <Handle type="target" position={Position.Left} id="p1" 
        style={{ ...getHandleStyle('ac_phase_a'), top: '35%' }} />
      <Handle type="source" position={Position.Right} id="p2" 
        style={{ ...getHandleStyle('ac_phase_a'), top: '35%' }} />
      <Handle type="source" position={Position.Bottom} id="s1" 
        style={{ ...getHandleStyle('signal'), left: '30%' }} />
      <Handle type="source" position={Position.Bottom} id="s2" 
        style={{ ...getHandleStyle('signal'), left: '70%' }} />
      
      <div style={labelStyle}>{label || 'CT'}</div>
      <svg viewBox="0 0 40 40" width="40" height="40">
        {/* Primary through */}
        <line x1="0" y1="15" x2="40" y2="15" stroke="#333" strokeWidth="2" />
        
        {/* CT core */}
        <circle cx="20" cy="25" r="10" fill="none" stroke="#333" strokeWidth="2" />
        
        {/* Secondary leads */}
        <line x1="15" y1="35" x2="15" y2="40" stroke="#333" strokeWidth="1" />
        <line x1="25" y1="35" x2="25" y2="40" stroke="#333" strokeWidth="1" />
      </svg>
      <div style={valueStyle}>{primaryCurrent}/{secondaryCurrent}A</div>
    </div>
  );
});

export const RelayOCNode = memo(({ data }) => {
  const { label, pickupCurrent, timeDial, state = {} } = data;
  const { tripped = false, pickup = false } = state;
  
  const getStatusColor = () => {
    if (tripped) return '#ef4444';
    if (pickup) return '#f59e0b';
    return '#333';
  };
  
  return (
    <div style={{ ...baseNodeStyle, borderColor: getStatusColor(), minWidth: '60px' }}>
      <Handle type="target" position={Position.Left} id="ct_in" 
        style={{ ...getHandleStyle('signal'), top: '50%' }} />
      <Handle type="source" position={Position.Right} id="trip" 
        style={{ ...getHandleStyle('control'), top: '50%' }} />
      
      <div style={{ ...labelStyle, color: getStatusColor() }}>{label || '51'}</div>
      <svg viewBox="0 0 50 40" width="50" height="40">
        {/* Relay body */}
        <rect x="5" y="5" width="40" height="30" fill="none" stroke={getStatusColor()} strokeWidth="2" rx="3" />
        
        {/* I> symbol */}
        <text x="25" y="22" textAnchor="middle" fontSize="10" fill={getStatusColor()}>I&#62;</text>
        
        {/* Status indicator */}
        {tripped && <circle cx="40" cy="10" r="3" fill="#ef4444" />}
        {pickup && !tripped && <circle cx="40" cy="10" r="3" fill="#f59e0b" />}
      </svg>
      <div style={valueStyle}>{pickupCurrent}×In @ T{timeDial}</div>
    </div>
  );
});

// ============================================
// MEASUREMENT NODES
// ============================================

export const AmmeterNode = memo(({ data }) => {
  const { label, range, state = {} } = data;
  const value = state.value || 0;
  const percentage = (value / range) * 100;
  
  return (
    <div style={{ ...baseNodeStyle, minWidth: '50px' }}>
      <Handle type="target" position={Position.Left} id="in" 
        style={{ ...getHandleStyle('signal'), top: '50%' }} />
      <Handle type="source" position={Position.Right} id="out" 
        style={{ ...getHandleStyle('signal'), top: '50%' }} />
      
      <div style={labelStyle}>{label || 'A'}</div>
      <svg viewBox="0 0 40 40" width="40" height="40">
        {/* Meter circle */}
        <circle cx="20" cy="20" r="15" fill="#fff" stroke="#333" strokeWidth="2" />
        
        {/* Scale arc */}
        <path d="M8,25 A15,15 0 0,1 32,25" fill="none" stroke="#ddd" strokeWidth="3" />
        
        {/* Value arc */}
        <path d="M8,25 A15,15 0 0,1 32,25" fill="none" stroke="#3b82f6" strokeWidth="3" 
          strokeDasharray={`${percentage * 0.4} 100`} />
        
        {/* Needle */}
        <line x1="20" y1="20" x2={20 + 10 * Math.cos(Math.PI - (percentage / 100) * Math.PI)} 
          y2={20 - 10 * Math.sin(Math.PI - (percentage / 100) * Math.PI)} 
          stroke="#ef4444" strokeWidth="1" />
        
        {/* A symbol */}
        <text x="20" y="35" textAnchor="middle" fontSize="8" fill="#333">A</text>
      </svg>
      <div style={{ ...valueStyle, fontWeight: 'bold' }}>{value.toFixed(1)}A</div>
    </div>
  );
});

export const VoltmeterNode = memo(({ data }) => {
  const { label, range, state = {} } = data;
  const value = state.value || 0;
  const percentage = (value / range) * 100;
  
  return (
    <div style={{ ...baseNodeStyle, minWidth: '50px' }}>
      <Handle type="target" position={Position.Left} id="in" 
        style={{ ...getHandleStyle('signal'), top: '35%' }} />
      <Handle type="target" position={Position.Left} id="com" 
        style={{ ...getHandleStyle('neutral'), top: '65%' }} />
      
      <div style={labelStyle}>{label || 'V'}</div>
      <svg viewBox="0 0 40 40" width="40" height="40">
        {/* Meter circle */}
        <circle cx="20" cy="20" r="15" fill="#fff" stroke="#333" strokeWidth="2" />
        
        {/* Scale arc */}
        <path d="M8,25 A15,15 0 0,1 32,25" fill="none" stroke="#ddd" strokeWidth="3" />
        
        {/* Value arc */}
        <path d="M8,25 A15,15 0 0,1 32,25" fill="none" stroke="#22c55e" strokeWidth="3" 
          strokeDasharray={`${percentage * 0.4} 100`} />
        
        {/* V symbol */}
        <text x="20" y="35" textAnchor="middle" fontSize="8" fill="#333">V</text>
      </svg>
      <div style={{ ...valueStyle, fontWeight: 'bold' }}>{value.toFixed(1)}V</div>
    </div>
  );
});

export const WattmeterNode = memo(({ data }) => {
  const { label, range, state = {} } = data;
  const value = state.value || 0;
  const pf = state.powerFactor || 1;
  
  return (
    <div style={{ ...baseNodeStyle, minWidth: '60px' }}>
      <Handle type="target" position={Position.Left} id="v_in" 
        style={{ ...getHandleStyle('signal'), top: '25%' }} />
      <Handle type="target" position={Position.Left} id="v_com" 
        style={{ ...getHandleStyle('neutral'), top: '40%' }} />
      <Handle type="target" position={Position.Left} id="i_in" 
        style={{ ...getHandleStyle('signal'), top: '55%' }} />
      <Handle type="source" position={Position.Left} id="i_out" 
        style={{ ...getHandleStyle('signal'), top: '70%' }} />
      
      <div style={labelStyle}>{label || 'W'}</div>
      <svg viewBox="0 0 50 40" width="50" height="40">
        {/* Meter body */}
        <rect x="5" y="5" width="40" height="30" fill="#fff" stroke="#333" strokeWidth="2" rx="3" />
        
        {/* Digital display */}
        <rect x="10" y="10" width="30" height="15" fill="#1a1a1a" rx="1" />
        <text x="25" y="21" textAnchor="middle" fontSize="8" fill="#22c55e">{value.toFixed(1)}</text>
        
        {/* kW label */}
        <text x="25" y="32" textAnchor="middle" fontSize="6" fill="#333">kW</text>
      </svg>
      <div style={valueStyle}>PF: {pf.toFixed(2)}</div>
    </div>
  );
});

// ============================================
// POWER ELECTRONICS NODES
// ============================================

export const VFDNode = memo(({ data }) => {
  const { label, ratedPower, state = {} } = data;
  const { running = false, outputFrequency = 0, current = 0 } = state;
  
  return (
    <div style={{ ...baseNodeStyle, borderColor: running ? '#22c55e' : '#333', minWidth: '100px' }}>
      <Handle type="target" position={Position.Left} id="l1" 
        style={{ ...getHandleStyle('ac_phase_a'), top: '20%' }} />
      <Handle type="target" position={Position.Left} id="l2" 
        style={{ ...getHandleStyle('ac_phase_b'), top: '40%' }} />
      <Handle type="target" position={Position.Left} id="l3" 
        style={{ ...getHandleStyle('ac_phase_c'), top: '60%' }} />
      <Handle type="target" position={Position.Top} id="ctrl" 
        style={{ ...getHandleStyle('control'), left: '50%' }} />
      
      <div style={labelStyle}>{label || 'VFD'}</div>
      <svg viewBox="0 0 80 60" width="80" height="60">
        {/* VFD body */}
        <rect x="5" y="5" width="70" height="50" fill="#f0f0f0" stroke={running ? '#22c55e' : '#333'} strokeWidth="2" rx="3" />
        
        {/* Display */}
        <rect x="10" y="10" width="40" height="20" fill="#1a1a1a" rx="2" />
        <text x="30" y="24" textAnchor="middle" fontSize="10" fill="#22c55e">{outputFrequency.toFixed(1)}Hz</text>
        
        {/* Status LEDs */}
        <circle cx="60" cy="15" r="3" fill={running ? '#22c55e' : '#666'} />
        <circle cx="60" cy="25" r="3" fill="#666" />
        
        {/* Terminals representation */}
        <rect x="10" y="35" width="60" height="15" fill="#ddd" stroke="#333" strokeWidth="1" />
        <text x="40" y="45" textAnchor="middle" fontSize="6" fill="#333">U V W</text>
      </svg>
      <div style={valueStyle}>{ratedPower}kW</div>
      
      <Handle type="source" position={Position.Right} id="u" 
        style={{ ...getHandleStyle('ac_phase_a'), top: '20%' }} />
      <Handle type="source" position={Position.Right} id="v" 
        style={{ ...getHandleStyle('ac_phase_b'), top: '40%' }} />
      <Handle type="source" position={Position.Right} id="w" 
        style={{ ...getHandleStyle('ac_phase_c'), top: '60%' }} />
    </div>
  );
});

// ============================================
// CONTROL NODES
// ============================================

export const PLCNode = memo(({ data }) => {
  const { label, inputs = 4, outputs = 4, state = {} } = data;
  const inputValues = state.inputValues || [];
  const outputValues = state.outputValues || [];
  
  return (
    <div style={{ ...baseNodeStyle, minWidth: '80px', backgroundColor: '#f8f8f8' }}>
      {/* Input handles */}
      {Array.from({ length: inputs }).map((_, i) => (
        <Handle key={`i${i}`} type="target" position={Position.Left} id={`i${i}`}
          style={{ ...getHandleStyle('control'), top: `${15 + i * 15}%` }} />
      ))}
      <Handle type="target" position={Position.Left} id="com_i" 
        style={{ ...getHandleStyle('control'), top: '90%' }} />
      
      <div style={labelStyle}>{label || 'PLC'}</div>
      <svg viewBox="0 0 70 80" width="70" height="80">
        {/* PLC body */}
        <rect x="5" y="5" width="60" height="70" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" rx="3" />
        
        {/* Status LEDs */}
        <circle cx="15" cy="15" r="3" fill="#22c55e" />
        <circle cx="25" cy="15" r="3" fill="#f59e0b" />
        
        {/* Input indicators */}
        {Array.from({ length: Math.min(inputs, 4) }).map((_, i) => (
          <rect key={`in${i}`} x={15 + i * 12} y={25} width="8" height="8" 
            fill={inputValues[i] ? '#22c55e' : '#1a1a1a'} rx="1" />
        ))}
        
        {/* Output indicators */}
        {Array.from({ length: Math.min(outputs, 4) }).map((_, i) => (
          <rect key={`out${i}`} x={15 + i * 12} y={40} width="8" height="8" 
            fill={outputValues[i] ? '#22c55e' : '#1a1a1a'} rx="1" />
        ))}
        
        {/* Labels */}
        <text x="35" y="60" textAnchor="middle" fontSize="8" fill="#fff">IN</text>
        <text x="35" y="70" textAnchor="middle" fontSize="8" fill="#fff">OUT</text>
      </svg>
      <div style={valueStyle}>{inputs}I/{outputs}O</div>
      
      {/* Output handles */}
      {Array.from({ length: outputs }).map((_, i) => (
        <Handle key={`q${i}`} type="source" position={Position.Right} id={`q${i}`}
          style={{ ...getHandleStyle('control'), top: `${15 + i * 15}%` }} />
      ))}
      <Handle type="source" position={Position.Right} id="com_o" 
        style={{ ...getHandleStyle('control'), top: '90%' }} />
      <Handle type="target" position={Position.Top} id="v+" 
        style={{ ...getHandleStyle('dc_positive'), left: '30%' }} />
      <Handle type="target" position={Position.Top} id="v-" 
        style={{ ...getHandleStyle('dc_negative'), left: '70%' }} />
    </div>
  );
});

export const PushButtonNode = memo(({ data }) => {
  const { label, color = 'Green', state = {} } = data;
  const { pressed = false } = state;
  
  const buttonColors = {
    Red: '#ef4444',
    Green: '#22c55e',
    Yellow: '#f59e0b',
    Blue: '#3b82f6',
    Black: '#1a1a1a',
    White: '#e5e5e5',
  };
  
  return (
    <div style={{ ...baseNodeStyle, minWidth: '40px' }}>
      <Handle type="target" position={Position.Left} id="no_com" 
        style={{ ...getHandleStyle('control'), top: '30%' }} />
      <Handle type="source" position={Position.Right} id="no" 
        style={{ ...getHandleStyle('control'), top: '30%' }} />
      <Handle type="target" position={Position.Left} id="nc_com" 
        style={{ ...getHandleStyle('control'), top: '70%' }} />
      <Handle type="source" position={Position.Right} id="nc" 
        style={{ ...getHandleStyle('control'), top: '70%' }} />
      
      <div style={labelStyle}>{label || 'PB'}</div>
      <svg viewBox="0 0 30 40" width="30" height="40">
        {/* Button body */}
        <circle cx="15" cy="20" r="12" fill={pressed ? buttonColors[color] : '#fff'} 
          stroke={buttonColors[color]} strokeWidth="2" />
        
        {/* Shadow/highlight */}
        <circle cx="15" cy="20" r="8" fill="none" stroke={pressed ? '#fff' : '#ddd'} strokeWidth="1" />
      </svg>
    </div>
  );
});

export const LampNode = memo(({ data }) => {
  const { label, color = 'Red', state = {} } = data;
  const { on = false } = state;
  
  const lampColors = {
    Red: '#ef4444',
    Green: '#22c55e',
    Yellow: '#f59e0b',
    Blue: '#3b82f6',
    White: '#e5e5e5',
    Amber: '#fbbf24',
  };
  
  return (
    <div style={{ ...baseNodeStyle, minWidth: '40px' }}>
      <Handle type="target" position={Position.Left} id="a1" 
        style={{ ...getHandleStyle('control'), top: '50%' }} />
      
      <div style={labelStyle}>{label || 'H'}</div>
      <svg viewBox="0 0 30 30" width="30" height="30">
        {/* Lamp body */}
        <circle cx="15" cy="15" r="12" 
          fill={on ? lampColors[color] : '#666'} 
          stroke="#333" strokeWidth="2" />
        
        {/* Glow effect when on */}
        {on && (
          <circle cx="15" cy="15" r="14" fill="none" 
            stroke={lampColors[color]} strokeWidth="1" opacity="0.5" />
        )}
      </svg>
      
      <Handle type="target" position={Position.Right} id="a2" 
        style={{ ...getHandleStyle('control'), top: '50%' }} />
    </div>
  );
});

// ============================================
// LOAD NODE
// ============================================

export const LoadNode = memo(({ data }) => {
  const { label, activePower, reactivePower, state = {} } = data;
  const currentA = state.currentA || 0;
  const currentB = state.currentB || 0;
  const currentC = state.currentC || 0;
  const hasLoad = currentA > 0 || currentB > 0 || currentC > 0;
  
  return (
    <div style={{ ...baseNodeStyle, borderColor: hasLoad ? '#3b82f6' : '#333', minWidth: '60px' }}>
      <Handle type="target" position={Position.Left} id="a" 
        style={{ ...getHandleStyle('ac_phase_a'), top: '20%' }} />
      <Handle type="target" position={Position.Left} id="b" 
        style={{ ...getHandleStyle('ac_phase_b'), top: '40%' }} />
      <Handle type="target" position={Position.Left} id="c" 
        style={{ ...getHandleStyle('ac_phase_c'), top: '60%' }} />
      <Handle type="target" position={Position.Left} id="n" 
        style={{ ...getHandleStyle('neutral'), top: '80%' }} />
      
      <div style={labelStyle}>{label || 'Load'}</div>
      <svg viewBox="0 0 50 50" width="50" height="50">
        {/* Load symbol - zigzag resistor */}
        <path d="M10,10 L15,15 L10,20 L15,25 L10,30 L15,35 L10,40" 
          fill="none" stroke={hasLoad ? '#3b82f6' : '#333'} strokeWidth="2" />
        <line x1="10" y1="10" x2="10" y2="5" stroke="#333" strokeWidth="2" />
        <line x1="10" y1="40" x2="10" y2="45" stroke="#333" strokeWidth="2" />
        
        {/* Arrow for power direction */}
        <polygon points="25,25 20,20 20,30" fill={hasLoad ? '#3b82f6' : '#333'} />
      </svg>
      <div style={valueStyle}>{activePower}kW</div>
      <div style={valueStyle}>{reactivePower}kVAr</div>
    </div>
  );
});

// ============================================
// NODE TYPE MAP
// ============================================

export const nodeTypes = {
  // Power Sources
  ac_source_1ph: ACSource1PhNode,
  ac_source_3ph: ACSource3PhNode,
  dc_source: DCSourceNode,
  
  // Transformers
  transformer_2w: Transformer2WNode,
  
  // Switchgear
  circuit_breaker: CircuitBreakerNode,
  fuse: FuseNode,
  contactor: ContactorNode,
  
  // Rotating Machines
  induction_motor: InductionMotorNode,
  synchronous_motor: SynchronousMotorNode,
  
  // Protection
  ct: CTNode,
  relay_oc: RelayOCNode,
  
  // Measurement
  ammeter: AmmeterNode,
  voltmeter: VoltmeterNode,
  wattmeter: WattmeterNode,
  
  // Power Electronics
  vfd: VFDNode,
  
  // Control
  plc: PLCNode,
  pushbutton: PushButtonNode,
  lamp: LampNode,
  
  // Load
  load: LoadNode,
};

export default nodeTypes;
