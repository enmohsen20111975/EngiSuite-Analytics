/**
 * Electrical Simulator 2 - Advanced Industrial Circuit Simulator
 * Based on Google AI Studio Electrical Simulator
 * Features: Power/Control diagrams, PLC integration, Motor control circuits
 */
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, Play, Square, Save, FolderOpen, RotateCcw, ZoomIn, ZoomOut, 
  Grid, Settings, BookOpen, Split, ChevronDown, ChevronRight, Trash2,
  AlertTriangle, Power, CircuitBoard, Cpu, Lightbulb, Gauge
} from 'lucide-react';

// ============================================================================
// Component Type Definitions
// ============================================================================
const ComponentTypes = {
  // Power Components
  AC_SOURCE: 'ac_source',
  DC_SOURCE: 'dc_source',
  TRANSFORMER: 'transformer',
  MOTOR: 'motor',
  DC_MOTOR: 'dc_motor',
  
  // Protection Devices
  MCB: 'mcb',
  MCCB: 'mccb',
  ACB: 'acb',
  FUSE: 'fuse',
  MOTOR_PROTECTOR: 'motor_protector',
  RCBO: 'rcbo',
  
  // Switching Devices
  CONTACTOR: 'contactor',
  CONTACTOR_COIL: 'contactor_coil',
  RELAY: 'relay',
  RELAY_COIL: 'relay_coil',
  CONTACT_NO: 'contact_no',
  CONTACT_NC: 'contact_nc',
  
  // Control Components
  PUSH_BUTTON: 'push_button',
  E_STOP: 'e_stop',
  SELECTOR_SWITCH: 'selector_switch',
  LIMIT_SWITCH: 'limit_switch',
  PROXIMITY_SENSOR: 'proximity_sensor',
  
  // Logic Gates
  AND_GATE: 'and_gate',
  OR_GATE: 'or_gate',
  NOT_GATE: 'not_gate',
  
  // PLC
  PLC_INPUT: 'plc_input',
  PLC_OUTPUT: 'plc_output',
  
  // Other
  JUNCTION: 'junction',
  RESISTOR: 'resistor',
  LAMP: 'lamp',
  LED: 'led',
};

