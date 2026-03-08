import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { workflowService, DOMAIN_COLORS } from '../services/workflowService';
import { Card, Input, Button, Loader } from '../components/ui';
import { 
  Search, ZoomIn, ZoomOut, Maximize, Play, Save, 
  FolderOpen, Trash2, CircleAlert, Plus, X, ChevronRight,
  GripVertical, Circle, ArrowRight, ChevronDown, ChevronLeft,
  Menu, Zap, Bolt, Building2, Wrench, Calculator, BookOpen,
  Lightbulb, Settings, Layers, Edit3, Check, Group,
  FileText, Download, Copy
} from 'lucide-react';
import { cn } from '../lib/utils';

// Node width constant
const NODE_WIDTH = 260;
const PORT_RADIUS = 8;

// Main engineering categories with icons
const MAIN_CATEGORIES = [
  { 
    id: 'electrical', 
    name: 'Electrical', 
    icon: Bolt, 
    color: '#1976d2',
    subcategories: [
      { id: 'cable-sizing', name: 'Cable Sizing' },
      { id: 'voltage-drop', name: 'Voltage Drop' },
      { id: 'power-calculations', name: 'Power Calculations' },
      { id: 'power-distribution', name: 'Power Distribution' },
      { id: 'lighting', name: 'Lighting Systems' },
      { id: 'motor-controls', name: 'Motor Controls' },
      { id: 'power-quality', name: 'Power Quality' },
      { id: 'protection-grounding', name: 'Protection & Grounding' },
      { id: 'transformers', name: 'Transformers' },
      { id: 'circuits', name: 'Circuit Analysis' },
    ]
  },
  { 
    id: 'mechanical', 
    name: 'Mechanical', 
    icon: Wrench, 
    color: '#f57c00',
    subcategories: [
      { id: 'hvac', name: 'HVAC Systems' },
      { id: 'fluid-mechanics', name: 'Fluid Mechanics' },
      { id: 'thermodynamics', name: 'Thermodynamics' },
      { id: 'piping', name: 'Piping Systems' },
      { id: 'pumping', name: 'Pumping Systems' },
      { id: 'refrigeration', name: 'Refrigeration' },
      { id: 'stress-analysis', name: 'Stress Analysis' },
    ]
  },
  { 
    id: 'civil', 
    name: 'Civil', 
    icon: Building2, 
    color: '#388e3c',
    subcategories: [
      { id: 'structural-analysis', name: 'Structural Analysis' },
      { id: 'foundations', name: 'Foundation Design' },
      { id: 'concrete', name: 'Concrete Design' },
      { id: 'steel', name: 'Steel Design' },
      { id: 'soil-mechanics', name: 'Soil Mechanics' },
      { id: 'hydraulics', name: 'Hydraulics' },
    ]
  },
  { 
    id: 'mathematics', 
    name: 'Mathematics', 
    icon: Calculator, 
    color: '#7b1fa2',
    subcategories: [
      { id: 'algebra', name: 'Algebra' },
      { id: 'calculus', name: 'Calculus' },
      { id: 'statistics', name: 'Statistics' },
      { id: 'geometry', name: 'Geometry' },
    ]
  },
];

// Workflow examples
const WORKFLOW_EXAMPLES = [
  {
    id: 'cable_sizing_iec',
    name: 'Cable Sizing (IEC Standard)',
    description: 'Complete cable sizing according to IEC 60364 with derating factors and voltage drop',
    category: 'electrical',
    nodes: 8,
    difficulty: 'Advanced'
  },
  {
    id: 'voltage_drop_calc',
    name: 'Voltage Drop Calculation',
    description: 'Calculate voltage drop across cables with load current and power factor',
    category: 'electrical',
    nodes: 4,
    difficulty: 'Intermediate'
  },
  {
    id: 'power_flow_analysis',
    name: 'Power Flow Analysis',
    description: 'Complete power distribution calculation workflow',
    category: 'electrical',
    nodes: 5,
    difficulty: 'Intermediate'
  },
  {
    id: 'hvac_load',
    name: 'HVAC Load Calculation',
    description: 'Heating and cooling load estimation workflow',
    category: 'mechanical',
    nodes: 4,
    difficulty: 'Basic'
  },
  {
    id: 'beam_design',
    name: 'Beam Design Workflow',
    description: 'Structural beam analysis and design process',
    category: 'civil',
    nodes: 6,
    difficulty: 'Advanced'
  },
];

