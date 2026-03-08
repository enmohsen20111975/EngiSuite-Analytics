/**
 * Logic Simulator Page - Advanced Version
 * Full-featured logic circuit simulator with all original SubSaaS features
 * Includes: All gate types, flip-flops, MUX/DEMUX, wire routing, truth table, 7-segment display
 */
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Input, Loader, Select } from '../components/ui';
import canvasService from '../services/canvasService';
import {
  Save, FolderOpen, Download, Upload, Trash2, Plus,
  Play, Pause, RotateCcw, Zap, CircuitBoard, StepForward,
  MousePointer, Move, Copy, Scissors, Clipboard,
  Grid3x3, ZoomIn, ZoomOut, Maximize, CircleQuestionMark, Table, Clock
} from 'lucide-react';
import { cn } from '../lib/utils';

// Component types with all advanced components
const COMPONENT_TYPES = {
  // Basic Gates
  AND: { name: 'AND', inputs: 2, outputs: 1, symbol: '&', category: 'basic' },
  OR: { name: 'OR', inputs: 2, outputs: 1, symbol: '≥1', category: 'basic' },
  NOT: { name: 'NOT', inputs: 1, outputs: 1, symbol: '1', category: 'basic' },
  NAND: { name: 'NAND', inputs: 2, outputs: 1, symbol: '&̅', category: 'basic' },
  NOR: { name: 'NOR', inputs: 2, outputs: 1, symbol: '≥1̅', category: 'basic' },
  XOR: { name: 'XOR', inputs: 2, outputs: 1, symbol: '=1', category: 'basic' },
  XNOR: { name: 'XNOR', inputs: 2, outputs: 1, symbol: '=1̅', category: 'basic' },
  
  // Input/Output
  INPUT: { name: 'Input', inputs: 0, outputs: 1, symbol: '→', category: 'io', isInput: true },
  OUTPUT: { name: 'Output', inputs: 1, outputs: 0, symbol: '⊙', category: 'io', isOutput: true },
  SWITCH: { name: 'Switch', inputs: 0, outputs: 1, symbol: '⏻', category: 'io', isInput: true },
  LED: { name: 'LED', inputs: 1, outputs: 0, symbol: '💡', category: 'io', isOutput: true },
  CLOCK: { name: 'Clock', inputs: 0, outputs: 1, symbol: '⏱', category: 'io', isInput: true },
  
  // Flip-Flops
  D_FF: { name: 'D Flip-Flop', inputs: 2, outputs: 2, symbol: 'D', category: 'sequential', hasClk: true },
  T_FF: { name: 'T Flip-Flop', inputs: 2, outputs: 2, symbol: 'T', category: 'sequential', hasClk: true },
  JK_FF: { name: 'JK Flip-Flop', inputs: 3, outputs: 2, symbol: 'JK', category: 'sequential', hasClk: true },
  SR_FF: { name: 'SR Flip-Flop', inputs: 3, outputs: 2, symbol: 'SR', category: 'sequential', hasClk: true },
  
  // Advanced
  MUX: { name: 'Multiplexer', inputs: 4, outputs: 1, symbol: 'MUX', category: 'advanced' },
  DEMUX: { name: 'Demultiplexer', inputs: 2, outputs: 4, symbol: 'DEMUX', category: 'advanced' },
  ADDER: { name: 'Adder', inputs: 3, outputs: 2, symbol: 'Σ', category: 'advanced' },
  SEVEN_SEGMENT: { name: '7-Segment', inputs: 7, outputs: 0, symbol: '8', category: 'advanced' },
  
  // Utility
  TEXT: { name: 'Text Label', inputs: 0, outputs: 0, symbol: 'T', category: 'utility' },
};

// Component colors by category
const CATEGORY_COLORS = {
  basic: '#3b82f6',
  io: '#22c55e',
  sequential: '#f59e0b',
  advanced: '#8b5cf6',
  utility: '#64748b',
};

/**
 * Component Renderer - Renders all gate types
 */
