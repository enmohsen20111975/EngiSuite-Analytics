/**
 * Instrumentation Panels for Electrical Simulator
 * Includes meters, gauges, oscilloscope, and power quality analyzer
 */
import React, { useState, useEffect, useRef, memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ComposedChart } from 'recharts';
import { PhaseColors } from '../definitions/electricalComponents';

// ============================================
// ANALOG GAUGE COMPONENT
// ============================================

export const AnalogGauge = memo(({
  value = 0,
  min = 0,
  max = 100,
  label = '',
  unit = '',
  warningLevel = 80,
  criticalLevel = 100,
  size = 120,
  showDigital = true,
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const angle = (percentage / 100) * 180 - 90; // -90 to 90 degrees
  
  // Determine color based on level
  const getColor = () => {
    if (percentage >= criticalLevel) return '#ef4444';
    if (percentage >= warningLevel) return '#f59e0b';
    return '#22c55e';
  };
  
  // Generate tick marks
  const ticks = [];
  const numTicks = 10;
  for (let i = 0; i <= numTicks; i++) {
    const tickAngle = (i / numTicks) * 180 - 90;
    const tickValue = min + (i / numTicks) * (max - min);
    const isMajor = i % 2 === 0;
    const innerRadius = isMajor ? size * 0.35 : size * 0.38;
    const outerRadius = size * 0.42;
    
    const x1 = size / 2 + innerRadius * Math.cos((tickAngle * Math.PI) / 180);
    const y1 = size / 2 + innerRadius * Math.sin((tickAngle * Math.PI) / 180);
    const x2 = size / 2 + outerRadius * Math.cos((tickAngle * Math.PI) / 180);
    const y2 = size / 2 + outerRadius * Math.sin((tickAngle * Math.PI) / 180);
    
    ticks.push(
      <g key={i}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#333" strokeWidth={isMajor ? 2 : 1} />
        {isMajor && (
          <text
            x={size / 2 + (innerRadius - 10) * Math.cos((tickAngle * Math.PI) / 180)}
            y={size / 2 + (innerRadius - 10) * Math.sin((tickAngle * Math.PI) / 180)}
            textAnchor="middle"
            fontSize="8"
            fill="#666"
          >
            {tickValue.toFixed(0)}
          </text>
        )}
      </g>
    );
  }
  
  return (
    <div className="analog-gauge" style={{ width: size, textAlign: 'center' }}>
      <svg viewBox={`0 0 ${size} ${size * 0.7}`} width={size} height={size * 0.7}>
        {/* Background arc */}
        <path
          d={`M ${size * 0.08} ${size * 0.5} A ${size * 0.42} ${size * 0.42} 0 0 1 ${size * 0.92} ${size * 0.5}`}
          fill="none"
          stroke="#e5e5e5"
          strokeWidth={size * 0.08}
        />
        
        {/* Colored arc */}
        <path
          d={`M ${size * 0.08} ${size * 0.5} A ${size * 0.42} ${size * 0.42} 0 0 1 ${size * 0.92} ${size * 0.5}`}
          fill="none"
          stroke={getColor()}
          strokeWidth={size * 0.08}
          strokeDasharray={`${percentage * 0.0132 * size} ${size}`}
          strokeLinecap="round"
        />
        
        {/* Tick marks */}
        {ticks}
        
        {/* Needle */}
        <g transform={`rotate(${angle}, ${size / 2}, ${size * 0.5})`}>
          <line
            x1={size / 2}
            y1={size * 0.5}
            x2={size / 2 + size * 0.35}
            y2={size * 0.5}
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx={size / 2} cy={size * 0.5} r="5" fill="#333" />
        </g>
        
        {/* Label */}
        <text
          x={size / 2}
          y={size * 0.62}
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill="#333"
        >
          {label}
        </text>
        
        {/* Unit */}
        <text
          x={size / 2}
          y={size * 0.68}
          textAnchor="middle"
          fontSize="8"
          fill="#666"
        >
          {unit}
        </text>
      </svg>
      
      {/* Digital readout */}
      {showDigital && (
        <div style={{
          backgroundColor: '#1a1a1a',
          color: getColor(),
          padding: '2px 8px',
          borderRadius: '3px',
          fontSize: '14px',
          fontFamily: 'monospace',
          marginTop: '-5px',
        }}>
          {value.toFixed(1)}
        </div>
      )}
    </div>
  );
});

// ============================================
// THREE-PHASE METER PANEL
// ============================================

export const ThreePhaseMeterPanel = memo(({
  title = 'Three-Phase Meter',
  voltages = [230, 230, 230],
  currents = [10, 10, 10],
  frequency = 50,
  powerFactor = 0.85,
  activePower = 0,
  reactivePower = 0,
}) => {
  const phases = ['A', 'B', 'C'];
  const phaseColors = [PhaseColors.A, PhaseColors.B, PhaseColors.C];
  
  return (
    <div className="three-phase-meter" style={{
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      padding: '16px',
      border: '1px solid #ddd',
    }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>{title}</h4>
      
      {/* Voltage gauges */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '16px' }}>
        {phases.map((phase, i) => (
          <div key={phase} style={{ textAlign: 'center' }}>
            <AnalogGauge
              value={voltages[i]}
              min={0}
              max={500}
              label={`V${phase}`}
              unit="V"
              warningLevel={95}
              criticalLevel={110}
              size={80}
            />
          </div>
        ))}
      </div>
      
      {/* Current gauges */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '16px' }}>
        {phases.map((phase, i) => (
          <div key={phase} style={{ textAlign: 'center' }}>
            <AnalogGauge
              value={currents[i]}
              min={0}
              max={100}
              label={`I${phase}`}
              unit="A"
              warningLevel={80}
              criticalLevel={100}
              size={80}
            />
          </div>
        ))}
      </div>
      
      {/* Digital readings */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        backgroundColor: '#1a1a1a',
        padding: '12px',
        borderRadius: '4px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#888', fontSize: '10px' }}>Frequency</div>
          <div style={{ color: '#22c55e', fontSize: '16px', fontFamily: 'monospace' }}>
            {frequency.toFixed(2)} Hz
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#888', fontSize: '10px' }}>Power Factor</div>
          <div style={{ color: powerFactor < 0.9 ? '#f59e0b' : '#22c55e', fontSize: '16px', fontFamily: 'monospace' }}>
            {powerFactor.toFixed(2)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#888', fontSize: '10px' }}>Active Power</div>
          <div style={{ color: '#3b82f6', fontSize: '16px', fontFamily: 'monospace' }}>
            {activePower.toFixed(1)} kW
          </div>
        </div>
      </div>
    </div>
  );
});