// ============================================================================
// Component Catalog
// ============================================================================
const ComponentCatalog = {
  power: {
    name: 'Power Components',
    icon: Power,
    components: [
      { type: ComponentTypes.AC_SOURCE, name: 'AC Source', defaultLabel: 'AC1', voltage: 400, phases: 3 },
      { type: ComponentTypes.DC_SOURCE, name: 'DC Source', defaultLabel: 'DC1', voltage: 24 },
      { type: ComponentTypes.TRANSFORMER, name: 'Transformer', defaultLabel: 'TR1', ratio: '400/24' },
      { type: ComponentTypes.MOTOR, name: '3-Phase Motor', defaultLabel: 'M1', power: 5.5 },
      { type: ComponentTypes.DC_MOTOR, name: 'DC Motor', defaultLabel: 'M2', power: 1.5 },
    ],
  },
  protection: {
    name: 'Protection Devices',
    icon: AlertTriangle,
    components: [
      { type: ComponentTypes.MCB, name: 'MCB', defaultLabel: 'Q1', ratedCurrent: 16 },
      { type: ComponentTypes.MCCB, name: 'MCCB', defaultLabel: 'Q2', ratedCurrent: 100 },
      { type: ComponentTypes.ACB, name: 'ACB', defaultLabel: 'Q3', ratedCurrent: 630 },
      { type: ComponentTypes.FUSE, name: 'Fuse', defaultLabel: 'F1', ratedCurrent: 10 },
      { type: ComponentTypes.MOTOR_PROTECTOR, name: 'Motor Protector', defaultLabel: 'MP1' },
      { type: ComponentTypes.RCBO, name: 'RCBO', defaultLabel: 'RCBO1' },
    ],
  },
  switching: {
    name: 'Switching Devices',
    icon: CircuitBoard,
    components: [
      { type: ComponentTypes.CONTACTOR, name: 'Contactor (NO)', defaultLabel: 'K1', linkId: 'K1' },
      { type: ComponentTypes.CONTACTOR_COIL, name: 'Contactor Coil', defaultLabel: 'K1', linkId: 'K1' },
      { type: ComponentTypes.RELAY, name: 'Relay (NO)', defaultLabel: 'R1', linkId: 'R1' },
      { type: ComponentTypes.RELAY_COIL, name: 'Relay Coil', defaultLabel: 'R1', linkId: 'R1' },
      { type: ComponentTypes.CONTACT_NO, name: 'NO Contact', defaultLabel: 'NO1' },
      { type: ComponentTypes.CONTACT_NC, name: 'NC Contact', defaultLabel: 'NC1' },
    ],
  },
  control: {
    name: 'Control Components',
    icon: Settings,
    components: [
      { type: ComponentTypes.PUSH_BUTTON, name: 'Push Button (NO)', defaultLabel: 'PB1', normallyOpen: true },
      { type: ComponentTypes.E_STOP, name: 'E-Stop', defaultLabel: 'ES1' },
      { type: ComponentTypes.SELECTOR_SWITCH, name: 'Selector Switch', defaultLabel: 'SS1' },
      { type: ComponentTypes.LIMIT_SWITCH, name: 'Limit Switch', defaultLabel: 'LS1' },
      { type: ComponentTypes.PROXIMITY_SENSOR, name: 'Proximity Sensor', defaultLabel: 'PX1' },
    ],
  },
  plc: {
    name: 'PLC Components',
    icon: Cpu,
    components: [
      { type: ComponentTypes.PLC_INPUT, name: 'PLC Input', defaultLabel: 'I0.0', address: 'I0.0' },
      { type: ComponentTypes.PLC_OUTPUT, name: 'PLC Output', defaultLabel: 'Q0.0', address: 'Q0.0' },
    ],
  },
  logic: {
    name: 'Logic Gates',
    icon: Lightbulb,
    components: [
      { type: ComponentTypes.AND_GATE, name: 'AND Gate', defaultLabel: 'AND1', inputs: 2 },
      { type: ComponentTypes.OR_GATE, name: 'OR Gate', defaultLabel: 'OR1', inputs: 2 },
      { type: ComponentTypes.NOT_GATE, name: 'NOT Gate', defaultLabel: 'NOT1' },
    ],
  },
  other: {
    name: 'Other',
    icon: Grid,
    components: [
      { type: ComponentTypes.JUNCTION, name: 'Junction', defaultLabel: 'J1' },
      { type: ComponentTypes.RESISTOR, name: 'Resistor', defaultLabel: 'R1', resistance: 100 },
      { type: ComponentTypes.LAMP, name: 'Indicator Lamp', defaultLabel: 'H1' },
      { type: ComponentTypes.LED, name: 'LED', defaultLabel: 'LED1' },
    ],
  },
};