function ComponentRenderer({ component, isSelected, onClick, onPortClick, onToggleInput, onDragStart, scale = 1 }) {
  const config = COMPONENT_TYPES[component.type];
  const color = CATEGORY_COLORS[config.category] || '#64748b';
  const width = 70 * scale;
  const height = Math.max(50, (Math.max(config.inputs, config.outputs) + 1) * 18) * scale;
  
  // Render gate shape based on type
  const renderGateShape = () => {
    switch (component.type) {
      case 'AND':
        return (
          <path
            d={`M 0 0 L ${width * 0.4} 0 A ${width * 0.4} ${height/2} 0 0 1 ${width * 0.4} ${height} L 0 ${height} Z`}
            fill="white"
            stroke={color}
            strokeWidth={2}
          />
        );
      case 'OR':
        return (
          <path
            d={`M 0 0 Q ${width * 0.6} 0 ${width} ${height/2} Q ${width * 0.6} ${height} 0 ${height} Q ${width * 0.25} ${height/2} 0 0`}
            fill="white"
            stroke={color}
            strokeWidth={2}
          />
        );
      case 'NOT':
        const triangleEnd = width * 0.8;
        return (
          <>
            <path
              d={`M 0 0 L ${triangleEnd} ${height/2} L 0 ${height} Z`}
              fill="white"
              stroke={color}
              strokeWidth={2}
            />
            <circle
              cx={triangleEnd + 5}
              cy={height/2}
              r={5}
              fill="white"
              stroke={color}
              strokeWidth={2}
            />
          </>
        );
      case 'NAND':
        return (
          <>
            <path
              d={`M 0 0 L ${width * 0.35} 0 A ${width * 0.35} ${height/2} 0 0 1 ${width * 0.35} ${height} L 0 ${height} Z`}
              fill="white"
              stroke={color}
              strokeWidth={2}
            />
            <circle
              cx={width * 0.35 + 5}
              cy={height/2}
              r={5}
              fill="white"
              stroke={color}
              strokeWidth={2}
            />
          </>
        );
      case 'NOR':
        return (
          <>
            <path
              d={`M 0 0 Q ${width * 0.5} 0 ${width * 0.85} ${height/2} Q ${width * 0.5} ${height} 0 ${height} Q ${width * 0.2} ${height/2} 0 0`}
              fill="white"
              stroke={color}
              strokeWidth={2}
            />
            <circle
              cx={width * 0.85 + 5}
              cy={height/2}
              r={5}
              fill="white"
              stroke={color}
              strokeWidth={2}
            />
          </>
        );
      case 'XOR':
        return (
          <>
            <path
              d={`M ${8} 0 Q ${width * 0.6} 0 ${width} ${height/2} Q ${width * 0.6} ${height} ${8} ${height} Q ${width * 0.25} ${height/2} ${8} 0`}
              fill="white"
              stroke={color}
              strokeWidth={2}
            />
            <path
              d={`M 0 0 Q ${width * 0.2} ${height/2} 0 ${height}`}
              fill="none"
              stroke={color}
              strokeWidth={2}
            />
          </>
        );
      case 'XNOR':
        return (
          <>
            <path
              d={`M ${8} 0 Q ${width * 0.5} 0 ${width * 0.85} ${height/2} Q ${width * 0.5} ${height} ${8} ${height} Q ${width * 0.2} ${height/2} ${8} 0`}
              fill="white"
              stroke={color}
              strokeWidth={2}
            />
            <path
              d={`M 0 0 Q ${width * 0.15} ${height/2} 0 ${height}`}
              fill="none"
              stroke={color}
              strokeWidth={2}
            />
            <circle
              cx={width * 0.85 + 5}
              cy={height/2}
              r={5}
              fill="white"
              stroke={color}
              strokeWidth={2}
            />
          </>
        );
      case 'INPUT':
      case 'SWITCH':
        const isOn = component.outputValue;
        return (
          <g onClick={(e) => { e.stopPropagation(); onToggleInput?.(component.id); }}>
            <rect
              width={width * 0.7}
              height={height * 0.6}
              x={width * 0.15}
              y={height * 0.2}
              rx={5}
              fill={isOn ? '#22c55e' : '#ef4444'}
              stroke={color}
              strokeWidth={2}
              className="cursor-pointer"
            />
            <text
              x={width * 0.5}
              y={height * 0.55}
              textAnchor="middle"
              fontSize={12 * scale}
              fontWeight="bold"
              fill="white"
            >
              {isOn ? '1' : '0'}
            </text>
          </g>
        );
      case 'CLOCK':
        const clockOn = component.outputValue;
        return (
          <g>
            <rect
              width={width * 0.7}
              height={height * 0.6}
              x={width * 0.15}
              y={height * 0.2}
              rx={5}
              fill={clockOn ? '#22c55e' : '#64748b'}
              stroke={color}
              strokeWidth={2}
            />
            <path
              d={`M ${width * 0.3} ${height * 0.35} L ${width * 0.4} ${height * 0.35} L ${width * 0.4} ${height * 0.65} L ${width * 0.55} ${height * 0.65} L ${width * 0.55} ${height * 0.35} L ${width * 0.7} ${height * 0.35}`}
              fill="none"
              stroke="white"
              strokeWidth={2}
            />
          </g>
        );
      case 'OUTPUT':
      case 'LED':
        const isLit = component.inputValues?.[0];
        return (
          <g>
            <circle
              cx={width/2}
              cy={height/2}
              r={Math.min(width, height) * 0.35}
              fill={isLit ? '#22c55e' : '#374151'}
              stroke={color}
              strokeWidth={2}
              className={isLit ? 'drop-shadow-lg' : ''}
            />
            {component.type === 'LED' && isLit && (
              <circle
                cx={width/2}
                cy={height/2}
                r={Math.min(width, height) * 0.5}
                fill="rgba(34, 197, 94, 0.3)"
              />
            )}
          </g>
        );
      case 'D_FF':
      case 'T_FF':
      case 'JK_FF':
      case 'SR_FF':
        return (
          <g>
            <rect
              width={width}
              height={height}
              fill="white"
              stroke={color}
              strokeWidth={2}
            />
            <text x={width/2} y={height * 0.3} textAnchor="middle" fontSize={10 * scale} fontWeight="bold" fill={color}>
              {config.symbol}
            </text>
            <text x={8} y={height * 0.55} fontSize={8 * scale} fill="#666">D/T</text>
            <text x={8} y={height * 0.8} fontSize={8 * scale} fill="#666">CLK</text>
            <text x={width - 20} y={height * 0.55} fontSize={8 * scale} fill="#666">Q</text>
            <text x={width - 25} y={height * 0.85} fontSize={8 * scale} fill="#666">Q̄</text>
          </g>
        );
      case 'MUX':
      case 'DEMUX':
        return (
          <g>
            <path
              d={`M 0 ${height * 0.2} L ${width * 0.8} 0 L ${width} 0 L ${width} ${height} L ${width * 0.8} ${height} L 0 ${height * 0.8} Z`}
              fill="white"
              stroke={color}
              strokeWidth={2}
            />
            <text x={width/2} y={height/2 + 4} textAnchor="middle" fontSize={10 * scale} fontWeight="bold" fill={color}>
              {config.symbol}
            </text>
          </g>
        );
      case 'ADDER':
        return (
          <g>
            <rect
              width={width}
              height={height}
              fill="white"
              stroke={color}
              strokeWidth={2}
            />
            <text x={width/2} y={height/2 + 5} textAnchor="middle" fontSize={16 * scale} fontWeight="bold" fill={color}>
              Σ
            </text>
          </g>
        );
      case 'SEVEN_SEGMENT':
        const segments = component.segmentValues || [false, false, false, false, false, false, false];
        return <SevenSegmentDisplay segments={segments} x={0} y={0} width={width} height={height} />;
      case 'TEXT':
        return (
          <text
            x={width/2}
            y={height/2}
            textAnchor="middle"
            fontSize={14 * scale}
            fill={component.textColor || '#000'}
          >
            {component.text || 'Label'}
          </text>
        );
      default:
        return (
          <rect
            width={width}
            height={height}
            fill="white"
            stroke={color}
            strokeWidth={2}
          />
        );
    }
  };

  return (
    <g
      transform={`translate(${component.x}, ${component.y})`}
      onClick={(e) => { e.stopPropagation(); onClick(component.id); }}
      onMouseDown={(e) => { if (e.button === 0) onDragStart?.(component.id, e); }}
      className="cursor-move"
    >
      {/* Selection highlight */}
      {isSelected && (
        <rect
          x={-4 * scale}
          y={-4 * scale}
          width={width + 8 * scale}
          height={height + 8 * scale}
          rx={4 * scale}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="4"
        />
      )}
      
      {/* Component body */}
      {renderGateShape()}
      
      {/* Input ports */}
      {Array.from({ length: config.inputs }).map((_, i) => (
        <g key={`input-${i}`}>
          <circle
            cx={0}
            cy={((i + 1) * height) / (config.inputs + 1)}
            r={6 * scale}
            fill={component.inputValues?.[i] ? '#22c55e' : 'white'}
            stroke={color}
            strokeWidth={2}
            className="cursor-crosshair hover:scale-125 transition-transform"
            onMouseDown={(e) => {
              e.stopPropagation();
              onPortClick?.(component.id, 'input', i);
            }}
          />
          <line
            x1={-15 * scale}
            y1={((i + 1) * height) / (config.inputs + 1)}
            x2={0}
            y2={((i + 1) * height) / (config.inputs + 1)}
            stroke={color}
            strokeWidth={2}
          />
        </g>
      ))}
      
      {/* Output ports */}
      {Array.from({ length: config.outputs }).map((_, i) => (
        <g key={`output-${i}`}>
          <circle
            cx={width}
            cy={((i + 1) * height) / (config.outputs + 1)}
            r={6 * scale}
            fill={component.outputValue !== undefined ? (component.outputValues?.[i] ?? component.outputValue ? '#22c55e' : 'white') : 'white'}
            stroke={color}
            strokeWidth={2}
            className="cursor-crosshair hover:scale-125 transition-transform"
            onMouseDown={(e) => {
              e.stopPropagation();
              onPortClick?.(component.id, 'output', i);
            }}
          />
          <line
            x1={width}
            y1={((i + 1) * height) / (config.outputs + 1)}
            x2={width + 15 * scale}
            y2={((i + 1) * height) / (config.outputs + 1)}
            stroke={color}
            strokeWidth={2}
          />
        </g>
      ))}
      
      {/* Label */}
      {component.label && (
        <text
          x={width/2}
          y={-5 * scale}
          textAnchor="middle"
          fontSize={10 * scale}
          fill="#666"
        >
          {component.label}
        </text>
      )}
    </g>
  );
}