// ============================================
// OSCILLOSCOPE COMPONENT
// ============================================

export const Oscilloscope = memo(({
  title = 'Oscilloscope',
  waveforms = [],
  timebase = 10, // ms/div
  voltageScale = 100, // V/div
  triggerLevel = 0,
  triggerMode = 'auto',
  channels = [
    { id: 'va', label: 'Va', color: PhaseColors.A, enabled: true },
    { id: 'vb', label: 'Vb', color: PhaseColors.B, enabled: true },
    { id: 'vc', label: 'Vc', color: PhaseColors.C, enabled: true },
  ],
  width = 600,
  height = 300,
}) => {
  const [isRunning, setIsRunning] = useState(true);
  const [currentTimebase, setCurrentTimebase] = useState(timebase);
  const [currentVoltageScale, setCurrentVoltageScale] = useState(voltageScale);
  
  // Generate mock waveform data if none provided
  const generateMockData = () => {
    const data = [];
    const points = 500;
    const period = 20; // 50Hz = 20ms period
    
    for (let i = 0; i < points; i++) {
      const t = (i / points) * period * 2;
      const point = { time: t };
      
      channels.forEach((ch, idx) => {
        if (ch.enabled) {
          const phaseShift = (idx * 2 * Math.PI) / 3;
          point[ch.id] = 325 * Math.sin((2 * Math.PI * t) / period + phaseShift);
        }
      });
      
      data.push(point);
    }
    return data;
  };
  
  const data = waveforms.length > 0 ? waveforms : generateMockData();
  
  return (
    <div className="oscilloscope" style={{
      backgroundColor: '#1a1a1a',
      borderRadius: '8px',
      padding: '12px',
      border: '2px solid #333',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
      }}>
        <h4 style={{ margin: 0, color: '#22c55e' }}>{title}</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsRunning(!isRunning)}
            style={{
              padding: '4px 12px',
              backgroundColor: isRunning ? '#22c55e' : '#666',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {isRunning ? 'Stop' : 'Run'}
          </button>
        </div>
      </div>
      
      {/* Waveform display */}
      <div style={{ backgroundColor: '#0a0a0a', borderRadius: '4px', padding: '8px' }}>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#333" />
            <XAxis
              dataKey="time"
              stroke="#666"
              fontSize={10}
              label={{ value: 'Time (ms)', position: 'insideBottom', fill: '#666' }}
            />
            <YAxis
              stroke="#666"
              fontSize={10}
              label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft', fill: '#666' }}
              domain={[-currentVoltageScale * 4, currentVoltageScale * 4]}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '4px' }}
              labelStyle={{ color: '#888' }}
            />
            {channels.filter(ch => ch.enabled).map(channel => (
              <Line
                key={channel.id}
                type="monotone"
                dataKey={channel.id}
                stroke={channel.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '8px',
        padding: '8px',
        backgroundColor: '#2a2a2a',
        borderRadius: '4px',
      }}>
        {/* Timebase */}
        <div>
          <label style={{ color: '#888', fontSize: '10px', display: 'block' }}>Time/Div</label>
          <select
            value={currentTimebase}
            onChange={(e) => setCurrentTimebase(Number(e.target.value))}
            style={{
              backgroundColor: '#333',
              color: '#22c55e',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '3px',
            }}
          >
            <option value={1}>1 ms</option>
            <option value={2}>2 ms</option>
            <option value={5}>5 ms</option>
            <option value={10}>10 ms</option>
            <option value={20}>20 ms</option>
            <option value={50}>50 ms</option>
          </select>
        </div>
        
        {/* Voltage scale */}
        <div>
          <label style={{ color: '#888', fontSize: '10px', display: 'block' }}>V/Div</label>
          <select
            value={currentVoltageScale}
            onChange={(e) => setCurrentVoltageScale(Number(e.target.value))}
            style={{
              backgroundColor: '#333',
              color: '#22c55e',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '3px',
            }}
          >
            <option value={10}>10 V</option>
            <option value={20}>20 V</option>
            <option value={50}>50 V</option>
            <option value={100}>100 V</option>
            <option value={200}>200 V</option>
            <option value={500}>500 V</option>
          </select>
        </div>
        
        {/* Channel toggles */}
        <div>
          <label style={{ color: '#888', fontSize: '10px', display: 'block' }}>Channels</label>
          <div style={{ display: 'flex', gap: '4px' }}>
            {channels.map(ch => (
              <span
                key={ch.id}
                style={{
                  padding: '2px 6px',
                  backgroundColor: ch.enabled ? ch.color : '#333',
                  borderRadius: '3px',
                  fontSize: '10px',
                  color: ch.enabled ? '#fff' : '#666',
                  cursor: 'pointer',
                }}
              >
                {ch.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// ============================================
// HARMONIC ANALYZER
// ============================================

export const HarmonicAnalyzer = memo(({
  title = 'Harmonic Analyzer',
  harmonics = [],
  thd = 0,
  standard = 'IEEE 519',
}) => {
  // Generate mock harmonic data if none provided
  const generateMockHarmonics = () => {
    const data = [];
    for (let i = 1; i <= 25; i++) {
      data.push({
        order: i,
        magnitude: i === 1 ? 100 : 100 / (i * 1.5) * Math.random(),
        limit: i === 1 ? 100 : 8 / Math.sqrt(i),
      });
    }
    return data;
  };
  
  const data = harmonics.length > 0 ? harmonics : generateMockHarmonics();
  
  return (
    <div className="harmonic-analyzer" style={{
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      padding: '16px',
      border: '1px solid #ddd',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0 }}>{title}</h4>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: '#666' }}>THD</div>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: thd > 8 ? '#ef4444' : thd > 5 ? '#f59e0b' : '#22c55e',
          }}>
            {thd.toFixed(2)}%
          </div>
        </div>
      </div>
      
      {/* Harmonic spectrum */}
      <div style={{ backgroundColor: '#fff', borderRadius: '4px', padding: '8px' }}>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="order" stroke="#666" fontSize={10} label={{ value: 'Harmonic Order', position: 'insideBottom', fill: '#666' }} />
            <YAxis stroke="#666" fontSize={10} label={{ value: '% of Fundamental', angle: -90, position: 'insideLeft', fill: '#666' }} />
            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '4px' }} />
            <Bar dataKey="magnitude" fill="#3b82f6" name="Measured" />
            <Line type="monotone" dataKey="limit" stroke="#ef4444" strokeWidth={2} strokeDasharray="5,5" name="Limit" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Compliance status */}
      <div style={{
        marginTop: '12px',
        padding: '8px',
        backgroundColor: thd > 8 ? '#fef2f2' : '#f0fdf4',
        borderRadius: '4px',
        border: `1px solid ${thd > 8 ? '#fecaca' : '#bbf7d0'}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: thd > 8 ? '#ef4444' : '#22c55e',
          }} />
          <span style={{ fontSize: '12px', color: '#333' }}>
            {thd > 8 ? `Exceeds ${standard} limits` : `Compliant with ${standard}`}
          </span>
        </div>
      </div>
    </div>
  );
});

// ============================================
// PHASOR DIAGRAM
// ============================================

export const PhasorDiagram = memo(({
  title = 'Phasor Diagram',
  voltages = [230, 230, 230],
  currents = [10, 10, 10],
  powerFactor = 0.85,
  size = 200,
}) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = size * 0.4;
  
  // Calculate phasor endpoints
  const voltagePhasors = voltages.map((v, i) => {
    const angle = (i * 120 - 90) * (Math.PI / 180); // Start from top, 120° apart
    const magnitude = (v / Math.max(...voltages)) * maxRadius;
    return {
      x: centerX + magnitude * Math.cos(angle),
      y: centerY + magnitude * Math.sin(angle),
      angle,
    };
  });
  
  const currentPhasors = currents.map((c, i) => {
    const pfAngle = Math.acos(powerFactor) * (180 / Math.PI);
    const angle = ((i * 120 - 90) - pfAngle) * (Math.PI / 180); // Lagging
    const magnitude = (c / Math.max(...currents)) * maxRadius * 0.8;
    return {
      x: centerX + magnitude * Math.cos(angle),
      y: centerY + magnitude * Math.sin(angle),
    };
  });
  
  return (
    <div className="phasor-diagram" style={{
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      padding: '16px',
      border: '1px solid #ddd',
    }}>
      <h4 style={{ margin: '0 0 12px 0' }}>{title}</h4>
      
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {/* Background circle */}
        <circle cx={centerX} cy={centerY} r={maxRadius} fill="none" stroke="#ddd" strokeWidth="1" strokeDasharray="4,4" />
        
        {/* Axes */}
        <line x1={centerX} y1="10" x2={centerX} y2={size - 10} stroke="#ddd" strokeWidth="1" />
        <line x1="10" y1={centerY} x2={size - 10} y2={centerY} stroke="#ddd" strokeWidth="1" />
        
        {/* Voltage phasors */}
        {voltagePhasors.map((phasor, i) => (
          <g key={`v${i}`}>
            <line
              x1={centerX}
              y1={centerY}
              x2={phasor.x}
              y2={phasor.y}
              stroke={[PhaseColors.A, PhaseColors.B, PhaseColors.C][i]}
              strokeWidth="3"
              markerEnd="url(#arrow)"
            />
            <text
              x={phasor.x + 10 * Math.cos(phasor.angle)}
              y={phasor.y + 10 * Math.sin(phasor.angle)}
              fontSize="10"
              fill={[PhaseColors.A, PhaseColors.B, PhaseColors.C][i]}
            >
              V{['A', 'B', 'C'][i]}
            </text>
          </g>
        ))}
        
        {/* Current phasors */}
        {currentPhasors.map((phasor, i) => (
          <line
            key={`i${i}`}
            x1={centerX}
            y1={centerY}
            x2={phasor.x}
            y2={phasor.y}
            stroke={[PhaseColors.A, PhaseColors.B, PhaseColors.C][i]}
            strokeWidth="2"
            strokeDasharray="5,3"
            opacity="0.7"
          />
        ))}
        
        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrow"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#333" />
          </marker>
        </defs>
        
        {/* Legend */}
        <g transform={`translate(10, ${size - 30})`}>
          <line x1="0" y1="0" x2="20" y2="0" stroke="#333" strokeWidth="2" />
          <text x="25" y="4" fontSize="8" fill="#333">Voltage</text>
          <line x1="0" y1="15" x2="20" y2="15" stroke="#333" strokeWidth="2" strokeDasharray="5,3" />
          <text x="25" y="19" fontSize="8" fill="#333">Current</text>
        </g>
      </svg>
      
      {/* PF indicator */}
      <div style={{ textAlign: 'center', marginTop: '8px' }}>
        <span style={{ fontSize: '12px', color: '#666' }}>Power Factor: </span>
        <span style={{ fontWeight: 'bold', color: powerFactor < 0.9 ? '#f59e0b' : '#22c55e' }}>
          {powerFactor.toFixed(2)} {powerFactor < 1 ? 'lagging' : ''}
        </span>
      </div>
    </div>
  );
});

// ============================================
// POWER FLOW DISPLAY
// ============================================

export const PowerFlowDisplay = memo(({
  title = 'Power Flow',
  activePower = 0,
  reactivePower = 0,
  apparentPower = 0,
  powerFactor = 1,
  energy = 0,
}) => {
  const powerTriangleAngle = Math.atan2(reactivePower, activePower) * (180 / Math.PI);
  
  return (
    <div className="power-flow-display" style={{
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      padding: '16px',
      border: '1px solid #ddd',
    }}>
      <h4 style={{ margin: '0 0 12px 0' }}>{title}</h4>
      
      {/* Power triangle */}
      <svg viewBox="0 0 200 150" width="200" height="150" style={{ display: 'block', margin: '0 auto' }}>
        {/* Triangle */}
        <polygon
          points="20,120 180,120 180,120"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
        />
        <line x1="20" y1="120" x2="180" y2="120" stroke="#22c55e" strokeWidth="3" />
        <line x1="180" y1="120" x2="180" y2={120 - (reactivePower / activePower) * 100} stroke="#f59e0b" strokeWidth="3" />
        <line x1="20" y1="120" x2="180" y2={120 - (reactivePower / activePower) * 100} stroke="#3b82f6" strokeWidth="3" />
        
        {/* Labels */}
        <text x="100" y="140" textAnchor="middle" fontSize="10" fill="#22c55e">P = {activePower.toFixed(1)} kW</text>
        <text x="185" y={70 + (reactivePower / activePower) * 50} textAnchor="start" fontSize="10" fill="#f59e0b">Q = {reactivePower.toFixed(1)} kVAr</text>
        <text x="80" y="50" textAnchor="middle" fontSize="10" fill="#3b82f6">S = {apparentPower.toFixed(1)} kVA</text>
        
        {/* Angle indicator */}
        <path
          d="M40,120 A20,20 0 0,0 20,100"
          fill="none"
          stroke="#666"
          strokeWidth="1"
        />
        <text x="35" y="105" fontSize="8" fill="#666">φ</text>
      </svg>
      
      {/* Digital values */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
        marginTop: '12px',
      }}>
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '8px',
          borderRadius: '4px',
          textAlign: 'center',
        }}>
          <div style={{ color: '#888', fontSize: '10px' }}>Active Power</div>
          <div style={{ color: '#22c55e', fontSize: '16px', fontFamily: 'monospace' }}>
            {activePower.toFixed(2)} kW
          </div>
        </div>
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '8px',
          borderRadius: '4px',
          textAlign: 'center',
        }}>
          <div style={{ color: '#888', fontSize: '10px' }}>Reactive Power</div>
          <div style={{ color: '#f59e0b', fontSize: '16px', fontFamily: 'monospace' }}>
            {reactivePower.toFixed(2)} kVAr
          </div>
        </div>
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '8px',
          borderRadius: '4px',
          textAlign: 'center',
        }}>
          <div style={{ color: '#888', fontSize: '10px' }}>Apparent Power</div>
          <div style={{ color: '#3b82f6', fontSize: '16px', fontFamily: 'monospace' }}>
            {apparentPower.toFixed(2)} kVA
          </div>
        </div>
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '8px',
          borderRadius: '4px',
          textAlign: 'center',
        }}>
          <div style={{ color: '#888', fontSize: '10px' }}>Energy</div>
          <div style={{ color: '#a855f7', fontSize: '16px', fontFamily: 'monospace' }}>
            {energy.toFixed(2)} kWh
          </div>
        </div>
      </div>
    </div>
  );
});

// ============================================
// EVENT LOG / ALARM PANEL
// ============================================

export const EventLogPanel = memo(({
  title = 'Event Log',
  events = [],
  maxEvents = 50,
}) => {
  const scrollRef = useRef(null);
  
  // Generate mock events if none provided
  const mockEvents = events.length > 0 ? events : [
    { id: 1, timestamp: new Date().toISOString(), type: 'info', message: 'System started' },
    { id: 2, timestamp: new Date().toISOString(), type: 'warning', message: 'High temperature detected' },
    { id: 3, timestamp: new Date().toISOString(), type: 'alarm', message: 'Overcurrent trip on CB-01' },
    { id: 4, timestamp: new Date().toISOString(), type: 'info', message: 'Motor M-01 started' },
    { id: 5, timestamp: new Date().toISOString(), type: 'info', message: 'Load shedding activated' },
  ];
  
  const getEventColor = (type) => {
    switch (type) {
      case 'alarm': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#666';
    }
  };
  
  return (
    <div className="event-log-panel" style={{
      backgroundColor: '#1a1a1a',
      borderRadius: '8px',
      padding: '12px',
      border: '1px solid #333',
      height: '300px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <h4 style={{ margin: '0 0 8px 0', color: '#22c55e' }}>{title}</h4>
      
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '11px',
        }}
      >
        {mockEvents.map((event) => (
          <div
            key={event.id}
            style={{
              padding: '4px 8px',
              borderBottom: '1px solid #333',
              display: 'flex',
              gap: '8px',
            }}
          >
            <span style={{ color: '#666' }}>
              {new Date(event.timestamp).toLocaleTimeString()}
            </span>
            <span style={{
              color: getEventColor(event.type),
              textTransform: 'uppercase',
              fontWeight: 'bold',
              minWidth: '60px',
            }}>
              [{event.type}]
            </span>
            <span style={{ color: '#ccc' }}>{event.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

// ============================================
// COMBINED INSTRUMENTATION PANEL
// ============================================

export const InstrumentationPanel = memo(({
  meterData = {},
  waveformData = [],
  harmonicData = [],
  eventData = [],
}) => {
  const [activeTab, setActiveTab] = useState('meters');
  
  const tabs = [
    { id: 'meters', label: 'Meters' },
    { id: 'scope', label: 'Oscilloscope' },
    { id: 'harmonics', label: 'Harmonics' },
    { id: 'phasor', label: 'Phasor' },
    { id: 'events', label: 'Events' },
  ];
  
  return (
    <div className="instrumentation-panel" style={{
      backgroundColor: '#fff',
      borderRadius: '8px',
      border: '1px solid #ddd',
      overflow: 'hidden',
    }}>
      {/* Tab navigation */}
      <div style={{
        display: 'flex',
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #ddd',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              backgroundColor: activeTab === tab.id ? '#fff' : 'transparent',
              borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab content */}
      <div style={{ padding: '16px' }}>
        {activeTab === 'meters' && (
          <div>
            <ThreePhaseMeterPanel
              voltages={meterData.voltages || [230, 230, 230]}
              currents={meterData.currents || [10, 10, 10]}
              frequency={meterData.frequency || 50}
              powerFactor={meterData.powerFactor || 0.85}
              activePower={meterData.activePower || 5.5}
            />
            <div style={{ marginTop: '16px' }}>
              <PowerFlowDisplay
                activePower={meterData.activePower || 100}
                reactivePower={meterData.reactivePower || 50}
                apparentPower={meterData.apparentPower || 111.8}
                powerFactor={meterData.powerFactor || 0.85}
                energy={meterData.energy || 1234.5}
              />
            </div>
          </div>
        )}
        
        {activeTab === 'scope' && (
          <Oscilloscope
            waveforms={waveformData}
            timebase={10}
            voltageScale={100}
          />
        )}
        
        {activeTab === 'harmonics' && (
          <HarmonicAnalyzer
            harmonics={harmonicData}
            thd={meterData.thd || 5.2}
          />
        )}
        
        {activeTab === 'phasor' && (
          <div style={{ display: 'flex', gap: '16px' }}>
            <PhasorDiagram
              voltages={meterData.voltages || [230, 230, 230]}
              currents={meterData.currents || [10, 10, 10]}
              powerFactor={meterData.powerFactor || 0.85}
            />
            <div style={{ flex: 1 }}>
              <h5 style={{ margin: '0 0 8px 0' }}>Sequence Components</h5>
              <div style={{
                backgroundColor: '#f5f5f5',
                padding: '12px',
                borderRadius: '4px',
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#22c55e', fontWeight: 'bold' }}>Positive Sequence:</span>
                  <span style={{ marginLeft: '8px' }}>230V @ 0°</span>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Negative Sequence:</span>
                  <span style={{ marginLeft: '8px' }}>2.3V @ 120°</span>
                </div>
                <div>
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Zero Sequence:</span>
                  <span style={{ marginLeft: '8px' }}>0.5V @ 0°</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'events' && (
          <EventLogPanel events={eventData} />
        )}
      </div>
    </div>
  );
});

export default InstrumentationPanel;
