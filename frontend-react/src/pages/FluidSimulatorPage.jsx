/**
 * Fluid Simulator - Hydraulic & Pneumatic Circuit Simulator
 * Based on Google AI Studio Fluid Simulator
 * Features: Hydraulic/pneumatic components, flow simulation, pressure analysis
 */
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Droplets, Play, Square, Save, FolderOpen, RotateCcw, ZoomIn, ZoomOut, 
  Grid, Settings, BookOpen, ChevronDown, ChevronRight, Trash2,
  Gauge, ArrowUpDown, Circle, Settings2, Thermometer, GitBranch as Pipe
} from 'lucide-react';

// ============================================================================
// Component Type Definitions
// ============================================================================
const ComponentTypes = {
  // Power Sources
  HYDRAULIC_PUMP: 'hydraulic_pump',
  PNEUMATIC_COMPRESSOR: 'pneumatic_compressor',
  RESERVOIR: 'reservoir',
  
  // Actuators
  DOUBLE_ACTING_CYLINDER: 'double_acting_cylinder',
  SINGLE_ACTING_CYLINDER: 'single_acting_cylinder',
  ROTARY_ACTUATOR: 'rotary_actuator',
  HYDRAULIC_MOTOR: 'hydraulic_motor',
  
  // Valves
  DIRECTIONAL_CONTROL_VALVE: 'directional_control_valve',
  PRESSURE_RELIEF_VALVE: 'pressure_relief_valve',
  PRESSURE_REDUCING_VALVE: 'pressure_reducing_valve',
  FLOW_CONTROL_VALVE: 'flow_control_valve',
  CHECK_VALVE: 'check_valve',
  PILOT_OPERATED_CHECK_VALVE: 'pilot_operated_check_valve',
  
  // Sensors & Instruments
  PRESSURE_GAUGE: 'pressure_gauge',
  FLOW_METER: 'flow_meter',
  LEVEL_SWITCH: 'level_switch',
  PRESSURE_SWITCH: 'pressure_switch',
  FLOW_SWITCH: 'flow_switch',
  
  // Connections
  JUNCTION: 'junction',
  TEE: 'tee',
  FILTER: 'filter',
  HEAT_EXCHANGER: 'heat_exchanger',
  ACCUMULATOR: 'accumulator',
};

// ============================================================================
// Component Catalog
// ============================================================================
const FluidComponentCatalog = {
  powerSources: {
    name: 'Power Sources',
    icon: Droplets,
    color: '#3b82f6',
    components: [
      { type: ComponentTypes.HYDRAULIC_PUMP, name: 'Hydraulic Pump', defaultLabel: 'P1', flowRate: 50, maxPressure: 210 },
      { type: ComponentTypes.PNEUMATIC_COMPRESSOR, name: 'Compressor', defaultLabel: 'C1', flowRate: 100, maxPressure: 10 },
      { type: ComponentTypes.RESERVOIR, name: 'Reservoir', defaultLabel: 'R1', capacity: 100 },
    ],
  },
  actuators: {
    name: 'Actuators',
    icon: ArrowUpDown,
    color: '#22c55e',
    components: [
      { type: ComponentTypes.DOUBLE_ACTING_CYLINDER, name: 'Double-Acting Cylinder', defaultLabel: 'CYL1', bore: 50, stroke: 200 },
      { type: ComponentTypes.SINGLE_ACTING_CYLINDER, name: 'Single-Acting Cylinder', defaultLabel: 'CYL2', bore: 40, stroke: 150 },
      { type: ComponentTypes.ROTARY_ACTUATOR, name: 'Rotary Actuator', defaultLabel: 'RA1', torque: 100 },
      { type: ComponentTypes.HYDRAULIC_MOTOR, name: 'Hydraulic Motor', defaultLabel: 'HM1', displacement: 50 },
    ],
  },
  valves: {
    name: 'Valves',
    icon: Settings,
    color: '#f59e0b',
    components: [
      { type: ComponentTypes.DIRECTIONAL_CONTROL_VALVE, name: '4/3 Directional Valve', defaultLabel: 'DV1', ports: 4, positions: 3 },
      { type: ComponentTypes.PRESSURE_RELIEF_VALVE, name: 'Pressure Relief Valve', defaultLabel: 'PRV1', setPressure: 200 },
      { type: ComponentTypes.PRESSURE_REDUCING_VALVE, name: 'Pressure Reducing Valve', defaultLabel: 'PRV2', outletPressure: 100 },
      { type: ComponentTypes.FLOW_CONTROL_VALVE, name: 'Flow Control Valve', defaultLabel: 'FCV1', maxFlow: 30 },
      { type: ComponentTypes.CHECK_VALVE, name: 'Check Valve', defaultLabel: 'CV1', crackingPressure: 0.5 },
      { type: ComponentTypes.PILOT_OPERATED_CHECK_VALVE, name: 'Pilot Check Valve', defaultLabel: 'PCV1' },
    ],
  },
  instruments: {
    name: 'Instruments',
    icon: Gauge,
    color: '#8b5cf6',
    components: [
      { type: ComponentTypes.PRESSURE_GAUGE, name: 'Pressure Gauge', defaultLabel: 'PG1', range: 250 },
      { type: ComponentTypes.FLOW_METER, name: 'Flow Meter', defaultLabel: 'FM1', range: 100 },
      { type: ComponentTypes.LEVEL_SWITCH, name: 'Level Switch', defaultLabel: 'LS1' },
      { type: ComponentTypes.PRESSURE_SWITCH, name: 'Pressure Switch', defaultLabel: 'PS1', setPressure: 150 },
      { type: ComponentTypes.FLOW_SWITCH, name: 'Flow Switch', defaultLabel: 'FS1' },
    ],
  },
  accessories: {
    name: 'Accessories',
    icon: Pipe,
    color: '#6b7280',
    components: [
      { type: ComponentTypes.JUNCTION, name: 'Junction', defaultLabel: 'J1' },
      { type: ComponentTypes.TEE, name: 'Tee Connection', defaultLabel: 'T1' },
      { type: ComponentTypes.FILTER, name: 'Filter', defaultLabel: 'F1', micronRating: 10 },
      { type: ComponentTypes.HEAT_EXCHANGER, name: 'Heat Exchanger', defaultLabel: 'HE1', coolingCapacity: 10 },
      { type: ComponentTypes.ACCUMULATOR, name: 'Accumulator', defaultLabel: 'ACC1', capacity: 10 },
    ],
  },
};