/**
 * Seven Segment Display Component
 */
function SevenSegmentDisplay({ segments, x, y, width, height }) {
  const segWidth = width * 0.12;
  const segHeight = height * 0.35;
  const gap = 2;
  
  // Segment positions (a=top, b=top-right, c=bottom-right, d=bottom, e=bottom-left, f=top-left, g=middle)
  const segmentPaths = [
    // a - top
    `M ${x + segWidth + gap} ${y + gap} L ${x + width - segWidth - gap} ${y + gap} L ${x + width - segWidth - gap * 2} ${y + segWidth} L ${x + segWidth + gap * 2} ${y + segWidth} Z`,
    // b - top right
    `M ${x + width - gap} ${y + segWidth + gap} L ${x + width - gap} ${y + height/2 - gap} L ${x + width - segWidth} ${y + height/2 - segWidth/2} L ${x + width - segWidth} ${y + segWidth + segWidth} Z`,
    // c - bottom right
    `M ${x + width - gap} ${y + height/2 + gap} L ${x + width - gap} ${y + height - segWidth - gap} L ${x + width - segWidth} ${y + height - segWidth * 2} L ${x + width - segWidth} ${y + height/2 + segWidth/2} Z`,
    // d - bottom
    `M ${x + segWidth + gap} ${y + height - gap} L ${x + width - segWidth - gap} ${y + height - gap} L ${x + width - segWidth - gap * 2} ${y + height - segWidth} L ${x + segWidth + gap * 2} ${y + height - segWidth} Z`,
    // e - bottom left
    `M ${x + gap} ${y + height/2 + gap} L ${x + gap} ${y + height - segWidth - gap} L ${x + segWidth} ${y + height - segWidth * 2} L ${x + segWidth} ${y + height/2 + segWidth/2} Z`,
    // f - top left
    `M ${x + gap} ${y + segWidth + gap} L ${x + gap} ${y + height/2 - gap} L ${x + segWidth} ${y + height/2 - segWidth/2} L ${x + segWidth} ${y + segWidth + segWidth} Z`,
    // g - middle
    `M ${x + segWidth + gap} ${y + height/2} L ${x + width - segWidth - gap} ${y + height/2} L ${x + width - segWidth - gap * 2} ${y + height/2 + segWidth} L ${x + segWidth + gap * 2} ${y + height/2 + segWidth} Z`,
  ];
  
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill="#1f2937" rx={4} />
      {segments.map((on, i) => (
        <path
          key={i}
          d={segmentPaths[i]}
          fill={on ? '#22c55e' : '#374151'}
        />
      ))}
    </g>
  );
}