// Full workflow data with nodes and connections
const WORKFLOW_DATA = {
  cable_sizing_iec: {
    nodes: [
      { id: 'n1', name: 'Load Current Calculation', domain: 'electrical', x: 50, y: 50, inputs: [{ name: 'P', symbol: 'P', unit: 'kW' }, { name: 'V_L', symbol: 'V_L', unit: 'V' }, { name: 'PF', symbol: 'PF' }], outputs: [{ name: 'I_L', symbol: 'I_L', unit: 'A' }] },
      { id: 'n2', name: 'Temperature Correction', domain: 'electrical', x: 350, y: 50, inputs: [{ name: 'I_table', symbol: 'I_table', unit: 'A' }, { name: 'T_amb', symbol: 'T_amb', unit: '°C' }], outputs: [{ name: 'I_z_temp', symbol: 'I_z_temp', unit: 'A' }] },
      { id: 'n3', name: 'Derating Factors', domain: 'electrical', x: 650, y: 50, inputs: [{ name: 'I_z_temp', symbol: 'I_z_temp', unit: 'A' }, { name: 'K_install', symbol: 'K_install' }, { name: 'K_group', symbol: 'K_group' }], outputs: [{ name: 'I_z', symbol: 'I_z', unit: 'A' }] },
      { id: 'n4', name: 'Cable Selection', domain: 'electrical', x: 50, y: 220, inputs: [{ name: 'I_b', symbol: 'I_b', unit: 'A' }, { name: 'Material', symbol: 'material' }], outputs: [{ name: 'S', symbol: 'S', unit: 'mm²' }, { name: 'I_z_final', symbol: 'I_z_final', unit: 'A' }] },
      { id: 'n5', name: 'Voltage Drop', domain: 'electrical', x: 350, y: 220, inputs: [{ name: 'I', symbol: 'I', unit: 'A' }, { name: 'L', symbol: 'L', unit: 'm' }, { name: 'R', symbol: 'R', unit: 'Ω/km' }, { name: 'X', symbol: 'X', unit: 'Ω/km' }], outputs: [{ name: 'ΔU%', symbol: 'ΔU%', unit: '%' }] },
      { id: 'n6', name: 'Protection Coordination', domain: 'electrical', x: 650, y: 220, inputs: [{ name: 'I_b', symbol: 'I_b', unit: 'A' }, { name: 'I_n', symbol: 'I_n', unit: 'A' }, { name: 'I_z', symbol: 'I_z', unit: 'A' }], outputs: [{ name: 'OK', symbol: 'prot_ok' }] },
      { id: 'n7', name: 'Short Circuit Check', domain: 'electrical', x: 350, y: 390, inputs: [{ name: 'I_k', symbol: 'I_k', unit: 'kA' }, { name: 't', symbol: 't', unit: 's' }, { name: 'k', symbol: 'k' }], outputs: [{ name: 'S_min', symbol: 'S_min', unit: 'mm²' }] },
      { id: 'n8', name: 'Final Specification', domain: 'electrical', x: 650, y: 390, inputs: [{ name: 'Results', symbol: 'results' }], outputs: [{ name: 'Spec', symbol: 'cable_spec' }] },
    ],
    connections: [
      { from: 'n1', fromPort: 0, to: 'n4', toPort: 0 },
      { from: 'n2', fromPort: 0, to: 'n3', toPort: 0 },
      { from: 'n4', fromPort: 0, to: 'n7', toPort: 0 },
      { from: 'n3', fromPort: 0, to: 'n6', toPort: 2 },
    ]
  },
  voltage_drop_calc: {
    nodes: [
      { id: 'n1', name: 'Load Data', domain: 'electrical', x: 50, y: 100, inputs: [{ name: 'P', symbol: 'P', unit: 'kW' }, { name: 'V', symbol: 'V', unit: 'V' }, { name: 'PF', symbol: 'PF' }], outputs: [{ name: 'I', symbol: 'I', unit: 'A' }] },
      { id: 'n2', name: 'Cable Data', domain: 'electrical', x: 350, y: 100, inputs: [{ name: 'L', symbol: 'L', unit: 'm' }, { name: 'S', symbol: 'S', unit: 'mm²' }], outputs: [{ name: 'R', symbol: 'R', unit: 'Ω' }] },
      { id: 'n3', name: 'Voltage Drop Calc', domain: 'electrical', x: 650, y: 100, inputs: [{ name: 'I', symbol: 'I', unit: 'A' }, { name: 'R', symbol: 'R', unit: 'Ω' }], outputs: [{ name: 'Vd', symbol: 'Vd', unit: 'V' }] },
      { id: 'n4', name: 'Percentage Calc', domain: 'electrical', x: 350, y: 270, inputs: [{ name: 'Vd', symbol: 'Vd', unit: 'V' }, { name: 'V', symbol: 'V', unit: 'V' }], outputs: [{ name: 'Vd%', symbol: 'Vd%', unit: '%' }] },
    ],
    connections: [
      { from: 'n1', fromPort: 0, to: 'n3', toPort: 0 },
      { from: 'n2', fromPort: 0, to: 'n3', toPort: 1 },
      { from: 'n3', fromPort: 0, to: 'n4', toPort: 0 },
      { from: 'n1', fromPort: 0, to: 'n4', toPort: 1 },
    ]
  },
  power_flow_analysis: {
    nodes: [
      { id: 'n1', name: 'Load Data Input', domain: 'electrical', x: 50, y: 100, inputs: [{ name: 'P', symbol: 'P', unit: 'kW' }, { name: 'Q', symbol: 'Q', unit: 'kVAR' }], outputs: [{ name: 'S', symbol: 'S', unit: 'kVA' }] },
      { id: 'n2', name: 'Network Topology', domain: 'electrical', x: 350, y: 100, inputs: [{ name: 'Buses', symbol: 'buses' }], outputs: [{ name: 'Y_bus', symbol: 'Y_bus' }] },
      { id: 'n3', name: 'Power Flow Solver', domain: 'electrical', x: 650, y: 100, inputs: [{ name: 'S', symbol: 'S', unit: 'kVA' }, { name: 'Y_bus', symbol: 'Y_bus' }], outputs: [{ name: 'V', symbol: 'V', unit: 'V' }, { name: 'δ', symbol: 'δ', unit: '°' }] },
      { id: 'n4', name: 'Line Flows', domain: 'electrical', x: 350, y: 270, inputs: [{ name: 'V', symbol: 'V', unit: 'V' }, { name: 'Y_bus', symbol: 'Y_bus' }], outputs: [{ name: 'I_line', symbol: 'I_line', unit: 'A' }] },
      { id: 'n5', name: 'Losses Calculation', domain: 'electrical', x: 650, y: 270, inputs: [{ name: 'I_line', symbol: 'I_line', unit: 'A' }], outputs: [{ name: 'P_loss', symbol: 'P_loss', unit: 'kW' }] },
    ],
    connections: [
      { from: 'n1', fromPort: 0, to: 'n3', toPort: 0 },
      { from: 'n2', fromPort: 0, to: 'n3', toPort: 1 },
      { from: 'n3', fromPort: 0, to: 'n4', toPort: 0 },
      { from: 'n4', fromPort: 0, to: 'n5', toPort: 0 },
    ]
  },
  hvac_load: {
    nodes: [
      { id: 'n1', name: 'Building Data', domain: 'mechanical', x: 50, y: 100, inputs: [{ name: 'Area', symbol: 'A', unit: 'm²' }, { name: 'Height', symbol: 'H', unit: 'm' }], outputs: [{ name: 'Volume', symbol: 'V', unit: 'm³' }] },
      { id: 'n2', name: 'Envelope Loads', domain: 'mechanical', x: 350, y: 100, inputs: [{ name: 'U', symbol: 'U', unit: 'W/m²K' }, { name: 'A', symbol: 'A', unit: 'm²' }], outputs: [{ name: 'Q_env', symbol: 'Q_env', unit: 'W' }] },
      { id: 'n3', name: 'Internal Loads', domain: 'mechanical', x: 650, y: 100, inputs: [{ name: 'People', symbol: 'n' }, { name: 'Lights', symbol: 'W', unit: 'W' }], outputs: [{ name: 'Q_int', symbol: 'Q_int', unit: 'W' }] },
      { id: 'n4', name: 'Total Load', domain: 'mechanical', x: 350, y: 270, inputs: [{ name: 'Q_env', symbol: 'Q_env', unit: 'W' }, { name: 'Q_int', symbol: 'Q_int', unit: 'W' }], outputs: [{ name: 'Q_total', symbol: 'Q_total', unit: 'W' }] },
    ],
    connections: [
      { from: 'n1', fromPort: 0, to: 'n2', toPort: 1 },
      { from: 'n2', fromPort: 0, to: 'n4', toPort: 0 },
      { from: 'n3', fromPort: 0, to: 'n4', toPort: 1 },
    ]
  },
  beam_design: {
    nodes: [
      { id: 'n1', name: 'Load Definition', domain: 'civil', x: 50, y: 80, inputs: [{ name: 'w', symbol: 'w', unit: 'kN/m' }, { name: 'P', symbol: 'P', unit: 'kN' }], outputs: [{ name: 'Loads', symbol: 'loads' }] },
      { id: 'n2', name: 'Support Conditions', domain: 'civil', x: 310, y: 80, inputs: [{ name: 'Type', symbol: 'type' }], outputs: [{ name: 'Reactions', symbol: 'R', unit: 'kN' }] },
      { id: 'n3', name: 'Moment Diagram', domain: 'civil', x: 570, y: 80, inputs: [{ name: 'Loads', symbol: 'loads' }, { name: 'L', symbol: 'L', unit: 'm' }], outputs: [{ name: 'M_max', symbol: 'M_max', unit: 'kNm' }] },
      { id: 'n4', name: 'Shear Diagram', domain: 'civil', x: 50, y: 240, inputs: [{ name: 'Loads', symbol: 'loads' }], outputs: [{ name: 'V_max', symbol: 'V_max', unit: 'kN' }] },
      { id: 'n5', name: 'Section Selection', domain: 'civil', x: 310, y: 240, inputs: [{ name: 'M_max', symbol: 'M_max', unit: 'kNm' }, { name: 'V_max', symbol: 'V_max', unit: 'kN' }], outputs: [{ name: 'Section', symbol: 'section' }] },
      { id: 'n6', name: 'Deflection Check', domain: 'civil', x: 570, y: 240, inputs: [{ name: 'Section', symbol: 'section' }, { name: 'L', symbol: 'L', unit: 'm' }], outputs: [{ name: 'δ', symbol: 'delta', unit: 'mm' }] },
    ],
    connections: [
      { from: 'n1', fromPort: 0, to: 'n3', toPort: 0 },
      { from: 'n1', fromPort: 0, to: 'n4', toPort: 0 },
      { from: 'n3', fromPort: 0, to: 'n5', toPort: 0 },
      { from: 'n4', fromPort: 0, to: 'n5', toPort: 1 },
      { from: 'n5', fromPort: 0, to: 'n6', toPort: 0 },
    ]
  },
};