// ============================================================================
// Component Renderer
// ============================================================================
const ComponentRenderer = ({ component, isSelected, isSimulating, onClick, onTerminalClick }) => {
  const { type, x, y, rotation, properties, state, label } = component;
  
  const getComponentColor = () => {
    if (state?.isTripped) return '#ef4444';
    if (state?.isEnergized) return '#22c55e';
    if (state?.isOn) return '#3b82f6';
    return '#6b7280';
  };
  
  const renderSymbol = () => {
    const color = getComponentColor();
    
    switch (type) {
      case ComponentTypes.AC_SOURCE:
        return (
          <g>
            <circle cx="25" cy="25" r="20" fill="none" stroke={color} strokeWidth="2" />
            <path d="M15,25 Q20,15 25,25 Q30,35 35,25" fill="none" stroke={color} strokeWidth="2" />
            <text x="25" y="55" textAnchor="middle" fontSize="8" fill={color}>{properties?.voltage || 400}V</text>
          </g>
        );
      case ComponentTypes.DC_SOURCE:
        return (
          <g>
            <rect x="10" y="15" width="30" height="20" fill="none" stroke={color} strokeWidth="2" />
            <line x1="18" y1="25" x2="22" y2="25" stroke={color} strokeWidth="2" />
            <line x1="28" y1="22" x2="28" y2="28" stroke={color} strokeWidth="2" />
            <line x1="25" y1="25" x2="31" y2="25" stroke={color} strokeWidth="2" />
            <text x="25" y="55" textAnchor="middle" fontSize="8" fill={color}>{properties?.voltage || 24}V DC</text>
          </g>
        );
      case ComponentTypes.MOTOR:
        return (
          <g>
            <circle cx="25" cy="25" r="18" fill="none" stroke={color} strokeWidth="2" />
            <text x="25" y="28" textAnchor="middle" fontSize="10" fontWeight="bold" fill={color}>M</text>
            <text x="25" y="55" textAnchor="middle" fontSize="8" fill={color}>{properties?.power || 5.5}kW</text>
          </g>
        );
      case ComponentTypes.CONTACTOR:
      case ComponentTypes.CONTACT_NO:
        return (
          <g>
            <line x1="15" y1="15" x2="15" y2="22" stroke={color} strokeWidth="2" />
            <line x1="35" y1="15" x2="35" y2="22" stroke={color} strokeWidth="2" />
            <line x1="15" y1="22" x2="35" y2="28" stroke={color} strokeWidth="2" />
            <line x1="15" y1="28" x2="15" y2="35" stroke={color} strokeWidth="2" />
            <line x1="35" y1="28" x2="35" y2="35" stroke={color} strokeWidth="2" />
          </g>
        );
      case ComponentTypes.CONTACT_NC:
        return (
          <g>
            <line x1="15" y1="15" x2="15" y2="20" stroke={color} strokeWidth="2" />
            <line x1="35" y1="15" x2="35" y2="20" stroke={color} strokeWidth="2" />
            <line x1="15" y1="20" x2="35" y2="30" stroke={color} strokeWidth="2" />
            <line x1="15" y1="30" x2="15" y2="35" stroke={color} strokeWidth="2" />
            <line x1="35" y1="30" x2="35" y2="35" stroke={color} strokeWidth="2" />
          </g>
        );
      case ComponentTypes.CONTACTOR_COIL:
      case ComponentTypes.RELAY_COIL:
        return (
          <g>
            <circle cx="25" cy="25" r="12" fill="none" stroke={color} strokeWidth="2" />
            <line x1="25" y1="13" x2="25" y2="5" stroke={color} strokeWidth="2" />
            <line x1="25" y1="37" x2="25" y2="45" stroke={color} strokeWidth="2" />
            <text x="25" y="29" textAnchor="middle" fontSize="8" fill={color}>C</text>
          </g>
        );
      case ComponentTypes.PUSH_BUTTON:
        return (
          <g>
            <line x1="15" y1="15" x2="15" y2="20" stroke={color} strokeWidth="2" />
            <line x1="35" y1="15" x2="35" y2="20" stroke={color} strokeWidth="2" />
            <line x1="15" y1="20" x2="35" y2="20" stroke={color} strokeWidth="2" />
            <line x1="15" y1="20" x2="15" y2="35" stroke={color} strokeWidth="2" />
            <line x1="35" y1="20" x2="35" y2="35" stroke={color} strokeWidth="2" />
            <line x1="20" y1="12" x2="30" y2="12" stroke={color} strokeWidth="2" />
            <line x1="25" y1="12" x2="25" y2="5" stroke={color} strokeWidth="2" />
          </g>
        );
      case ComponentTypes.E_STOP:
        return (
          <g>
            <circle cx="25" cy="25" r="15" fill="none" stroke="#ef4444" strokeWidth="2" />
            <circle cx="25" cy="25" r="10" fill="#ef4444" />
            <line x1="25" y1="5" x2="25" y2="0" stroke={color} strokeWidth="2" />
          </g>
        );
      case ComponentTypes.MCB:
      case ComponentTypes.MCCB:
        return (
          <g>
            <rect x="15" y="10" width="20" height="30" fill="none" stroke={color} strokeWidth="2" />
            <line x1="20" y1="15" x2="20" y2="25" stroke={color} strokeWidth="2" />
            <line x1="30" y1="15" x2="30" y2="25" stroke={color} strokeWidth="2" />
            <line x1="20" y1="25" x2="30" y2="30" stroke={color} strokeWidth="2" />
            <text x="25" y="55" textAnchor="middle" fontSize="8" fill={color}>{properties?.ratedCurrent || 16}A</text>
          </g>
        );
      case ComponentTypes.FUSE:
        return (
          <g>
            <rect x="15" y="15" width="20" height="20" fill="none" stroke={color} strokeWidth="2" />
            <line x1="20" y1="20" x2="30" y2="20" stroke={color} strokeWidth="2" />
            <line x1="20" y1="30" x2="30" y2="30" stroke={color} strokeWidth="2" />
            <line x1="25" y1="20" x2="25" y2="30" stroke={color} strokeWidth="2" />
          </g>
        );
      case ComponentTypes.LAMP:
      case ComponentTypes.LED:
        return (
          <g>
            <circle cx="25" cy="25" r="12" fill={state?.isOn ? '#22c55e' : 'none'} stroke={color} strokeWidth="2" />
            <line x1="20" y1="20" x2="30" y2="30" stroke={color} strokeWidth="1" />
            <line x1="30" y1="20" x2="20" y2="30" stroke={color} strokeWidth="1" />
          </g>
        );
      case ComponentTypes.PLC_INPUT:
        return (
          <g>
            <rect x="10" y="15" width="30" height="20" fill="none" stroke="#3b82f6" strokeWidth="2" />
            <text x="25" y="28" textAnchor="middle" fontSize="8" fill="#3b82f6">I</text>
            <text x="25" y="50" textAnchor="middle" fontSize="7" fill={color}>{properties?.address || 'I0.0'}</text>
          </g>
        );
      case ComponentTypes.PLC_OUTPUT:
        return (
          <g>
            <rect x="10" y="15" width="30" height="20" fill="none" stroke="#22c55e" strokeWidth="2" />
            <text x="25" y="28" textAnchor="middle" fontSize="8" fill="#22c55e">Q</text>
            <text x="25" y="50" textAnchor="middle" fontSize="7" fill={color}>{properties?.address || 'Q0.0'}</text>
          </g>
        );
      case ComponentTypes.JUNCTION:
        return (
          <g>
            <circle cx="25" cy="25" r="5" fill={state?.isEnergized ? '#22c55e' : color} />
          </g>
        );
      case ComponentTypes.RESISTOR:
        return (
          <g>
            <line x1="10" y1="25" x2="15" y2="25" stroke={color} strokeWidth="2" />
            <path d="M15,25 L17,20 L21,30 L25,20 L29,30 L33,20 L35,25" fill="none" stroke={color} strokeWidth="2" />
            <line x1="35" y1="25" x2="40" y2="25" stroke={color} strokeWidth="2" />
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
  
  const terminals = component.terminals || [
    { id: 't1', x: 0, y: 15 },
    { id: 't2', x: 50, y: 15 },
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
      
      {/* Terminals */}
      {terminals.map((terminal) => (
        <circle
          key={terminal.id}
          cx={terminal.x}
          cy={terminal.y}
          r="4"
          fill={state?.isEnergized ? '#22c55e' : '#475569'}
          stroke="#1e293b"
          strokeWidth="1"
          onClick={(e) => {
            e.stopPropagation();
            onTerminalClick(component.id, terminal.id);
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
// Wire Renderer
// ============================================================================
const WireRenderer = ({ wire, isSelected, isEnergized, onClick }) => {
  const path = wire.points || [];
  if (path.length < 2) return null;
  
  const pathD = path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Wire shadow for easier clicking */}
      <path d={pathD} fill="none" stroke="transparent" strokeWidth="10" />
      {/* Main wire */}
      <path
        d={pathD}
        fill="none"
        stroke={isSelected ? '#3b82f6' : isEnergized ? '#22c55e' : '#64748b'}
        strokeWidth={isSelected ? 3 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isEnergized ? 'animate-pulse' : ''}
      />
    </g>
  );
};

// ============================================================================
// Component Palette
// ============================================================================
const ComponentPalette = ({ onDragStart }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredCatalog = useMemo(() => {
    if (!searchTerm) return ComponentCatalog;
    const filtered = {};
    Object.entries(ComponentCatalog).forEach(([key, category]) => {
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
          <CircuitBoard className="w-4 h-4" />
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
                  <Icon className="w-3.5 h-3.5" />
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
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
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
const PropertiesPanel = ({ component, onUpdate, onDelete }) => {
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
  
  const catalog = Object.values(ComponentCatalog)
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
        {component.properties?.voltage !== undefined && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Voltage (V)</label>
            <input
              type="number"
              value={component.properties.voltage}
              onChange={(e) => onUpdate({ properties: { ...component.properties, voltage: parseFloat(e.target.value) } })}
              className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
        
        {component.properties?.power !== undefined && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Power (kW)</label>
            <input
              type="number"
              value={component.properties.power}
              onChange={(e) => onUpdate({ properties: { ...component.properties, power: parseFloat(e.target.value) } })}
              className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
        
        {component.properties?.ratedCurrent !== undefined && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Rated Current (A)</label>
            <input
              type="number"
              value={component.properties.ratedCurrent}
              onChange={(e) => onUpdate({ properties: { ...component.properties, ratedCurrent: parseFloat(e.target.value) } })}
              className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
        
        {component.properties?.linkId !== undefined && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Link ID</label>
            <input
              type="text"
              value={component.properties.linkId}
              onChange={(e) => onUpdate({ properties: { ...component.properties, linkId: e.target.value } })}
              className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
        
        {component.properties?.address !== undefined && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Address</label>
            <input
              type="text"
              value={component.properties.address}
              onChange={(e) => onUpdate({ properties: { ...component.properties, address: e.target.value } })}
              className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
        
        {/* Live State (when simulating) */}
        {component.state && Object.keys(component.state).length > 0 && (
          <div className="mt-4 p-2 bg-gray-800 rounded">
            <h4 className="text-xs font-semibold text-green-400 mb-2">Live State</h4>
            {Object.entries(component.state).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs py-0.5">
                <span className="text-gray-400">{key}:</span>
                <span className="text-green-400 font-mono">
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
const AnalysisPanel = ({ components, wires, isSimulating }) => {
  const poweredComponents = components.filter((c) => c.state?.isEnergized);
  const trippedComponents = components.filter((c) => c.state?.isTripped);
  
  return (
    <div className="w-72 bg-gray-900 border-l border-gray-700 flex flex-col h-full">
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <Gauge className="w-4 h-4" />
          Analysis
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
            <div className="text-lg font-bold text-purple-400">{wires.length}</div>
            <div className="text-xs text-gray-400">Wires</div>
          </div>
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-lg font-bold text-green-400">{poweredComponents.length}</div>
            <div className="text-xs text-gray-400">Energized</div>
          </div>
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-lg font-bold text-red-400">{trippedComponents.length}</div>
            <div className="text-xs text-gray-400">Tripped</div>
          </div>
        </div>
        
        {/* Events Log */}
        <div>
          <h4 className="text-xs font-semibold text-gray-300 mb-2">Events</h4>
          <div className="bg-gray-800 rounded p-2 text-xs space-y-1 max-h-40 overflow-y-auto">
            {isSimulating ? (
              <div className="text-green-400">▶ Simulation started</div>
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
// Main Simulator Component
// ============================================================================
const ElectricalSimulator2 = () => {
  // State
  const [components, setComponents] = useState([]);
  const [wires, setWires] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedWire, setSelectedWire] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [activePanel, setActivePanel] = useState('properties');
  const [wiringStart, setWiringStart] = useState(null);
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
      terminals: [
        { id: 't1', x: 0, y: 15 },
        { id: 't2', x: 50, y: 15 },
      ],
    };
    
    setComponents((prev) => [...prev, newComponent]);
  };
  
  // Handle component click
  const handleComponentClick = (e, component) => {
    e.stopPropagation();
    setSelectedComponent(component);
    setSelectedWire(null);
  };
  
  // Handle wire click
  const handleWireClick = (e, wire) => {
    e.stopPropagation();
    setSelectedWire(wire);
    setSelectedComponent(null);
  };
  
  // Handle canvas click
  const handleCanvasClick = () => {
    setSelectedComponent(null);
    setSelectedWire(null);
    setWiringStart(null);
  };
  
  // Handle terminal click for wiring
  const handleTerminalClick = (componentId, terminalId) => {
    if (isSimulating) return;
    
    if (!wiringStart) {
      setWiringStart({ componentId, terminalId });
    } else {
      if (wiringStart.componentId === componentId && wiringStart.terminalId === terminalId) {
        setWiringStart(null);
        return;
      }
      
      // Create new wire
      const startComp = components.find((c) => c.id === wiringStart.componentId);
      const endComp = components.find((c) => c.id === componentId);
      
      if (startComp && endComp) {
        const startTerminal = startComp.terminals.find((t) => t.id === wiringStart.terminalId);
        const endTerminal = endComp.terminals.find((t) => t.id === terminalId);
        
        if (startTerminal && endTerminal) {
          const newWire = {
            id: `wire_${Date.now()}`,
            startComponentId: wiringStart.componentId,
            startTerminalId: wiringStart.terminalId,
            endComponentId: componentId,
            endTerminalId: terminalId,
            points: [
              { x: startComp.x + startTerminal.x, y: startComp.y + startTerminal.y },
              { x: endComp.x + endTerminal.x, y: endComp.y + endTerminal.y },
            ],
          };
          setWires((prev) => [...prev, newWire]);
        }
      }
      setWiringStart(null);
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
    setWires((prev) =>
      prev.filter(
        (w) => w.startComponentId !== selectedComponent.id && w.endComponentId !== selectedComponent.id
      )
    );
    setSelectedComponent(null);
  };
  
  // Delete wire
  const handleDeleteWire = () => {
    if (!selectedWire) return;
    setWires((prev) => prev.filter((w) => w.id !== selectedWire.id));
    setSelectedWire(null);
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
        // Find power sources
        const sources = prev.filter((c) => 
          [ComponentTypes.AC_SOURCE, ComponentTypes.DC_SOURCE].includes(c.type)
        );
        
        if (sources.length === 0) return prev;
        
        // Simple simulation: energize connected components
        const energizedIds = new Set();
        sources.forEach((source) => {
          energizedIds.add(source.id);
          // Find wires from this source
          wires.forEach((wire) => {
            if (wire.startComponentId === source.id || wire.endComponentId === source.id) {
              const targetId = wire.startComponentId === source.id ? wire.endComponentId : wire.startComponentId;
              energizedIds.add(targetId);
            }
          });
        });
        
        // Propagate through wires
        let changed = true;
        while (changed) {
          changed = false;
          wires.forEach((wire) => {
            if (energizedIds.has(wire.startComponentId) && !energizedIds.has(wire.endComponentId)) {
              const endComp = prev.find((c) => c.id === wire.endComponentId);
              // Check if component allows power flow
              if (endComp?.type === ComponentTypes.CONTACT_NO || 
                  endComp?.type === ComponentTypes.CONTACTOR) {
                // Check if contact is closed
                const coil = prev.find((c) => c.properties?.linkId === endComp.properties?.linkId && 
                  [ComponentTypes.CONTACTOR_COIL, ComponentTypes.RELAY_COIL].includes(c.type));
                if (coil?.state?.isEnergized) {
                  energizedIds.add(wire.endComponentId);
                  changed = true;
                }
              } else if (endComp?.type !== ComponentTypes.CONTACT_NC) {
                energizedIds.add(wire.endComponentId);
                changed = true;
              }
            }
            if (energizedIds.has(wire.endComponentId) && !energizedIds.has(wire.startComponentId)) {
              const startComp = prev.find((c) => c.id === wire.startComponentId);
              if (startComp?.type !== ComponentTypes.CONTACT_NC) {
                energizedIds.add(wire.startComponentId);
                changed = true;
              }
            }
          });
        }
        
        return prev.map((c) => ({
          ...c,
          state: {
            ...c.state,
            isEnergized: energizedIds.has(c.id),
            isOn: [ComponentTypes.LAMP, ComponentTypes.LED].includes(c.type) && energizedIds.has(c.id),
          },
        }));
      });
    }, 100);
    
    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
      }
    };
  }, [isSimulating, wires]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedComponent) {
          handleDeleteComponent();
        } else if (selectedWire) {
          handleDeleteWire();
        }
      }
      if (e.key === 'Escape') {
        setWiringStart(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent, selectedWire]);
  
  // Save circuit
  const handleSave = () => {
    const circuit = { components, wires };
    const blob = new Blob([JSON.stringify(circuit, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'electrical_circuit_v2.json';
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
            setWires(circuit.wires || []);
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
          <Zap className="w-5 h-5 text-yellow-500" />
          <span className="font-semibold text-sm">Electrical Simulator 2</span>
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
        <ComponentPalette onDragStart={handleDragStart} />
        
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
                <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="0.5" fill="#4b5563" />
                </pattern>
              </defs>
              
              {/* Wires */}
              {wires.map((wire) => (
                <WireRenderer
                  key={wire.id}
                  wire={wire}
                  isSelected={selectedWire?.id === wire.id}
                  isEnergized={isSimulating && components.find((c) => c.id === wire.startComponentId)?.state?.isEnergized}
                  onClick={(e) => handleWireClick(e, wire)}
                />
              ))}
              
              {/* Wiring preview */}
              {wiringStart && (
                <line
                  x1={components.find((c) => c.id === wiringStart.componentId)?.x || 0}
                  y1={components.find((c) => c.id === wiringStart.componentId)?.y || 0}
                  x2={mousePos.x}
                  y2={mousePos.y}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="4"
                />
              )}
              
              {/* Components */}
              {components.map((component) => (
                <ComponentRenderer
                  key={component.id}
                  component={component}
                  isSelected={selectedComponent?.id === component.id}
                  isSimulating={isSimulating}
                  onClick={(e) => handleComponentClick(e, component)}
                  onTerminalClick={handleTerminalClick}
                />
              ))}
            </g>
          </svg>
          
          {/* Status indicator */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded text-xs">
            <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            {isSimulating ? 'Simulation Running' : 'Ready'}
            {wiringStart && <span className="text-blue-400 ml-2">• Wiring Mode</span>}
          </div>
        </div>
        
        {/* Right Panel */}
        {activePanel === 'properties' ? (
          <PropertiesPanel
            component={selectedComponent}
            onUpdate={handleUpdateComponent}
            onDelete={handleDeleteComponent}
          />
        ) : (
          <AnalysisPanel
            components={components}
            wires={wires}
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

export default ElectricalSimulator2;