/**
 * Wire with routing
 */
function RoutedWire({ wire, components, scale = 1, onDelete }) {
  const fromComp = components.find(c => c.id === wire.fromComponent);
  const toComp = components.find(c => c.id === wire.toComponent);

  if (!fromComp || !toComp) return null;

  const fromConfig = COMPONENT_TYPES[fromComp.type];
  const toConfig = COMPONENT_TYPES[toComp.type];

  const fromWidth = 70 * scale;
  const fromHeight = Math.max(50, (Math.max(fromConfig.inputs, fromConfig.outputs) + 1) * 18) * scale;
  const toHeight = Math.max(50, (Math.max(toConfig.inputs, toConfig.outputs) + 1) * 18) * scale;

  const x1 = fromComp.x + fromWidth + 15 * scale;
  const y1 = fromComp.y + ((wire.fromPort + 1) * fromHeight) / (fromConfig.outputs + 1);
  const x2 = toComp.x - 15 * scale;
  const y2 = toComp.y + ((wire.toPort + 1) * toHeight) / (toConfig.inputs + 1);

  const midX = (x1 + x2) / 2;
  const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

  return (
    <path
      d={path}
      fill="none"
      stroke={wire.value ? '#22c55e' : '#64748b'}
      strokeWidth={2}
      className="cursor-pointer hover:stroke-red-400"
      onContextMenu={(e) => { e.preventDefault(); onDelete?.(wire.id); }}
    />
  );
}

/**
 * Component Palette with categories
 */