/**
 * Workflow Node Component with variable inputs and renaming
 */
function WorkflowNode({ 
  node, 
  isSelected, 
  onSelect, 
  onDragStart,
  onPortClick,
  onRename,
  onValueChange,
  onGroup,
  connectingPort,
  isInGroup,
  groupName
}) {
  const color = DOMAIN_COLORS[node.domain] || DOMAIN_COLORS.general;
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [showInputs, setShowInputs] = useState(true);
  
  const handleRename = () => {
    if (editName.trim() && editName !== node.name) {
      onRename(node.id, editName.trim());
    }
    setIsEditing(false);
  };
  
  return (
    <div
      className={cn(
        "absolute bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 cursor-move select-none",
        "transition-shadow duration-200",
        isSelected ? "border-blue-500 shadow-xl ring-2 ring-blue-500/30" : "border-gray-200 dark:border-gray-700",
        isInGroup && "ring-2 ring-purple-400/50"
      )}
      style={{
        left: node.x,
        top: node.y,
        width: NODE_WIDTH,
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect(node.id);
        onDragStart(e, node);
      }}
    >
      {/* Group indicator */}
      {isInGroup && (
        <div className="absolute -top-6 left-0 text-xs bg-purple-500 text-white px-2 py-0.5 rounded-t">
          {groupName}
        </div>
      )}
      
      {/* Header */}
      <div 
        className="px-3 py-2 rounded-t-lg flex items-center gap-2"
        style={{ backgroundColor: `${color}15` }}
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              className="w-full text-sm font-semibold bg-transparent border-b border-blue-500 outline-none"
              style={{ color }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h4 
              className="text-sm font-semibold truncate cursor-pointer hover:underline"
              style={{ color }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              title="Double-click to rename"
            >
              {node.name}
            </h4>
          )}
          <p className="text-xs text-gray-500 truncate capitalize">{node.domain}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          title="Rename"
        >
          <Edit3 className="w-3 h-3 text-gray-400" />
        </button>
      </div>
      
      {/* Variable Inputs Section */}
      {showInputs && (
        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-xs font-medium text-gray-500 mb-1">Variables:</div>
          <div className="space-y-1">
            {node.inputs?.map((input, index) => (
              <div key={`var-${index}`} className="flex items-center gap-1">
                <span className="text-xs text-gray-600 dark:text-gray-400 w-16 truncate" title={input.name}>
                  {input.symbol || input.name}:
                </span>
                <input
                  type="number"
                  placeholder={input.unit || ''}
                  value={input.value ?? ''}
                  onChange={(e) => onValueChange(node.id, 'input', index, e.target.value)}
                  className="flex-1 text-xs px-1.5 py-0.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 outline-none focus:border-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
                {input.unit && (
                  <span className="text-[10px] text-gray-400 w-10">{input.unit}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Ports */}
      <div className="p-3 space-y-2">
        {/* Input Ports */}
        <div className="text-xs font-medium text-gray-400 mb-1">Inputs</div>
        {node.inputs?.map((input, index) => (
          <div key={`input-${index}`} className="flex items-center gap-2">
            <div
              className={cn(
                "w-4 h-4 rounded-full border-2 cursor-pointer transition-all",
                "hover:scale-125",
                input.connected ? "bg-blue-500 border-blue-500" : "bg-white dark:bg-gray-700 border-gray-400",
                connectingPort?.portType === 'output' && "hover:border-green-500"
              )}
              style={{ borderColor: input.connected ? color : undefined }}
              onMouseDown={(e) => {
                e.stopPropagation();
                onPortClick(node.id, 'input', index, input);
              }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 truncate">
              {input.symbol || input.name}
            </span>
            {input.unit && (
              <span className="text-[10px] text-gray-400">({input.unit})</span>
            )}
          </div>
        ))}
        
        {/* Output Ports */}
        <div className="text-xs font-medium text-gray-400 mt-3 mb-1">Outputs</div>
        {node.outputs?.map((output, index) => (
          <div key={`output-${index}`} className="flex items-center gap-2 justify-end">
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {output.symbol || output.name}
            </span>
            {output.unit && (
              <span className="text-[10px] text-gray-400">({output.unit})</span>
            )}
            {output.value !== undefined && (
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                = {typeof output.value === 'number' ? output.value.toFixed(4) : output.value}
              </span>
            )}
            <div
              className={cn(
                "w-4 h-4 rounded-full border-2 cursor-pointer transition-all",
                "hover:scale-125",
                output.connected ? "bg-green-500 border-green-500" : "bg-white dark:bg-gray-700 border-gray-400",
                connectingPort?.portType === 'input' && "hover:border-blue-500"
              )}
              style={{ borderColor: output.connected ? '#22c55e' : undefined }}
              onMouseDown={(e) => {
                e.stopPropagation();
                onPortClick(node.id, 'output', index, output);
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Group button */}
      <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onGroup(node.id);
          }}
          className="text-xs text-purple-500 hover:text-purple-600 flex items-center gap-1"
        >
          <Group className="w-3 h-3" />
          {isInGroup ? 'Remove from Group' : 'Add to Group'}
        </button>
      </div>
    </div>
  );
}

/**
 * Palette Item Component
 */
function PaletteItem({ equation, onDragStart, color }) {
  return (
    <div
      className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-grab hover:shadow-md transition-shadow"
      draggable
      onDragStart={(e) => onDragStart(e, equation)}
    >
      <div className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
          {equation.name}
        </span>
      </div>
      {equation.equation && (
        <p className="text-[10px] text-gray-400 mt-1 truncate font-mono">
          {equation.equation}
        </p>
      )}
    </div>
  );
}

/**
 * Category Item Component
 */
function CategoryItem({ category, isSelected, isExpanded, onClick, onToggle }) {
  const Icon = category.icon;
  return (
    <div>
      <button
        onClick={() => {
          onClick(category.id);
          onToggle(category.id);
        }}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left",
          isSelected 
            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        )}
      >
        <Icon className="w-5 h-5 flex-shrink-0" style={{ color: category.color }} />
        <span className="flex-1 text-sm font-medium">{category.name}</span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
    </div>
  );
}

/**
 * Subcategory Item Component
 */
function SubcategoryItem({ subcategory, isSelected, onClick, count }) {
  return (
    <button
      onClick={() => onClick(subcategory.id)}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-left",
        isSelected 
          ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300" 
          : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
      )}
    >
      <span className="flex-1 text-xs">{subcategory.name}</span>
      {count > 0 && (
        <span className="text-[10px] bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
}

/**
 * Example Card Component
 */
function ExampleCard({ example, onLoad }) {
  const category = MAIN_CATEGORIES.find(c => c.id === example.category);
  const categoryColor = category?.color || '#616161';
  
  return (
    <div 
      className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onLoad(example)}
    >
      <div className="flex items-start gap-2">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${categoryColor}20` }}
        >
          <Layers className="w-4 h-4" style={{ color: categoryColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {example.name}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
            {example.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
              {example.nodes} nodes
            </span>
            <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
              {example.difficulty}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Connection Line Component (SVG)
 */
function ConnectionLine({ connection, nodes, animated = false }) {
  const fromNode = nodes.find(n => n.id === connection.from.nodeId);
  const toNode = nodes.find(n => n.id === connection.to.nodeId);
  
  if (!fromNode || !toNode) return null;
  
  // Calculate port positions
  const fromX = fromNode.x + NODE_WIDTH;
  const fromY = fromNode.y + 120 + (connection.from.portIndex * 28);
  const toX = toNode.x;
  const toY = toNode.y + 120 + (connection.to.portIndex * 28);
  
  // Create bezier curve
  const midX = (fromX + toX) / 2;
  const path = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
  
  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={2}
        strokeLinecap="round"
        className="pointer-events-none"
      />
      {animated && (
        <circle r="4" fill="#3b82f6">
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            path={path}
          />
        </circle>
      )}
    </g>
  );
}

/**
 * Group Box Component
 */
function GroupBox({ group, nodes }) {
  if (!nodes || nodes.length === 0) return null;
  
  // Calculate bounding box
  const padding = 20;
  const minX = Math.min(...nodes.map(n => n.x)) - padding;
  const minY = Math.min(...nodes.map(n => n.y)) - padding - (group.name ? 30 : padding);
  const maxX = Math.max(...nodes.map(n => n.x + NODE_WIDTH)) + padding;
  const maxY = Math.max(...nodes.map(n => n.y + 300)) + padding;
  
  const width = maxX - minX;
  const height = maxY - minY;
  
  return (
    <g>
      <rect
        x={minX}
        y={minY}
        width={width}
        height={height}
        rx={12}
        fill="rgba(147, 51, 234, 0.05)"
        stroke="rgba(147, 51, 234, 0.3)"
        strokeWidth={2}
        strokeDasharray="8 4"
      />
      {group.name && (
        <text
          x={minX + 10}
          y={minY + 20}
          className="text-sm font-medium"
          fill="rgb(147, 51, 234)"
        >
          {group.name}
        </text>
      )}
    </g>
  );
}

/**
 * Visual Workflow Builder Page
 */
export default function VisualWorkflowPage() {
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'examples'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState([]);
  
  // Canvas state
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [connectingPort, setConnectingPort] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [status, setStatus] = useState('Ready - Drag equations from the palette to build your workflow');
  
  // Groups state
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState(null);
  
  const canvasRef = useRef(null);
  const nodeIdCounter = useRef(0);
  
  // Fetch equations for palette
  const { data: equationsData, isLoading: loadingEquations } = useQuery({
    queryKey: ['workflow-equations'],
    queryFn: () => workflowService.getEquations(),
  });
  
  const equations = equationsData || [];
  
  // Execute workflow mutation
  const executeMutation = useMutation({
    mutationFn: async (workflowData) => {
      // Simulate execution by calculating each node
      const results = {};
      for (const node of workflowData.nodes) {
        // Simple calculation based on inputs
        const inputValues = node.inputs?.reduce((acc, inp) => {
          acc[inp.symbol || inp.name] = inp.value || 0;
          return acc;
        }, {}) || {};
        
        // For demo, just sum the inputs
        const outputValue = Object.values(inputValues).reduce((sum, val) => sum + Number(val), 0);
        results[node.id] = {
          outputs: node.outputs?.map(out => ({
            ...out,
            value: outputValue / (node.inputs?.length || 1)
          }))
        };
      }
      return results;
    },
    onSuccess: (results) => {
      setExecutionResults(results);
      // Update nodes with results
      setNodes(prev => prev.map(node => {
        const nodeResult = results[node.id];
        if (nodeResult) {
          return {
            ...node,
            outputs: nodeResult.outputs
          };
        }
        return node;
      }));
      setStatus('Workflow executed successfully!');
    },
    onError: (error) => {
      setStatus(`Execution error: ${error.message}`);
    }
  });
  
  // ListFilter equations by category and search
  const filteredEquations = useMemo(() => {
    let filtered = equations;
    
    // ListFilter by category/domain
    if (selectedCategory) {
      filtered = filtered.filter(eq => eq.domain === selectedCategory);
    }
    
    // ListFilter by subcategory
    if (selectedSubcategory) {
      filtered = filtered.filter(eq => 
        eq.subcategory === selectedSubcategory || 
        eq.category_id === selectedSubcategory ||
        eq.category_name?.toLowerCase().includes(selectedSubcategory.toLowerCase())
      );
    }
    
    // ListFilter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(eq => 
        eq.name?.toLowerCase().includes(query) ||
        eq.domain?.toLowerCase().includes(query) ||
        eq.description?.toLowerCase().includes(query) ||
        eq.equation?.toLowerCase().includes(query)
      );
    }
    
    return filtered.slice(0, 100);
  }, [equations, selectedCategory, selectedSubcategory, searchQuery]);
  
  // Get current category color
  const currentCategoryColor = useMemo(() => {
    const cat = MAIN_CATEGORIES.find(c => c.id === selectedCategory);
    return cat?.color || '#616161';
  }, [selectedCategory]);
  
  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else {
      setSelectedCategory(categoryId);
      setSelectedSubcategory(null);
    }
  };
  
  // Handle subcategory selection
  const handleSubcategorySelect = (subcategoryId) => {
    if (selectedSubcategory === subcategoryId) {
      setSelectedSubcategory(null);
    } else {
      setSelectedSubcategory(subcategoryId);
    }
  };
  
  // Canvas drop handler
  const handleCanvasDrop = useCallback((e) => {
    e.preventDefault();
    const equationData = e.dataTransfer.getData('equation');
    if (!equationData) return;
    
    const equation = JSON.parse(equationData);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (e.clientX - rect.left - viewport.x) / viewport.zoom;
    const y = (e.clientY - rect.top - viewport.y) / viewport.zoom;
    
    const newNode = {
      id: `node-${++nodeIdCounter.current}`,
      equationId: equation.id,
      name: equation.name,
      domain: equation.domain || selectedCategory || 'general',
      x,
      y,
      inputs: equation.inputs?.map(inp => ({ ...inp, connected: false, value: undefined })) || [],
      outputs: equation.outputs?.map(out => ({ ...out, connected: false, value: undefined })) || [],
    };
    
    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode.id);
    setStatus(`Added: ${equation.name}`);
    
    // Close mobile sidebar after adding
    setMobileSidebarOpen(false);
  }, [viewport, selectedCategory]);
  
  // Palette drag start
  const handlePaletteDragStart = (e, equation) => {
    e.dataTransfer.setData('equation', JSON.stringify(equation));
  };
  
  // Node drag handlers
  const handleNodeDragStart = (e, node) => {
    setIsDragging(true);
    setDragNode(node);
    setDragOffset({
      x: e.clientX - node.x * viewport.zoom - viewport.x,
      y: e.clientY - node.y * viewport.zoom - viewport.y,
    });
  };
  
  const handleCanvasMouseMove = useCallback((e) => {
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setViewport(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
    } else if (isDragging && dragNode) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const newX = (e.clientX - rect.left - dragOffset.x) / viewport.zoom;
      const newY = (e.clientY - rect.top - dragOffset.y) / viewport.zoom;
      
      setNodes(prev => prev.map(n => 
        n.id === dragNode.id 
          ? { ...n, x: newX, y: newY }
          : n
      ));
    }
  }, [isPanning, panStart, isDragging, dragNode, dragOffset, viewport.zoom]);
  
  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragNode(null);
    setIsPanning(false);
  }, []);
  
  // Canvas pan handlers
  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target.tagName === 'svg') {
      setSelectedNode(null);
      if (e.button === 0) {
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    }
  };
  
  // Port connection handler
  const handlePortClick = (nodeId, portType, portIndex, port) => {
    if (!connectingPort) {
      // Start connection
      setConnectingPort({ nodeId, portType, portIndex, port });
      setStatus('Click another port to complete the connection');
    } else {
      // Complete connection
      if (connectingPort.nodeId === nodeId) {
        setStatus('Cannot connect to the same node');
        setConnectingPort(null);
        return;
      }
      
      if (connectingPort.portType === portType) {
        setStatus('Cannot connect same port types');
        setConnectingPort(null);
        return;
      }
      
      const newConnection = connectingPort.portType === 'output'
        ? { from: { nodeId: connectingPort.nodeId, portIndex: connectingPort.portIndex },
            to: { nodeId, portIndex } }
        : { from: { nodeId, portIndex },
            to: { nodeId: connectingPort.nodeId, portIndex: connectingPort.portIndex } };
      
      setConnections(prev => [...prev, newConnection]);
      
      // Mark ports as connected
      setNodes(prev => prev.map(n => {
        if (n.id === newConnection.from.nodeId) {
          const outputs = n.outputs?.map((o, i) => 
            i === newConnection.from.portIndex ? { ...o, connected: true } : o
          );
          return { ...n, outputs };
        }
        if (n.id === newConnection.to.nodeId) {
          const inputs = n.inputs?.map((inp, i) => 
            i === newConnection.to.portIndex ? { ...inp, connected: true } : inp
          );
          return { ...n, inputs };
        }
        return n;
      }));
      
      setStatus('Connection created');
      setConnectingPort(null);
    }
  };
  
  // Handle node rename
  const handleNodeRename = (nodeId, newName) => {
    setNodes(prev => prev.map(n => 
      n.id === nodeId ? { ...n, name: newName } : n
    ));
    setStatus(`Renamed node to "${newName}"`);
  };
  
  // Handle value change
  const handleValueChange = (nodeId, portType, portIndex, value) => {
    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        const inputs = n.inputs?.map((inp, i) => 
          i === portIndex ? { ...inp, value: value === '' ? undefined : Number(value) } : inp
        );
        return { ...n, inputs };
      }
      return n;
    }));
  };
  
  // Handle grouping
  const handleGroup = (nodeId) => {
    if (selectedGroup) {
      // Add to existing group
      setGroups(prev => prev.map(g => {
        if (g.id === selectedGroup) {
          const nodeIds = g.nodeIds.includes(nodeId) 
            ? g.nodeIds.filter(id => id !== nodeId)
            : [...g.nodeIds, nodeId];
          return { ...g, nodeIds };
        }
        return g;
      }));
    } else {
      // Create new group
      const newGroup = {
        id: `group-${Date.now()}`,
        name: `Step ${groups.length + 1}`,
        nodeIds: [nodeId]
      };
      setGroups(prev => [...prev, newGroup]);
      setSelectedGroup(newGroup.id);
    }
  };
  
  // Zoom handlers
  const handleZoomIn = () => {
    setViewport(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 2) }));
  };
  
  const handleZoomOut = () => {
    setViewport(prev => ({ ...prev, zoom: Math.max(prev.zoom / 1.2, 0.4) }));
  };
  
  const handleZoomReset = () => {
    setViewport({ x: 0, y: 0, zoom: 1 });
  };
  
  // Delete selected node
  const handleDeleteSelected = () => {
    if (!selectedNode) return;
    setNodes(prev => prev.filter(n => n.id !== selectedNode));
    setConnections(prev => prev.filter(c => 
      c.from.nodeId !== selectedNode && c.to.nodeId !== selectedNode
    ));
    setSelectedNode(null);
    setStatus('Node deleted');
  };
  
  // Clear all
  const handleClearAll = () => {
    setNodes([]);
    setConnections([]);
    setGroups([]);
    setSelectedNode(null);
    setExecutionResults(null);
    setStatus('Canvas cleared');
  };
  
  // Execute workflow
  const handleExecute = () => {
    if (nodes.length === 0) {
      setStatus('No nodes to execute');
      return;
    }
    
    setIsExecuting(true);
    setStatus('Executing workflow...');
    
    executeMutation.mutate({ nodes, connections }, {
      onSettled: () => {
        setIsExecuting(false);
      }
    });
  };
  
  // Save workflow
  const handleSave = async () => {
    const workflow = {
      name: workflowName,
      nodes: nodes.map(n => ({
        id: n.id,
        equationId: n.equationId,
        name: n.name,
        domain: n.domain,
        x: n.x,
        y: n.y,
        inputs: n.inputs,
        outputs: n.outputs
      })),
      connections,
      groups
    };
    
    try {
      await workflowService.save(workflow);
      setStatus('Workflow saved successfully!');
    } catch (error) {
      setStatus(`Save error: ${error.message}`);
    }
  };
  
  // Export workflow as JSON
  const handleExport = () => {
    const workflow = {
      name: workflowName,
      nodes,
      connections,
      groups,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('Workflow exported!');
  };
  
  // Load example workflow
  const handleLoadExample = (example) => {
    setStatus(`Loading example: ${example.name}...`);
    
    const workflowData = WORKFLOW_DATA[example.id];
    
    if (!workflowData) {
      setStatus(`Example "${example.name}" not found`);
      return;
    }
    
    setNodes([]);
    setConnections([]);
    setGroups([]);
    setSelectedNode(null);
    setConnectingPort(null);
    setExecutionResults(null);
    
    setWorkflowName(example.name);
    
    const newNodes = workflowData.nodes.map((node, index) => ({
      ...node,
      id: node.id || `node_${Date.now()}_${index}`,
      inputs: node.inputs?.map((inp, i) => ({ ...inp, id: `input_${i}`, connected: false, value: undefined })) || [],
      outputs: node.outputs?.map((out, i) => ({ ...out, id: `output_${i}`, connected: false, value: undefined })) || [],
    }));
    
    const newConnections = workflowData.connections.map((conn, index) => ({
      id: `conn_${Date.now()}_${index}`,
      from: {
        nodeId: conn.from,
        portIndex: conn.fromPort,
      },
      to: {
        nodeId: conn.to,
        portIndex: conn.toPort,
      },
    }));
    
    // Mark connected ports
    newConnections.forEach(conn => {
      const fromNode = newNodes.find(n => n.id === conn.from.nodeId);
      const toNode = newNodes.find(n => n.id === conn.to.nodeId);
      if (fromNode && fromNode.outputs[conn.from.portIndex]) {
        fromNode.outputs[conn.from.portIndex].connected = true;
      }
      if (toNode && toNode.inputs[conn.to.portIndex]) {
        toNode.inputs[conn.to.portIndex].connected = true;
      }
    });
    
    setNodes(newNodes);
    setConnections(newConnections);
    setViewport({ x: 50, y: 50, zoom: 1 });
    
    setStatus(`Loaded "${example.name}" - ${newNodes.length} nodes, ${newConnections.length} connections`);
    setMobileSidebarOpen(false);
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNode && document.activeElement.tagName !== 'INPUT') {
          handleDeleteSelected();
        }
      }
      if (e.key === 'Escape') {
        setConnectingPort(null);
        setStatus('Connection cancelled');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode]);
  
  // Count equations per subcategory
  const getSubcategoryCount = (domain, subcategoryId) => {
    return equations.filter(eq => 
      eq.domain === domain && 
      (eq.subcategory === subcategoryId || eq.category_id === subcategoryId)
    ).length;
  };
  
  // Get node's group info
  const getNodeGroup = (nodeId) => {
    return groups.find(g => g.nodeIds.includes(nodeId));
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex overflow-hidden relative">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      
      {/* Left Sidebar */}
      <div 
        className={cn(
          "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-50",
          "transition-all duration-300 ease-in-out",
          "hidden lg:flex",
          sidebarOpen ? "w-72" : "w-0 overflow-hidden",
          "lg:relative fixed inset-y-0 left-0",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Workflow Builder
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('categories')}
            className={cn(
              "flex-1 py-2 text-sm font-medium transition-colors",
              activeTab === 'categories'
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <BookOpen className="w-4 h-4 inline mr-1" />
            Categories
          </button>
          <button
            onClick={() => setActiveTab('examples')}
            className={cn(
              "flex-1 py-2 text-sm font-medium transition-colors",
              activeTab === 'examples'
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <Lightbulb className="w-4 h-4 inline mr-1" />
            Examples
          </button>
        </div>
        
        {/* Search */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search equations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-sm w-full"
            />
          </div>
        </div>
        
        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'categories' ? (
            <div className="p-3 space-y-2">
              {/* Main Categories */}
              {MAIN_CATEGORIES.map((category) => (
                <div key={category.id}>
                  <CategoryItem
                    category={category}
                    isSelected={selectedCategory === category.id}
                    isExpanded={expandedCategories.includes(category.id)}
                    onClick={handleCategorySelect}
                    onToggle={toggleCategoryExpansion}
                  />
                  
                  {/* Subcategories */}
                  {expandedCategories.includes(category.id) && (
                    <div className="ml-4 mt-1 space-y-1">
                      {category.subcategories.map((sub) => (
                        <SubcategoryItem
                          key={sub.id}
                          subcategory={sub}
                          isSelected={selectedSubcategory === sub.id}
                          onClick={handleSubcategorySelect}
                          count={getSubcategoryCount(category.id, sub.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-3" />
              
              {/* Equations List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Equations
                  </h4>
                  <span className="text-xs text-gray-400">
                    {filteredEquations.length}
                  </span>
                </div>
                
                {loadingEquations ? (
                  <div className="flex justify-center py-8">
                    <Loader className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : filteredEquations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Calculator className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No equations found</p>
                    <p className="text-xs mt-1">Try a different search or category</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredEquations.map((eq) => (
                      <PaletteItem
                        key={eq.id}
                        equation={eq}
                        onDragStart={handlePaletteDragStart}
                        color={currentCategoryColor}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Examples Tab */
            <div className="p-3 space-y-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pre-built workflow templates to get you started
              </p>
              {WORKFLOW_EXAMPLES.map((example) => (
                <ExampleCard
                  key={example.id}
                  example={example}
                  onLoad={handleLoadExample}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Sidebar Toggle Button - Desktop */}
      <Button
        variant="ghost"
        size="sm"
        className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg rounded-l-none shadow-sm"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </Button>
      
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden absolute left-2 top-2 z-30 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
        onClick={() => setMobileSidebarOpen(true)}
      >
        <Menu className="w-4 h-4" />
      </Button>
      
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-2 sm:gap-4 overflow-x-auto">
          <Input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="w-32 sm:w-48 text-sm font-medium"
          />
          
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-gray-500 w-10 text-center hidden sm:inline">
              {Math.round(viewport.zoom * 100)}%
            </span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleZoomReset} className="hidden sm:flex">
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
          
          <Button variant="ghost" size="sm" onClick={handleDeleteSelected} disabled={!selectedNode}>
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClearAll} className="hidden sm:flex">
            Clear
          </Button>
          
          <div className="flex-1" />
          
          <Button variant="ghost" size="sm" onClick={handleExport} className="hidden md:flex">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSave} className="hidden md:flex">
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button 
            size="sm" 
            onClick={handleExecute}
            disabled={isExecuting || nodes.length === 0}
          >
            <Play className="w-4 h-4 mr-1" />
            {isExecuting ? 'Executing...' : 'Execute'}
          </Button>
        </div>
        
        {/* Status Bar */}
        <div className="h-8 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 overflow-hidden">
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {status}
          </span>
          {connectingPort && (
            <span className="ml-4 text-xs text-blue-500 whitespace-nowrap">
              Connecting... (ESC to cancel)
            </span>
          )}
          <div className="flex-1" />
          <span className="text-xs text-gray-400 whitespace-nowrap">
            Nodes: {nodes.length} | Connections: {connections.length} | Groups: {groups.length}
          </span>
        </div>
        
        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden bg-gray-100 dark:bg-gray-900"
          style={{
            backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
            backgroundSize: `${20 * viewport.zoom}px ${20 * viewport.zoom}px`,
            backgroundPosition: `${viewport.x}px ${viewport.y}px`,
          }}
          onDrop={handleCanvasDrop}
          onDragOver={(e) => e.preventDefault()}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        >
          {/* Transform container */}
          <div
            style={{
              transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {/* Groups SVG */}
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              {groups.map(group => (
                <GroupBox
                  key={group.id}
                  group={group}
                  nodes={nodes.filter(n => group.nodeIds.includes(n.id))}
                />
              ))}
            </svg>
            
            {/* Connections SVG */}
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              {connections.map((conn, index) => (
                <ConnectionLine
                  key={index}
                  connection={conn}
                  nodes={nodes}
                  animated={executionResults !== null}
                />
              ))}
            </svg>
            
            {/* Nodes */}
            {nodes.map((node) => {
              const group = getNodeGroup(node.id);
              return (
                <WorkflowNode
                  key={node.id}
                  node={node}
                  isSelected={selectedNode === node.id}
                  onSelect={setSelectedNode}
                  onDragStart={handleNodeDragStart}
                  onPortClick={handlePortClick}
                  onRename={handleNodeRename}
                  onValueChange={handleValueChange}
                  onGroup={handleGroup}
                  connectingPort={connectingPort}
                  isInGroup={!!group}
                  groupName={group?.name}
                />
              );
            })}
          </div>
          
          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">
                  Drag equations here
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Start building your workflow by dragging equations from the sidebar
                </p>
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="mt-4 lg:hidden text-sm text-blue-500 hover:text-blue-600"
                >
                  Open equation palette
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Right Panel - Properties */}
      {selectedNode && (
        <div className="hidden md:flex w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-col">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Node Properties
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedNode(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {(() => {
              const node = nodes.find(n => n.id === selectedNode);
              if (!node) return null;
              
              const color = DOMAIN_COLORS[node.domain] || DOMAIN_COLORS.general;
              const group = getNodeGroup(node.id);
              
              return (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Name</label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {node.name}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Domain</label>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {node.domain}
                      </span>
                    </div>
                  </div>
                  
                  {group && (
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Group</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Group className="w-3 h-3 text-purple-500" />
                        <span className="text-sm text-purple-600 dark:text-purple-400">
                          {group.name}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      Inputs ({node.inputs?.length || 0})
                    </label>
                    <div className="mt-1 space-y-1">
                      {node.inputs?.map((inp, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">
                            {inp.symbol || inp.name}
                            {inp.unit && <span className="text-gray-400 ml-1">({inp.unit})</span>}
                          </span>
                          <span className={cn(
                            "font-medium",
                            inp.connected ? "text-blue-500" : "text-gray-400"
                          )}>
                            {inp.connected ? 'Connected' : inp.value !== undefined ? inp.value : '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      Outputs ({node.outputs?.length || 0})
                    </label>
                    <div className="mt-1 space-y-1">
                      {node.outputs?.map((out, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">
                            {out.symbol || out.name}
                            {out.unit && <span className="text-gray-400 ml-1">({out.unit})</span>}
                          </span>
                          <span className={cn(
                            "font-medium",
                            out.value !== undefined ? "text-green-500" : "text-gray-400"
                          )}>
                            {out.value !== undefined ? (typeof out.value === 'number' ? out.value.toFixed(4) : out.value) : '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-2 space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleGroup(node.id)}
                    >
                      <Group className="w-4 h-4 mr-1" />
                      {group ? 'Remove from Group' : 'Add to Group'}
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      className="w-full"
                      onClick={handleDeleteSelected}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete Node
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