// ============================================================================
// Component Renderer
// ============================================================================
const FluidComponentRenderer = ({ component, isSelected, isSimulating, onClick, onPortClick }) => {
  const { type, x, y, rotation, properties, state, label } = component;
  
  const getComponentColor = () => {
    if (state?.isActive) return '#22c55e';
    if (state?.isFault) return '#ef4444';
    if (state?.pressure > 0) return '#3b82f6';
    return '#6b7280';
  };
  
  const renderSymbol = () => {
    const color = getComponentColor();
    const fillColor = state?.isActive ? 'rgba(34, 197, 94, 0.2)' : 'transparent';
    
    switch (type) {
      case ComponentTypes.HYDRAULIC_PUMP:
        return (
          <g>
            <circle cx="25" cy="25" r="18" fill={fillColor} stroke={color} strokeWidth="2" />
            <path d="M15,25 L25,15 L35,25 L25,35 Z" fill="none" stroke={color} strokeWidth="1.5" />
            <path d="M20,25 A5,5 0 1,1 30,25 A5,5 0 1,1 20,25" fill="none" stroke={color} strokeWidth="1.5" />
            <text x="25" y="55" textAnchor="middle" fontSize="7" fill="#94a3b8">{properties?.flowRate || 50} L/min</text>
          </g>
        );
        
      case ComponentTypes.PNEUMATIC_COMPRESSOR:
        return (
          <g>
            <circle cx="25" cy="25" r="18" fill={fillColor} stroke="#06b6d4" strokeWidth="2" />
            <path d="M18,30 L25,18 L32,30" fill="none" stroke="#06b6d4" strokeWidth="1.5" />
            <line x1="20" y1="25" x2="30" y2="25" stroke="#06b6d4" strokeWidth="1.5" />
            <text x="25" y="55" textAnchor="middle" fontSize="7" fill="#94a3b8">{properties?.maxPressure || 10} bar</text>
          </g>
        );
        
      case ComponentTypes.RESERVOIR:
        return (
          <g>
            <rect x="10" y="15" width="30" height="25" fill={fillColor} stroke={color} strokeWidth="2" />
            <line x1="15" y1="30" x2="35" y2="30" stroke={color} strokeWidth="1" strokeDasharray="2" />
            <text x="25" y="55" textAnchor="middle" fontSize="7" fill="#94a3b8">{properties?.capacity || 100} L</text>
          </g>
        );
        
      case ComponentTypes.DOUBLE_ACTING_CYLINDER:
        const extension = state?.position || 0;
        const rodExtension = extension * 25;
        return (
          <g>
            <rect x="5" y="18" width="40" height="14" fill="none" stroke={color} strokeWidth="2" />
            <rect x="45" y="22" width={10 + rodExtension} height="6" fill="none" stroke={color} strokeWidth="1.5" />
            <circle cx="55" cy="25" r="3" fill={state?.isExtending ? '#22c55e' : color} />
            <text x="25" y="55" textAnchor="middle" fontSize="7" fill="#94a3b8">{properties?.bore || 50}mm</text>
          </g>
        );
        
      case ComponentTypes.SINGLE_ACTING_CYLINDER:
        return (
          <g>
            <rect x="5" y="18" width="40" height="14" fill="none" stroke={color} strokeWidth="2" />
            <rect x="45" y="22" width="15" height="6" fill="none" stroke={color} strokeWidth="1.5" />
            <line x1="25" y1="32" x2="25" y2="40" stroke={color} strokeWidth="1" />
            <text x="25" y="55" textAnchor="middle" fontSize="7" fill="#94a3b8">{properties?.bore || 40}mm</text>
          </g>
        );
        
      case ComponentTypes.ROTARY_ACTUATOR:
        return (
          <g>
            <circle cx="25" cy="25" r="15" fill="none" stroke={color} strokeWidth="2" />
            <path d="M25,10 L25,15" stroke={color} strokeWidth="2" />
            <path d="M25,10 A15,15 0 0,1 40,25" fill="none" stroke={color} strokeWidth="1.5" />
            <path d="M20,20 L30,25 L20,30 Z" fill={state?.isActive ? '#22c55e' : 'none'} stroke={color} strokeWidth="1" />
          </g>
        );
        
      case ComponentTypes.HYDRAULIC_MOTOR:
        return (
          <g>
            <circle cx="25" cy="25" r="18" fill={fillColor} stroke={color} strokeWidth="2" />
            <text x="25" y="28" textAnchor="middle" fontSize="10" fontWeight="bold" fill={color}>M</text>
            <text x="25" y="55" textAnchor="middle" fontSize="7" fill="#94a3b8">{properties?.displacement || 50}cc</text>
          </g>
        );
        
      case ComponentTypes.DIRECTIONAL_CONTROL_VALVE:
        const position = state?.valvePosition || 0;
        return (
          <g>
            <rect x="10" y="15" width="30" height="20" fill="none" stroke={color} strokeWidth="2" />
            <line x1="15" y1="25" x2="35" y2="25" stroke={color} strokeWidth="1" />
            <rect x={15 + position * 8} y="20" width="10" height="10" fill={fillColor} stroke={color} strokeWidth="1" />
            <text x="25" y="55" textAnchor="middle" fontSize="7" fill="#94a3b8">4/3</text>
          </g>
        );
        
      case ComponentTypes.PRESSURE_RELIEF_VALVE:
        return (
          <g>
            <path d="M15,15 L35,15 L25,35 Z" fill="none" stroke={color} strokeWidth="2" />
            <line x1="25" y1="20" x2="25" y2="30" stroke={color} strokeWidth="1.5" />
            <circle cx="25" cy="17" r="2" fill={color} />
            <text x="25" y="55" textAnchor="middle" fontSize="7" fill="#94a3b8">{properties?.setPressure || 200} bar</text>
          </g>
        );
        
      case ComponentTypes.PRESSURE_REDUCING_VALVE:
        return (
          <g>
            <rect x="15" y="15" width="20" height="20" fill="none" stroke={color} strokeWidth="2" />
            <path d="M20,20 L25,25 L30,20" fill="none" stroke={color} strokeWidth="1.5" />
            <line x1="25" y1="25" x2="25" y2="30" stroke={color} strokeWidth="1.5" />
            <text x="25" y="55" textAnchor="middle" fontSize="7" fill="#94a3b8">{properties?.outletPressure || 100} bar</text>
          </g>
        );
        
      case ComponentTypes.FLOW_CONTROL_VALVE:
        return (
          <g>
            <ellipse cx="25" cy="25" rx="15" ry="10" fill="none" stroke={color} strokeWidth="2" />
            <line x1="20" y1="25" x2="30" y2="25" stroke={color} strokeWidth="1.5" />
            <path d="M22,22 L28,28" stroke={color} strokeWidth="1.5" />
            <text x="25" y="50" textAnchor="middle" fontSize="7" fill="#94a3b8">{properties?.maxFlow || 30} L/min</text>
          </g>
        );
        
      case ComponentTypes.CHECK_VALVE:
        return (
          <g>
            <path d="M15,20 L25,30 L35,20" fill="none" stroke={color} strokeWidth="2" />
            <line x1="15" y1="30" x2="35" y2="30" stroke={color} strokeWidth="2" />
          </g>
        );
        
      case ComponentTypes.PILOT_OPERATED_CHECK_VALVE:
        return (
          <g>
            <path d="M15,18 L25,28 L35,18" fill="none" stroke={color} strokeWidth="2" />
            <line x1="15" y1="28" x2="35" y2="28" stroke={color} strokeWidth="2" />
            <line x1="25" y1="28" x2="25" y2="38" stroke={color} strokeWidth="1.5" strokeDasharray="2" />
            <circle cx="25" cy="40" r="3" fill="none" stroke={color} strokeWidth="1" />
          </g>
        );
        
      case ComponentTypes.PRESSURE_GAUGE:
        const pressure = state?.pressure || 0;
        const angle = -135 + (pressure / (properties?.range || 250)) * 270;
        return (
          <g>
            <circle cx="25" cy="25" r="18" fill="#1e293b" stroke={color} strokeWidth="2" />
            <line
              x1="25"
              y1="25"
              x2={25 + 12 * Math.cos(angle * Math.PI / 180)}
              y2={25 + 12 * Math.sin(angle * Math.PI / 180)}
              stroke="#ef4444"
              strokeWidth="1.5"
            />
            <text x="25" y="30" textAnchor="middle" fontSize="7" fill="#94a3b8">{pressure.toFixed(0)}</text>
            <text x="25" y="55" textAnchor="middle" fontSize="6" fill="#64748b">bar</text>
          </g>
        );
        
      case ComponentTypes.FLOW_METER:
        return (
          <g>
            <rect x="12" y="18" width="26" height="14" fill="none" stroke={color} strokeWidth="2" />
            <text x="25" y="28" textAnchor="middle" fontSize="8" fill={color}>{state?.flow?.toFixed(1) || '0.0'}</text>
            <text x="25" y="50" textAnchor="middle" fontSize="6" fill="#64748b">L/min</text>
          </g>
        );
        
      case ComponentTypes.LEVEL_SWITCH:
      case ComponentTypes.PRESSURE_SWITCH:
      case ComponentTypes.FLOW_SWITCH:
        return (
          <g>
            <rect x="15" y="15" width="20" height="20" fill={state?.isOn ? 'rgba(34, 197, 94, 0.2)' : 'none'} stroke={color} strokeWidth="2" />
            <circle cx="25" cy="25" r="5" fill={state?.isOn ? '#22c55e' : 'none'} stroke={color} strokeWidth="1" />
          </g>
        );
        
      case ComponentTypes.JUNCTION:
        return (
          <g>
            <circle cx="25" cy="25" r="6" fill={state?.pressure > 0 ? '#3b82f6' : color} stroke="#1e293b" strokeWidth="1" />
          </g>
        );
        
      case ComponentTypes.TEE:
        return (
          <g>
            <line x1="10" y1="25" x2="40" y2="25" stroke={color} strokeWidth="3" />
            <line x1="25" y1="25" x2="25" y2="40" stroke={color} strokeWidth="3" />
          </g>
        );
        
      case ComponentTypes.FILTER:
        return (
          <g>
            <rect x="15" y="15" width="20" height="20" fill="none" stroke={color} strokeWidth="2" />
            <line x1="18" y1="20" x2="32" y2="20" stroke={color} strokeWidth="1" />
            <line x1="18" y1="25" x2="32" y2="25" stroke={color} strokeWidth="1" />
            <line x1="18" y1="30" x2="32" y2="30" stroke={color} strokeWidth="1" />
            <text x="25" y="50" textAnchor="middle" fontSize="6" fill="#64748b">{properties?.micronRating || 10}μm</text>
          </g>
        );
        
      case ComponentTypes.HEAT_EXCHANGER:
        return (
          <g>
            <rect x="10" y="15" width="30" height="20" fill="none" stroke={color} strokeWidth="2" />
            <path d="M15,20 Q20,25 15,30 Q20,35 25,30 Q30,25 25,20 Q30,15 35,20 Q40,25 35,30" fill="none" stroke="#06b6d4" strokeWidth="1.5" />
          </g>
        );
        
      case ComponentTypes.ACCUMULATOR:
        return (
          <g>
            <ellipse cx="25" cy="20" rx="12" ry="5" fill="none" stroke={color} strokeWidth="2" />
            <path d="M13,20 L13,35 Q25,45 37,35 L37,20" fill="none" stroke={color} strokeWidth="2" />
            <line x1="13" y1="30" x2="37" y2="30" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2" />
            <text x="25" y="55" textAnchor="middle" fontSize="6" fill="#64748b">{properties?.capacity || 10}L</text>
          </g>
        );
        
      default:
        return (
          <g>
            <rect x="10" y="10" width="30" height="30" fill="none" stroke={color} strokeWidth="2" />
            <text x="25" y="28" textAnchor="middle" fontSize="8" fill={color}>?</text>
          </g>
        );
    }
  };
  
  const ports = component.ports || [
    { id: 'p_in', x: 0, y: 20, type: 'input' },
    { id: 'p_out', x: 50, y: 20, type: 'output' },
  ];
  
  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation || 0}, 25, 25)`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {renderSymbol()}
      
      {/* Label */}
      <text x="25" y="-5" textAnchor="middle" fontSize="9" fill="#94a3b8">
        {label}
      </text>
      
      {/* Ports */}
      {ports.map((port) => (
        <circle
          key={port.id}
          cx={port.x}
          cy={port.y}
          r="4"
          fill={port.type === 'input' ? '#3b82f6' : '#22c55e'}
          stroke="#1e293b"
          strokeWidth="1"
          onClick={(e) => {
            e.stopPropagation();
            onPortClick(component.id, port.id);
          }}
          style={{ cursor: 'crosshair' }}
        />
      ))}
      
      {/* Selection highlight */}
      {isSelected && (
        <rect
          x="-5"
          y="-10"
          width="60"
          height="70"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeDasharray="4"
        />
      )}
    </g>
  );
};

// ============================================================================
// Pipe Renderer
// ============================================================================
const PipeRenderer = ({ pipe, isSelected, hasFlow, onClick }) => {
  const path = pipe.points || [];
  if (path.length < 2) return null;
  
  const pathD = path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Pipe shadow for easier clicking */}
      <path d={pathD} fill="none" stroke="transparent" strokeWidth="12" />
      {/* Main pipe */}
      <path
        d={pathD}
        fill="none"
        stroke={isSelected ? '#3b82f6' : hasFlow ? '#3b82f6' : '#475569'}
        strokeWidth={isSelected ? 5 : 4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Flow indicator */}
      {hasFlow && (
        <path
          d={pathD}
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinecap="round"
          className="animate-pulse"
        />
      )}
    </g>
  );
};

// ============================================================================
// Component Palette
// ============================================================================
const FluidComponentPalette = ({ onDragStart }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredCatalog = useMemo(() => {
    if (!searchTerm) return FluidComponentCatalog;
    const filtered = {};
    Object.entries(FluidComponentCatalog).forEach(([key, category]) => {
      const matchingComponents = category.components.filter(
        (comp) =>
          comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          comp.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingComponents.length > 0) {
        filtered[key] = { ...category, components: matchingComponents };
      }
    });
    return filtered;
  }, [searchTerm]);
  
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-400" />
          Component Palette
        </h3>
      </div>
      
      {/* Search */}
      <div className="p-2 border-b border-gray-700">
        <input
          type="text"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-1.5 text-xs bg-gray-800 border border-gray-600 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>
      
      {/* Categories */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(filteredCatalog).map(([key, category]) => {
          const Icon = category.icon;
          const isExpanded = expandedCategory === key;
          
          return (
            <div key={key} className="border-b border-gray-800">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : key)}
                className="w-full px-3 py-2 flex items-center justify-between text-xs font-medium text-gray-300 hover:bg-gray-800 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" style={{ color: category.color }} />
                  {category.name}
                </span>
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
              
              {isExpanded && (
                <div className="bg-gray-800/50 py-1">
                  {category.components.map((comp) => (
                    <div
                      key={comp.type}
                      draggable
                      onDragStart={(e) => onDragStart(e, comp)}
                      className="px-4 py-1.5 text-xs text-gray-400 hover:bg-gray-700 hover:text-gray-200 cursor-grab transition-colors flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category.color }} />
                      {comp.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// Properties Panel
// ============================================================================
const FluidPropertiesPanel = ({ component, onUpdate, onDelete }) => {
  if (!component) {
    return (
      <div className="w-72 bg-gray-900 border-l border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Properties
        </h3>
        <p className="text-xs text-gray-500">Select a component to view properties</p>
      </div>
    );
  }
  
  const catalog = Object.values(FluidComponentCatalog)
    .flatMap((cat) => cat.components)
    .find((c) => c.type === component.type);
  
  return (
    <div className="w-72 bg-gray-900 border-l border-gray-700 flex flex-col h-full">
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Properties
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Component Type */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Type</label>
          <div className="text-sm text-gray-200">{catalog?.name || component.type}</div>
        </div>
        
        {/* Label */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Label</label>
          <input
            type="text"
            value={component.label || ''}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-blue-500"
          />
        </div>
        
        {/* Type-specific properties */}
        {component.properties?.flowRate !== undefined && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Flow Rate (L/min)</label>
            <input
              type="number"
              value={component.properties.flowRate}
              onChange={(e) => onUpdate({ properties: { ...component.properties, flowRate: parseFloat(e.target.value) } })}
              className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
        
        {component.properties?.maxPressure !== undefined && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Max Pressure (bar)</label>
            <input
              type="number"
              value={component.properties.maxPressure}
              onChange={(e) => onUpdate({ properties: { ...component.properties, maxPressure: parseFloat(e.target.value) } })}
              className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
        
        {component.properties?.bore !== undefined && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Bore (mm)</label>
            <input
              type="number"
              value={component.properties.bore}
              onChange={(e) => onUpdate({ properties: { ...component.properties, bore: parseFloat(e.target.value) } })}
              className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
        
        {component.properties?.stroke !== undefined && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Stroke (mm)</label>
            <input
              type="number"
              value={component.properties.stroke}
              onChange={(e) => onUpdate({ properties: { ...component.properties, stroke: parseFloat(e.target.value) } })}
              className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
        
        {component.properties?.setPressure !== undefined && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Set Pressure (bar)</label>
            <input
              type="number"
              value={component.properties.setPressure}
              onChange={(e) => onUpdate({ properties: { ...component.properties, setPressure: parseFloat(e.target.value) } })}
              className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
        
        {/* Live State (when simulating) */}
        {component.state && Object.keys(component.state).length > 0 && (
          <div className="mt-4 p-2 bg-gray-800 rounded">
            <h4 className="text-xs font-semibold text-blue-400 mb-2">Live State</h4>
            {Object.entries(component.state).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs py-0.5">
                <span className="text-gray-400">{key}:</span>
                <span className="text-blue-400 font-mono">
                  {typeof value === 'boolean' ? (value ? 'ON' : 'OFF') : 
                   typeof value === 'number' ? value.toFixed(2) : String(value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Delete button */}
      <div className="p-3 border-t border-gray-700">
        <button
          onClick={onDelete}
          className="w-full px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 className="w-3 h-3" />
          Delete Component
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Analysis Panel
// ============================================================================
const FluidAnalysisPanel = ({ components, pipes, isSimulating }) => {
  const activeComponents = components.filter((c) => c.state?.isActive);
  const pressurizedComponents = components.filter((c) => (c.state?.pressure || 0) > 0);
  const totalFlow = components.reduce((sum, c) => sum + (c.state?.flow || 0), 0);
  
  return (
    <div className="w-72 bg-gray-900 border-l border-gray-700 flex flex-col h-full">
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <Gauge className="w-4 h-4" />
          System Analysis
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Status */}
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-xs text-gray-300">{isSimulating ? 'Simulation Running' : 'Simulation Stopped'}</span>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-lg font-bold text-blue-400">{components.length}</div>
            <div className="text-xs text-gray-400">Components</div>
          </div>
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-lg font-bold text-purple-400">{pipes.length}</div>
            <div className="text-xs text-gray-400">Pipes</div>
          </div>
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-lg font-bold text-green-400">{activeComponents.length}</div>
            <div className="text-xs text-gray-400">Active</div>
          </div>
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-lg font-bold text-cyan-400">{totalFlow.toFixed(1)}</div>
            <div className="text-xs text-gray-400">L/min</div>
          </div>
        </div>
        
        {/* System Pressure */}
        <div className="bg-gray-800 p-3 rounded">
          <h4 className="text-xs font-semibold text-gray-300 mb-2">System Pressure</h4>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
              style={{ width: '60%' }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 bar</span>
            <span className="text-white font-medium">126 bar</span>
            <span>210 bar</span>
          </div>
        </div>
        
        {/* Events Log */}
        <div>
          <h4 className="text-xs font-semibold text-gray-300 mb-2">Events</h4>
          <div className="bg-gray-800 rounded p-2 text-xs space-y-1 max-h-40 overflow-y-auto">
            {isSimulating ? (
              <>
                <div className="text-green-400">▶ Simulation started</div>
                <div className="text-blue-400">💧 Pump P1 active</div>
                <div className="text-cyan-400">📊 Flow: 45.2 L/min</div>
              </>
            ) : (
              <div className="text-gray-500">No events</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Fluid Simulator Component
// ============================================================================
const FluidSimulator = () => {
  // State
  const [components, setComponents] = useState([]);
  const [pipes, setPipes] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedPipe, setSelectedPipe] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [activePanel, setActivePanel] = useState('properties');
  const [connectionStart, setConnectionStart] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  
  // Grid settings
  const GRID_SIZE = 20;
  
  // Snap to grid
  const snapToGrid = (value) => Math.round(value / GRID_SIZE) * GRID_SIZE;
  
  // Handle drag start from palette
  const handleDragStart = (e, component) => {
    e.dataTransfer.setData('component', JSON.stringify(component));
    e.dataTransfer.effectAllowed = 'copy';
  };
  
  // Handle drop on canvas
  const handleDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('component');
    if (!data || !svgRef.current) return;
    
    const component = JSON.parse(data);
    const rect = svgRef.current.getBoundingClientRect();
    const x = snapToGrid((e.clientX - rect.left - viewOffset.x) / zoom);
    const y = snapToGrid((e.clientY - rect.top - viewOffset.y) / zoom);
    
    const newComponent = {
      id: `${component.type}_${Date.now()}`,
      type: component.type,
      x,
      y,
      rotation: 0,
      label: component.defaultLabel,
      properties: { ...component },
      state: {},
      ports: [
        { id: 'p_in', x: 0, y: 20, type: 'input' },
        { id: 'p_out', x: 50, y: 20, type: 'output' },
      ],
    };
    
    setComponents((prev) => [...prev, newComponent]);
  };
  
  // Handle component click
  const handleComponentClick = (e, component) => {
    e.stopPropagation();
    setSelectedComponent(component);
    setSelectedPipe(null);
  };
  
  // Handle pipe click
  const handlePipeClick = (e, pipe) => {
    e.stopPropagation();
    setSelectedPipe(pipe);
    setSelectedComponent(null);
  };
  
  // Handle canvas click
  const handleCanvasClick = () => {
    setSelectedComponent(null);
    setSelectedPipe(null);
    setConnectionStart(null);
  };
  
  // Handle port click for piping
  const handlePortClick = (componentId, portId) => {
    if (isSimulating) return;
    
    if (!connectionStart) {
      setConnectionStart({ componentId, portId });
    } else {
      if (connectionStart.componentId === componentId && connectionStart.portId === portId) {
        setConnectionStart(null);
        return;
      }
      
      // Create new pipe
      const startComp = components.find((c) => c.id === connectionStart.componentId);
      const endComp = components.find((c) => c.id === componentId);
      
      if (startComp && endComp) {
        const startPort = startComp.ports.find((p) => p.id === connectionStart.portId);
        const endPort = endComp.ports.find((p) => p.id === portId);
        
        if (startPort && endPort) {
          const newPipe = {
            id: `pipe_${Date.now()}`,
            startComponentId: connectionStart.componentId,
            startPortId: connectionStart.portId,
            endComponentId: componentId,
            endPortId: portId,
            points: [
              { x: startComp.x + startPort.x, y: startComp.y + startPort.y },
              { x: endComp.x + endPort.x, y: endComp.y + endPort.y },
            ],
            diameter: 10,
          };
          setPipes((prev) => [...prev, newPipe]);
        }
      }
      setConnectionStart(null);
    }
  };
  
  // Handle mouse move
  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left - viewOffset.x) / zoom,
      y: (e.clientY - rect.top - viewOffset.y) / zoom,
    });
  };
  
  // Update component
  const handleUpdateComponent = (updates) => {
    if (!selectedComponent) return;
    setComponents((prev) =>
      prev.map((c) => (c.id === selectedComponent.id ? { ...c, ...updates } : c))
    );
    setSelectedComponent((prev) => (prev ? { ...prev, ...updates } : null));
  };
  
  // Delete component
  const handleDeleteComponent = () => {
    if (!selectedComponent) return;
    setComponents((prev) => prev.filter((c) => c.id !== selectedComponent.id));
    setPipes((prev) =>
      prev.filter(
        (p) => p.startComponentId !== selectedComponent.id && p.endComponentId !== selectedComponent.id
      )
    );
    setSelectedComponent(null);
  };
  
  // Delete pipe
  const handleDeletePipe = () => {
    if (!selectedPipe) return;
    setPipes((prev) => prev.filter((p) => p.id !== selectedPipe.id));
    setSelectedPipe(null);
  };
  
  // Simulation loop
  useEffect(() => {
    if (!isSimulating) {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
        simulationRef.current = null;
      }
      // Reset states
      setComponents((prev) =>
        prev.map((c) => ({
          ...c,
          state: {},
        }))
      );
      return;
    }
    
    simulationRef.current = setInterval(() => {
      setComponents((prev) => {
        // Find pumps
        const pumps = prev.filter((c) => 
          [ComponentTypes.HYDRAULIC_PUMP, ComponentTypes.PNEUMATIC_COMPRESSOR].includes(c.type)
        );
        
        if (pumps.length === 0) return prev;
        
        // Simple simulation: propagate pressure and flow
        const activeIds = new Set();
        pumps.forEach((pump) => {
          activeIds.add(pump.id);
          // Find pipes from this pump
          pipes.forEach((pipe) => {
            if (pipe.startComponentId === pump.id || pipe.endComponentId === pump.id) {
              const targetId = pipe.startComponentId === pump.id ? pipe.endComponentId : pipe.startComponentId;
              activeIds.add(targetId);
            }
          });
        });
        
        return prev.map((c) => {
          const isActive = activeIds.has(c.id);
          const pump = pumps[0];
          
          return {
            ...c,
            state: {
              isActive,
              pressure: isActive ? (pump?.properties?.maxPressure || 210) * 0.6 : 0,
              flow: isActive ? (pump?.properties?.flowRate || 50) * 0.9 : 0,
              position: c.type === ComponentTypes.DOUBLE_ACTING_CYLINDER && isActive ? 1 : 0,
            },
          };
        });
      });
    }, 100);
    
    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
      }
    };
  }, [isSimulating, pipes]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedComponent) {
          handleDeleteComponent();
        } else if (selectedPipe) {
          handleDeletePipe();
        }
      }
      if (e.key === 'Escape') {
        setConnectionStart(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent, selectedPipe]);
  
  // Save circuit
  const handleSave = () => {
    const circuit = { components, pipes };
    const blob = new Blob([JSON.stringify(circuit, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fluid_circuit.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // Load circuit
  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const circuit = JSON.parse(event.target?.result);
            setComponents(circuit.components || []);
            setPipes(circuit.pipes || []);
          } catch (err) {
            console.error('Failed to load circuit:', err);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };
  
  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(3, z * 1.2));
  const handleZoomOut = () => setZoom((z) => Math.max(0.3, z / 1.2));
  const handleResetView = () => {
    setZoom(1);
    setViewOffset({ x: 0, y: 0 });
  };
  
  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100">
      {/* Toolbar */}
      <div className="h-12 bg-gray-900 border-b border-gray-700 flex items-center px-4 gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-sm">Fluid Simulator</span>
        </div>
        
        <div className="w-px h-6 bg-gray-700" />
        
        {/* Simulation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isSimulating
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isSimulating ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isSimulating ? 'Stop' : 'Run'}
          </button>
          <button
            onClick={handleResetView}
            className="px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
        
        <div className="w-px h-6 bg-gray-700" />
        
        {/* File Operations */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs flex items-center gap-1.5"
          >
            <Save className="w-3 h-3" />
            Save
          </button>
          <button
            onClick={handleLoad}
            className="px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs flex items-center gap-1.5"
          >
            <FolderOpen className="w-3 h-3" />
            Load
          </button>
        </div>
        
        <div className="flex-1" />
        
        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button onClick={handleZoomOut} className="p-1.5 hover:bg-gray-700 rounded">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} className="p-1.5 hover:bg-gray-700 rounded">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
        
        <div className="w-px h-6 bg-gray-700" />
        
        {/* Back to Dashboard */}
        <Link
          to="/dashboard"
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs flex items-center gap-1.5"
        >
          ← Dashboard
        </Link>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Component Palette */}
        <FluidComponentPalette onDragStart={handleDragStart} />
        
        {/* Canvas */}
        <div
          className="flex-1 relative overflow-hidden"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <svg
            ref={svgRef}
            className="w-full h-full"
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            style={{
              backgroundImage: `radial-gradient(circle, #374151 1px, transparent 1px)`,
              backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
              backgroundPosition: `${viewOffset.x}px ${viewOffset.y}px`,
            }}
          >
            <g transform={`translate(${viewOffset.x}, ${viewOffset.y}) scale(${zoom})`}>
              {/* Grid */}
              <defs>
                <pattern id="fluidGrid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="0.5" fill="#4b5563" />
                </pattern>
              </defs>
              
              {/* Pipes */}
              {pipes.map((pipe) => (
                <PipeRenderer
                  key={pipe.id}
                  pipe={pipe}
                  isSelected={selectedPipe?.id === pipe.id}
                  hasFlow={isSimulating && components.find((c) => c.id === pipe.startComponentId)?.state?.isActive}
                  onClick={(e) => handlePipeClick(e, pipe)}
                />
              ))}
              
              {/* Connection preview */}
              {connectionStart && (
                <line
                  x1={components.find((c) => c.id === connectionStart.componentId)?.x || 0}
                  y1={components.find((c) => c.id === connectionStart.componentId)?.y || 0}
                  x2={mousePos.x}
                  y2={mousePos.y}
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray="4"
                />
              )}
              
              {/* Components */}
              {components.map((component) => (
                <FluidComponentRenderer
                  key={component.id}
                  component={component}
                  isSelected={selectedComponent?.id === component.id}
                  isSimulating={isSimulating}
                  onClick={(e) => handleComponentClick(e, component)}
                  onPortClick={handlePortClick}
                />
              ))}
            </g>
          </svg>
          
          {/* Status indicator */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded text-xs">
            <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            {isSimulating ? 'Simulation Running' : 'Ready'}
            {connectionStart && <span className="text-blue-400 ml-2">• Piping Mode</span>}
          </div>
        </div>
        
        {/* Right Panel */}
        {activePanel === 'properties' ? (
          <FluidPropertiesPanel
            component={selectedComponent}
            onUpdate={handleUpdateComponent}
            onDelete={handleDeleteComponent}
          />
        ) : (
          <FluidAnalysisPanel
            components={components}
            pipes={pipes}
            isSimulating={isSimulating}
          />
        )}
      </div>
      
      {/* Panel Tabs */}
      <div className="absolute right-72 top-12 flex border-b border-gray-700 bg-gray-900">
        <button
          onClick={() => setActivePanel('properties')}
          className={`px-4 py-2 text-xs font-medium ${
            activePanel === 'properties' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'
          }`}
        >
          Properties
        </button>
        <button
          onClick={() => setActivePanel('analysis')}
          className={`px-4 py-2 text-xs font-medium ${
            activePanel === 'analysis' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'
          }`}
        >
          Analysis
        </button>
      </div>
    </div>
  );
};

export default FluidSimulator;