function ComponentPalette({ onAddComponent }) {
  const [activeCategory, setActiveCategory] = useState('basic');
  
  const categories = {
    basic: 'Basic Gates',
    io: 'Input/Output',
    sequential: 'Sequential',
    advanced: 'Advanced',
    utility: 'Utility'
  };
  
  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Components</h3>
      
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 mb-2">
        {Object.entries(categories).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={cn(
              "px-2 py-1 text-xs rounded transition-colors",
              activeCategory === key
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      
      {/* Components grid */}
      <div className="grid grid-cols-2 gap-1">
        {Object.entries(COMPONENT_TYPES)
          .filter(([_, config]) => config.category === activeCategory)
          .map(([type, config]) => (
            <button
              key={type}
              onClick={() => onAddComponent(type)}
              className="flex flex-col items-center p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div
                className="w-10 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: CATEGORY_COLORS[config.category] }}
              >
                {config.symbol}
              </div>
              <span className="text-[10px] mt-1 text-gray-600 dark:text-gray-400 truncate w-full text-center">
                {config.name}
              </span>
            </button>
          ))}
      </div>
    </div>
  );
}

/**
 * Truth Table Generator
 */
function TruthTable({ components, wires, isOpen, onClose }) {
  // Find all inputs and outputs
  const inputs = components.filter(c => c.type === 'INPUT' || c.type === 'SWITCH');
  const outputs = components.filter(c => c.type === 'OUTPUT' || c.type === 'LED');
  
  // Generate truth table rows
  const rows = useMemo(() => {
    if (inputs.length === 0) return [];
    
    const numRows = Math.pow(2, inputs.length);
    const tableRows = [];
    
    for (let i = 0; i < numRows; i++) {
      const inputValues = inputs.map((_, j) => Boolean((i >> (inputs.length - 1 - j)) & 1));
      
      // Simulate circuit with these inputs
      const outputValues = simulateCircuit(components, wires, inputs, inputValues);
      
      tableRows.push({ inputValues, outputValues });
    }
    
    return tableRows;
  }, [components, wires, inputs, outputs]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Truth Table</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        
        {inputs.length === 0 ? (
          <p className="text-gray-500">Add input components to generate truth table</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  {inputs.map((inp, i) => (
                    <th key={i} className="px-3 py-2 text-left font-medium">{inp.label || `In${i+1}`}</th>
                  ))}
                  {outputs.map((out, i) => (
                    <th key={i} className="px-3 py-2 text-left font-medium border-l dark:border-gray-700">{out.label || `Out${i+1}`}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b dark:border-gray-700">
                    {row.inputValues.map((v, j) => (
                      <td key={j} className="px-3 py-2">{v ? '1' : '0'}</td>
                    ))}
                    {row.outputValues.map((v, j) => (
                      <td key={j} className="px-3 py-2 border-l dark:border-gray-700 font-bold" style={{ color: v ? '#22c55e' : '#ef4444' }}>
                        {v ? '1' : '0'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Circuit simulation helper
function simulateCircuit(components, wires, inputs, inputValues) {
  // Create a map of component states
  const states = new Map();
  
  // Set input values
  inputs.forEach((inp, i) => {
    states.set(inp.id, { outputValue: inputValues[i] });
  });
  
  // Propagate through circuit
  let changed = true;
  let iterations = 0;
  
  while (changed && iterations < 100) {
    changed = false;
    iterations++;
    
    // Propagate wire values
    wires.forEach(wire => {
      const fromState = states.get(wire.fromComponent);
      if (fromState) {
        const toState = states.get(wire.toComponent) || { inputValues: [] };
        const oldValue = toState.inputValues[wire.toPort];
        const newValue = fromState.outputValue;
        
        if (oldValue !== newValue) {
          toState.inputValues[wire.toPort] = newValue;
          states.set(wire.toComponent, toState);
          changed = true;
        }
      }
    });
    
    // Evaluate gates
    components.forEach(comp => {
      if (['INPUT', 'SWITCH', 'OUTPUT', 'LED'].includes(comp.type)) return;
      
      const state = states.get(comp.id) || { inputValues: [] };
      let output = false;
      
      switch (comp.type) {
        case 'AND':
          output = (state.inputValues[0] && state.inputValues[1]);
          break;
        case 'OR':
          output = (state.inputValues[0] || state.inputValues[1]);
          break;
        case 'NOT':
          output = !state.inputValues[0];
          break;
        case 'NAND':
          output = !(state.inputValues[0] && state.inputValues[1]);
          break;
        case 'NOR':
          output = !(state.inputValues[0] || state.inputValues[1]);
          break;
        case 'XOR':
          output = !!(state.inputValues[0] !== state.inputValues[1]);
          break;
        case 'XNOR':
          output = !!(state.inputValues[0] === state.inputValues[1]);
          break;
      }
      
      if (state.outputValue !== output) {
        state.outputValue = output;
        states.set(comp.id, state);
        changed = true;
      }
    });
  }
  
  // Get output values
  const outputs = components.filter(c => c.type === 'OUTPUT' || c.type === 'LED');
  return outputs.map(out => {
    const state = states.get(out.id);
    return state?.inputValues?.[0] || false;
  });
}

/**
 * Main Logic Simulator Page
 */
export default function LogicSimulatorPage() {
  // State
  const [components, setComponents] = useState([]);
  const [wires, setWires] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentCircuit, setCurrentCircuit] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(100);
  const [activeTool, setActiveTool] = useState('select');
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [viewport, setViewport] = useState({ zoom: 1, offset: { x: 0, y: 0 } });
  const [status, setStatus] = useState('Ready');
  const [showTruthTable, setShowTruthTable] = useState(false);
  const [clockTick, setClockTick] = useState(0);

  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const ffStateRef = useRef(new Map()); // Persists flip-flop Q state across steps
  const queryClient = useQueryClient();

  // Fetch circuits
  const { data: circuits, isLoading: loadingCircuits } = useQuery({
    queryKey: ['circuits'],
    queryFn: () => canvasService.list({ type: 'circuit' })
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => canvasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circuits'] });
      setStatus('Circuit saved');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => canvasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circuits'] });
      setStatus('Circuit updated');
    }
  });

  // Add component
  const handleAddComponent = useCallback((type) => {
    const config = COMPONENT_TYPES[type];
    const newComponent = {
      id: `comp_${Date.now()}`,
      type,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      inputs: config.inputs,
      outputs: config.outputs,
      inputValues: Array(config.inputs).fill(false),
      outputValue: false,
      label: '',
    };
    
    setComponents(prev => [...prev, newComponent]);
    setStatus(`Added ${config.name}`);
  }, []);

  // Handle component click
  const handleComponentClick = useCallback((componentId) => {
    if (activeTool === 'select') {
      setSelectedIds(prev => 
        prev.includes(componentId) ? prev.filter(id => id !== componentId) : [componentId]
      );
    }
  }, [activeTool]);

  // Handle port click for wiring
  const handlePortClick = useCallback((componentId, portType, portIndex) => {
    if (connectingFrom) {
      // Complete connection
      if (portType !== connectingFrom.portType) {
        const newWire = {
          id: `wire_${Date.now()}`,
          fromComponent: connectingFrom.portType === 'output' ? connectingFrom.componentId : componentId,
          fromPort: connectingFrom.portType === 'output' ? connectingFrom.portIndex : portIndex,
          toComponent: connectingFrom.portType === 'output' ? componentId : connectingFrom.componentId,
          toPort: connectingFrom.portType === 'output' ? portIndex : connectingFrom.portIndex,
          value: false
        };
        
        setWires(prev => [...prev, newWire]);
        setStatus('Wire connected');
      }
      setConnectingFrom(null);
    } else {
      // Start connection
      setConnectingFrom({ componentId, portType, portIndex });
      setStatus('Click another port to connect');
    }
  }, [connectingFrom]);

  // Toggle input
  const handleToggleInput = useCallback((componentId) => {
    setComponents(prev => prev.map(comp => {
      if (comp.id === componentId && (comp.type === 'INPUT' || comp.type === 'SWITCH')) {
        return { ...comp, outputValue: !comp.outputValue };
      }
      return comp;
    }));
  }, []);

  // Component drag (move after placement)
  const handleComponentDragStart = useCallback((id, e) => {
    if (activeTool !== 'select') return;
    const comp = components.find(c => c.id === id);
    if (!comp) return;
    e.stopPropagation();
    dragRef.current = { id, startX: e.clientX, startY: e.clientY, origX: comp.x, origY: comp.y };
  }, [components, activeTool]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current) return;
      const { id, startX, startY, origX, origY } = dragRef.current;
      const dx = (e.clientX - startX) / viewport.zoom;
      const dy = (e.clientY - startY) / viewport.zoom;
      setComponents(prev => prev.map(c => c.id === id ? { ...c, x: origX + dx, y: origY + dy } : c));
    };
    const onUp = () => { dragRef.current = null; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [viewport.zoom]);

  // Delete wire
  const handleDeleteWire = useCallback((wireId) => {
    setWires(prev => prev.filter(w => w.id !== wireId));
    setStatus('Wire removed');
  }, []);

  // Update component properties
  const handleUpdateComponent = useCallback((id, updates) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  // Simulate circuit step
  const simulateStep = useCallback(() => {
    setClockTick(prev => prev + 1);

    const newComponents = components.map(c => ({ ...c }));

    // Toggle CLOCK components on each step
    newComponents.forEach(comp => {
      if (comp.type === 'CLOCK') {
        comp.outputValue = !comp.outputValue;
      }
    });

    // Propagate through wires (use port index for multi-output components)
    const newWires = wires.map(w => ({ ...w }));
    newWires.forEach(wire => {
      const fromComp = newComponents.find(c => c.id === wire.fromComponent);
      if (fromComp) {
        wire.value = fromComp.outputValues?.[wire.fromPort ?? 0] ?? fromComp.outputValue ?? false;
      }
    });

    // Calculate component outputs
    newComponents.forEach(comp => {
      if (['INPUT', 'SWITCH', 'OUTPUT', 'LED', 'SEVEN_SEGMENT'].includes(comp.type)) return;

      const inputWires = newWires.filter(w => w.toComponent === comp.id);
      const inputs = Array(Math.max(comp.inputs || 2, 4)).fill(false);
      inputWires.forEach(w => { inputs[w.toPort ?? 0] = w.value ?? false; });

      let output = false;
      switch (comp.type) {
        case 'AND': output = inputs.slice(0, comp.inputs).every(v => v); break;
        case 'OR':  output = inputs.slice(0, comp.inputs).some(v => v); break;
        case 'NOT': output = !inputs[0]; break;
        case 'NAND': output = !inputs.slice(0, comp.inputs).every(v => v); break;
        case 'NOR':  output = !inputs.slice(0, comp.inputs).some(v => v); break;
        case 'XOR':  output = inputs.slice(0, comp.inputs).filter(v => v).length % 2 === 1; break;
        case 'XNOR': output = inputs.slice(0, comp.inputs).filter(v => v).length % 2 === 0; break;
        case 'CLOCK': return; // already toggled above

        case 'MUX': {
          // 4-to-1 MUX: inputs[0..3]=data, inputs[4..5]=select
          const sel = (inputs[5] ? 2 : 0) + (inputs[4] ? 1 : 0);
          output = inputs[sel] ?? false;
          break;
        }
        case 'DEMUX': {
          // 1-to-4 DEMUX: inputs[0]=data, inputs[1..2]=select
          const sel = (inputs[2] ? 2 : 0) + (inputs[1] ? 1 : 0);
          comp.outputValues = [false, false, false, false];
          comp.outputValues[sel] = inputs[0];
          comp.outputValue = comp.outputValues[0];
          return;
        }
        case 'ADDER': {
          // Full adder: A + B + Cin → Sum, Cout
          const sum = (inputs[0] ? 1 : 0) + (inputs[1] ? 1 : 0) + (inputs[2] ? 1 : 0);
          comp.outputValues = [sum % 2 === 1, sum >= 2];
          comp.outputValue = comp.outputValues[0];
          return;
        }

        // Flip-flops — edge triggered on CLK rising edge
        case 'D_FF': {
          const D = inputs[0]; const CLK = inputs[1];
          const ff = ffStateRef.current.get(comp.id) || { Q: false, prevCLK: false };
          if (CLK && !ff.prevCLK) ff.Q = D;
          ff.prevCLK = CLK;
          ffStateRef.current.set(comp.id, ff);
          comp.outputValues = [ff.Q, !ff.Q];
          comp.outputValue = ff.Q;
          return;
        }
        case 'T_FF': {
          const T = inputs[0]; const CLK = inputs[1];
          const ff = ffStateRef.current.get(comp.id) || { Q: false, prevCLK: false };
          if (CLK && !ff.prevCLK && T) ff.Q = !ff.Q;
          ff.prevCLK = CLK;
          ffStateRef.current.set(comp.id, ff);
          comp.outputValues = [ff.Q, !ff.Q];
          comp.outputValue = ff.Q;
          return;
        }
        case 'JK_FF': {
          const J = inputs[0]; const K = inputs[1]; const CLK = inputs[2];
          const ff = ffStateRef.current.get(comp.id) || { Q: false, prevCLK: false };
          if (CLK && !ff.prevCLK) {
            if (J && !K) ff.Q = true;
            else if (!J && K) ff.Q = false;
            else if (J && K) ff.Q = !ff.Q;
          }
          ff.prevCLK = CLK;
          ffStateRef.current.set(comp.id, ff);
          comp.outputValues = [ff.Q, !ff.Q];
          comp.outputValue = ff.Q;
          return;
        }
        case 'SR_FF': {
          const S = inputs[0]; const R = inputs[1]; const CLK = inputs[2];
          const ff = ffStateRef.current.get(comp.id) || { Q: false, prevCLK: false };
          if (CLK && !ff.prevCLK) {
            if (S && !R) ff.Q = true;
            else if (!S && R) ff.Q = false;
          }
          ff.prevCLK = CLK;
          ffStateRef.current.set(comp.id, ff);
          comp.outputValues = [ff.Q, !ff.Q];
          comp.outputValue = ff.Q;
          return;
        }
      }
      comp.outputValue = output;
    });

    // Update output/LED/7-segment components from wires
    newComponents.forEach(comp => {
      if (comp.type === 'OUTPUT' || comp.type === 'LED') {
        const inputWire = newWires.find(w => w.toComponent === comp.id);
        comp.inputValues = [inputWire?.value ?? false];
      }
      if (comp.type === 'SEVEN_SEGMENT') {
        comp.segmentValues = Array(7).fill(false).map((_, i) => {
          const wire = newWires.find(w => w.toComponent === comp.id && w.toPort === i);
          return wire?.value ?? false;
        });
      }
    });

    setComponents(newComponents);
    setWires(newWires);
  }, [components, wires]);

  // Run simulation
  useEffect(() => {
    if (isSimulating) {
      const interval = setInterval(simulateStep, simulationSpeed);
      return () => clearInterval(interval);
    }
  }, [isSimulating, simulateStep, simulationSpeed]);

  // Save circuit
  const handleSave = useCallback(async () => {
    const state = {
      version: '2.0',
      viewport,
      components,
      wires,
      metadata: {
        name: currentCircuit?.name || 'Untitled Circuit',
        type: 'circuit'
      }
    };

    try {
      if (currentCircuit?.id) {
        await updateMutation.mutateAsync({
          id: currentCircuit.id,
          data: { state }
        });
      } else {
        const result = await createMutation.mutateAsync({
          name: state.metadata.name,
          type: 'circuit',
          state
        });
        setCurrentCircuit(result);
      }
    } catch (error) {
      console.error('Save failed:', error);
      setStatus('Save failed');
    }
  }, [components, wires, viewport, currentCircuit, createMutation, updateMutation]);

  // Load circuit
  const handleLoad = useCallback(async (circuit) => {
    try {
      const canvas = await canvasService.get(circuit.id);
      const state = canvas.data?.state ?? canvas.data ?? {};
      setViewport(state.viewport || { zoom: 1, offset: { x: 0, y: 0 } });
      setComponents(state.components || []);
      setWires(state.wires || []);
      setCurrentCircuit(canvas);
      setStatus(`Loaded: ${canvas.name}`);
    } catch (error) {
      console.error('Load failed:', error);
      setStatus('Load failed');
    }
  }, []);

  // New circuit
  const handleNew = useCallback(() => {
    setComponents([]);
    setWires([]);
    setSelectedIds([]);
    setCurrentCircuit(null);
    setIsSimulating(false);
    setStatus('New circuit created');
  }, []);

  // Delete selected
  const handleDeleteSelected = useCallback(() => {
    setComponents(prev => prev.filter(c => !selectedIds.includes(c.id)));
    setWires(prev => prev.filter(w => 
      !selectedIds.includes(w.fromComponent) && !selectedIds.includes(w.toComponent)
    ));
    setSelectedIds([]);
    setStatus('Deleted selected');
  }, [selectedIds]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedIds.length > 0) {
            handleDeleteSelected();
          }
          break;
        case 'Escape':
          setSelectedIds([]);
          setConnectingFrom(null);
          break;
        case ' ':
          e.preventDefault();
          setIsSimulating(prev => !prev);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, handleDeleteSelected]);

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <CircuitBoard className="w-5 h-5 text-blue-500" />
            Logic Simulator
          </h1>
          <span className="text-sm text-gray-500">{currentCircuit?.name || 'Untitled'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Simulation controls */}
          {isSimulating ? (
            <Button size="sm" variant="secondary" onClick={() => setIsSimulating(false)}>
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </Button>
          ) : (
            <Button size="sm" variant="primary" onClick={() => setIsSimulating(true)}>
              <Play className="w-4 h-4 mr-1" />
              Simulate
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={simulateStep}>
            <StepForward className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => {
            setIsSimulating(false);
            setComponents(prev => prev.map(c => ({ ...c, outputValue: false, inputValues: c.inputValues?.map(() => false) })));
            setWires(prev => prev.map(w => ({ ...w, value: false })));
          }}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          
          {/* Speed control */}
          <select
            value={simulationSpeed}
            onChange={(e) => setSimulationSpeed(Number(e.target.value))}
            className="px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value={500}>Slow</option>
            <option value={100}>Normal</option>
            <option value={50}>Fast</option>
            <option value={10}>Very Fast</option>
          </select>
          
          <div className="border-l border-gray-200 dark:border-gray-700 pl-2 ml-2 flex gap-1">
            {/* Truth table */}
            <Button variant="ghost" size="sm" onClick={() => setShowTruthTable(true)}>
              <Table className="w-4 h-4 mr-1" />
              Truth Table
            </Button>
            
            <Button variant="ghost" size="sm" onClick={handleNew}>
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Component Palette */}
        <div className="p-4">
          <ComponentPalette onAddComponent={handleAddComponent} />
        </div>

        {/* Canvas area */}
        <div className="flex-1 relative">
          <svg
            ref={canvasRef}
            className="w-full h-full bg-white dark:bg-gray-900 cursor-crosshair"
            onClick={() => { setSelectedIds([]); setConnectingFrom(null); }}
          >
            {/* Grid */}
            <defs>
              <pattern
                id="grid"
                width={20 * viewport.zoom}
                height={20 * viewport.zoom}
                patternUnits="userSpaceOnUse"
                x={viewport.offset.x % (20 * viewport.zoom)}
                y={viewport.offset.y % (20 * viewport.zoom)}
              >
                <path
                  d={`M ${20 * viewport.zoom} 0 L 0 0 0 ${20 * viewport.zoom}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-gray-200 dark:text-gray-700"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Transform group */}
            <g transform={`translate(${viewport.offset.x}, ${viewport.offset.y}) scale(${viewport.zoom})`}>
              {/* Wires */}
              {wires.map(wire => (
                <RoutedWire
                  key={wire.id}
                  wire={wire}
                  components={components}
                  scale={1}
                  onDelete={handleDeleteWire}
                />
              ))}

              {/* Components */}
              {components.map(comp => (
                <ComponentRenderer
                  key={comp.id}
                  component={comp}
                  isSelected={selectedIds.includes(comp.id)}
                  onClick={handleComponentClick}
                  onPortClick={handlePortClick}
                  onToggleInput={handleToggleInput}
                  onDragStart={handleComponentDragStart}
                  scale={1}
                />
              ))}
            </g>
          </svg>
          
          {/* Connection hint */}
          {connectingFrom && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow text-sm">
              Click another port to connect (ESC to cancel)
            </div>
          )}
          
          {/* Status bar */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow text-sm text-gray-600 dark:text-gray-400">
            {status} | Components: {components.length} | Wires: {wires.length} | Clock: {clockTick}
          </div>
          
          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow p-1">
            <button
              onClick={() => setViewport(prev => ({ ...prev, zoom: Math.max(0.25, prev.zoom - 0.25) }))}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-sm">{Math.round(viewport.zoom * 100)}%</span>
            <button
              onClick={() => setViewport(prev => ({ ...prev, zoom: Math.min(3, prev.zoom + 0.25) }))}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport({ zoom: 1, offset: { x: 0, y: 0 } })}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-64 p-4 space-y-4">
          {/* Component Properties */}
          {selectedIds.length === 1 && (() => {
            const sel = components.find(c => c.id === selectedIds[0]);
            if (!sel) return null;
            return (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Properties: {sel.type}</h3>
                <label className="block text-xs text-gray-500 mb-1">Label</label>
                <input
                  type="text"
                  value={sel.label || ''}
                  onChange={e => handleUpdateComponent(sel.id, { label: e.target.value })}
                  placeholder="Label"
                  className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            );
          })()}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">Saved Circuits</h3>
            {loadingCircuits ? (
              <Loader size="sm" />
            ) : (
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {circuits?.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleLoad(c)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm rounded-md transition-colors",
                      currentCircuit?.id === c.id
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    {c.name}
                  </button>
                ))}
                {(!circuits || circuits.length === 0) && (
                  <p className="text-sm text-gray-400">No saved circuits</p>
                )}
              </div>
            )}
          </div>
          
          {/* Help */}
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Tips</h3>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Click components to add</li>
              <li>• Click ports to create wires</li>
              <li>• Click Input/Switch to toggle</li>
              <li>• Press Space to play/pause</li>
              <li>• Del to remove selected</li>
              <li>• Truth Table shows all combinations</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Truth Table Modal */}
      <TruthTable
        components={components}
        wires={wires}
        isOpen={showTruthTable}
        onClose={() => setShowTruthTable(false)}
      />
    </div>
  );
}
