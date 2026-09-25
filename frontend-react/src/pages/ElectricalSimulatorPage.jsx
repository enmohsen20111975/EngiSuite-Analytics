/**
 * Industrial Electrical Simulator Page
 * Main page for the electrical circuit simulator using React-Flow
 */
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from '../components/simulator/electrical/nodes/ElectricalNodes';
import { edgeTypes } from '../components/simulator/electrical/edges/ElectricalEdges';
import InstrumentationPanel from '../components/simulator/electrical/panels/InstrumentationPanels';
import {
  ElectricalCategories,
  ElectricalComponents,
  PhaseColors,
} from '../components/simulator/electrical/definitions/electricalComponents';

// Component palette for sidebar
const ComponentPalette = ({ onDragStart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  // Group components by category
  const componentsByCategory = useMemo(() => {
    const grouped = {};
    Object.entries(ElectricalComponents).forEach(([key, component]) => {
      const category = component.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({ key, component });
    });
    return grouped;
  }, []);
  
  // Filter components by search
  const filteredComponents = useMemo(() => {
    if (!searchTerm) return componentsByCategory;
    const filtered = {};
    Object.entries(componentsByCategory).forEach(([category, components]) => {
      const matches = components.filter(
        ({ component }) =>
          component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          component.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matches.length > 0) {
        filtered[category] = matches;
      }
    });
    return filtered;
  }, [searchTerm, componentsByCategory]);
  
  return (
    <div style={{
      width: '250px',
      backgroundColor: '#f8f9fa',
      borderRight: '1px solid #ddd',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Search */}
      <div style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
        <input
          type="text"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '13px',
          }}
        />
      </div>
      
      {/* Component list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {Object.entries(filteredComponents).map(([category, components]) => (
          <div key={category} style={{ marginBottom: '8px' }}>
            <div
              onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
              style={{
                padding: '8px 12px',
                backgroundColor: expandedCategory === category ? '#e2e8f0' : '#fff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid #ddd',
              }}
            >
              {category}
              <span>{expandedCategory === category ? '▼' : '▶'}</span>
            </div>
            
            {expandedCategory === category && (
              <div style={{ padding: '4px 0 0 8px' }}>
                {components.map(({ key, component }) => (
                  <div
                    key={key}
                    draggable
                    onDragStart={(e) => onDragStart(e, component)}
                    style={{
                      padding: '6px 12px',
                      margin: '2px 0',
                      backgroundColor: '#fff',
                      borderRadius: '3px',
                      cursor: 'grab',
                      fontSize: '11px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '8px',
                    }}>
                      ⚡
                    </span>
                    {component.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Properties panel for selected component
const PropertiesPanel = ({ selectedNode, onUpdateNode, onDeleteNode }) => {
  if (!selectedNode) {
    return (
      <div style={{
        width: '280px',
        backgroundColor: '#f8f9fa',
        borderLeft: '1px solid #ddd',
        padding: '16px',
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#666' }}>Properties</h4>
        <p style={{ fontSize: '12px', color: '#888' }}>
          Select a component to view and edit its properties
        </p>
      </div>
    );
  }
  
  const component = ElectricalComponents[selectedNode.data?.componentType];
  const propertySchema = component?.propertySchema || [];
  
  return (
    <div style={{
      width: '280px',
      backgroundColor: '#f8f9fa',
      borderLeft: '1px solid #ddd',
      padding: '16px',
      overflowY: 'auto',
      height: '100%',
    }}>
      <h4 style={{ margin: '0 0 12px 0' }}>
        {component?.name || selectedNode.data?.label}
      </h4>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>
          Label
        </label>
        <input
          type="text"
          value={selectedNode.data?.label || ''}
          onChange={(e) => onUpdateNode(selectedNode.id, { label: e.target.value })}
          style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid #ddd',
            borderRadius: '3px',
            fontSize: '12px',
          }}
        />
      </div>
      
      {propertySchema.map((prop) => (
        <div key={prop.key} style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>
            {prop.label} {prop.unit && `(${prop.unit})`}
          </label>
          {prop.type === 'select' ? (
            <select
              value={selectedNode.data?.[prop.key]?.value || prop.options?.[0]}
              onChange={(e) => onUpdateNode(selectedNode.id, { [prop.key]: { value: e.target.value } })}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px',
              }}
            >
              {prop.options?.map((opt) => (
                <option key={String(opt)} value={opt}>{opt}</option>
              ))}
            </select>
          ) : prop.type === 'boolean' ? (
            <input
              type="checkbox"
              checked={selectedNode.data?.[prop.key]?.value || false}
              onChange={(e) => onUpdateNode(selectedNode.id, { [prop.key]: { value: e.target.checked } })}
            />
          ) : (
            <input
              type="number"
              value={selectedNode.data?.[prop.key]?.value || 0}
              onChange={(e) => onUpdateNode(selectedNode.id, { [prop.key]: { value: parseFloat(e.target.value) || 0 } })}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px',
              }}
            />
          )}
        </div>
      ))}
      
      {/* State display */}
      {selectedNode.data?.state && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#1a1a1a',
          borderRadius: '4px',
        }}>
          <h5 style={{ margin: '0 0 8px 0', color: '#22c55e' }}>Live State</h5>
          {Object.entries(selectedNode.data.state).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: '#888' }}>{key}:</span>
              <span style={{ fontSize: '11px', color: '#22c55e', fontFamily: 'monospace' }}>
                {typeof value === 'boolean' ? (value ? 'ON' : 'OFF') : value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Delete button */}
      <button
        onClick={() => onDeleteNode(selectedNode.id)}
        style={{
          width: '100%',
          marginTop: '16px',
          padding: '8px',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
        }}
      >
        Delete Component
      </button>
    </div>
  );
};

// Toolbar component
const Toolbar = ({ 
  onRun, 
  onStop, 
  onReset, 
  onSave, 
  onLoad, 
  onExport,
  isRunning,
  simulationMode,
  onModeChange,
}) => {
  const simulationModes = [
    { id: 'steady', label: 'Steady State' },
    { id: 'transient', label: 'Transient' },
    { id: 'fault', label: 'Fault Analysis' },
    { id: 'harmonic', label: 'Harmonic' },
  ];
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      backgroundColor: '#2d3748',
      color: 'white',
    }}>
      {/* File operations */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button onClick={onSave} style={toolbarButtonStyle}>💾 Save</button>
        <button onClick={onLoad} style={toolbarButtonStyle}>📂 Load</button>
        <button onClick={onExport} style={toolbarButtonStyle}>📊 Export</button>
      </div>
      
      <div style={{ width: '1px', height: '24px', backgroundColor: '#4a5568' }} />
      
      {/* Simulation mode */}
      <select
        value={simulationMode}
        onChange={(e) => onModeChange(e.target.value)}
        style={{
          padding: '4px 8px',
          backgroundColor: '#4a5568',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          fontSize: '12px',
        }}
      >
        {simulationModes.map((mode) => (
          <option key={mode.id} value={mode.id}>{mode.label}</option>
        ))}
      </select>
      
      {/* Simulation controls */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          onClick={onRun}
          disabled={isRunning}
          style={{
            ...toolbarButtonStyle,
            backgroundColor: isRunning ? '#22c55e' : '#16a34a',
            opacity: isRunning ? 0.7 : 1,
          }}
        >
          ▶ Run
        </button>
        <button
          onClick={onStop}
          disabled={!isRunning}
          style={{
            ...toolbarButtonStyle,
            opacity: !isRunning ? 0.5 : 1,
          }}
        >
          ⏹ Stop
        </button>
        <button onClick={onReset} style={toolbarButtonStyle}>🔄 Reset</button>
      </div>
      
      <div style={{ flex: 1 }} />
      
      {/* Status indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
      }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: isRunning ? '#22c55e' : '#666',
        }} />
        {isRunning ? 'Running' : 'Stopped'}
      </div>
    </div>
  );
};

const toolbarButtonStyle = {
  padding: '4px 12px',
  backgroundColor: '#4a5568',
  color: 'white',
  border: 'none',
  borderRadius: '3px',
  cursor: 'pointer',
  fontSize: '12px',
};

// Main simulator component
const ElectricalSimulator = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationMode, setSimulationMode] = useState('steady');
  const [showInstrumentation, setShowInstrumentation] = useState(true);
  const { screenToFlowPosition } = useReactFlow();
  
  // Simulation data state
  const [simulationData, setSimulationData] = useState({
    voltages: [230, 230, 230],
    currents: [10, 10, 10],
    frequency: 50,
    powerFactor: 0.85,
    activePower: 5.5,
    reactivePower: 3.2,
    apparentPower: 6.4,
    energy: 1234.5,
    thd: 5.2,
  });
  
  // Handle node selection
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);
  
  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);
  
  // Handle edge connection
  const onConnect = useCallback((params) => {
    // Determine edge type based on source/target handle types
    let edgeType = 'default';
    const sourceHandle = params.sourceHandle || '';
    const targetHandle = params.targetHandle || '';
    
    if (sourceHandle.includes('a') || sourceHandle.includes('b') || sourceHandle.includes('c')) {
      edgeType = 'three_phase';
    }
    if (sourceHandle.includes('control') || targetHandle.includes('control')) {
      edgeType = 'control';
    }
    if (sourceHandle.includes('earth') || targetHandle.includes('earth')) {
      edgeType = 'earth';
    }
    
    setEdges((eds) =>
      addEdge(
        {
          ...params,
          type: edgeType,
          data: {
            phase: sourceHandle.split('_')[0] || 'a',
            cableSize: 2.5,
            active: isRunning,
          },
          animated: isRunning,
        },
        eds
      )
    );
  }, [setEdges, isRunning]);
  
  // Handle drag start from palette
  const onDragStart = (event, component) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(component));
    event.dataTransfer.effectAllowed = 'move';
  };
  
  // Handle drop on canvas
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      
      const data = event.dataTransfer.getData('application/reactflow');
      if (!data) return;
      
      const component = JSON.parse(data);
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const newNode = {
        id: `${component.type}_${Date.now()}`,
        type: component.type.toLowerCase(),
        position,
        data: {
          label: component.defaultLabel || component.type,
          componentType: component.type,
          ...component.defaultProperties,
          state: { ...component.state },
        },
      };
      
      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes]
  );
  
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  // Update node properties
  const onUpdateNode = useCallback((nodeId, updates) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...updates,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);
  
  // Delete node
  const onDeleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null);
  }, [setNodes, setEdges]);
  
  // Simulation loop
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      // Update simulation data
      setSimulationData((prev) => ({
        ...prev,
        voltages: prev.voltages.map((v) => v + (Math.random() - 0.5) * 2),
        currents: prev.currents.map((c) => c + (Math.random() - 0.5) * 0.5),
        frequency: 50 + (Math.random() - 0.5) * 0.1,
        powerFactor: Math.min(1, Math.max(0.7, prev.powerFactor + (Math.random() - 0.5) * 0.02)),
        activePower: prev.activePower + (Math.random() - 0.5) * 0.1,
        reactivePower: prev.reactivePower + (Math.random() - 0.5) * 0.05,
        energy: prev.energy + 0.001,
      }));
      
      // Update node states
      setNodes((nds) =>
        nds.map((node) => {
          if (node.data?.state) {
            return {
              ...node,
              data: {
                ...node.data,
                state: {
                  ...node.data.state,
                  // Update state based on simulation
                  ...(node.type === 'ammeter' && { value: simulationData.currents[0] }),
                  ...(node.type === 'voltmeter' && { value: simulationData.voltages[0] }),
                  ...(node.type === 'wattmeter' && { value: simulationData.activePower }),
                },
              },
            };
          }
          return node;
        })
      );
      
      // Update edge animation
      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          animated: isRunning,
          data: {
            ...edge.data,
            active: isRunning,
          },
        }))
      );
    }, 100);
    
    return () => clearInterval(interval);
  }, [isRunning, setNodes, setEdges]);
  
  // Save circuit
  const onSave = useCallback(() => {
    const circuit = { nodes, edges };
    const blob = new Blob([JSON.stringify(circuit, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'electrical_circuit.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);
  
  // Load circuit
  const onLoad = useCallback(() => {
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
            setNodes(circuit.nodes || []);
            setEdges(circuit.edges || []);
          } catch (err) {
            console.error('Failed to load circuit:', err);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [setNodes, setEdges]);
  
  // Export to image
  const onExport = useCallback(() => {
    // Would need html2canvas or similar for actual export
    alert('Export feature - would capture canvas as PNG/PDF');
  }, []);
  
  // Run simulation
  const onRun = useCallback(() => {
    setIsRunning(true);
  }, []);
  
  // Stop simulation
  const onStop = useCallback(() => {
    setIsRunning(false);
  }, []);
  
  // Reset simulation
  const onReset = useCallback(() => {
    setIsRunning(false);
    setSimulationData({
      voltages: [230, 230, 230],
      currents: [10, 10, 10],
      frequency: 50,
      powerFactor: 0.85,
      activePower: 5.5,
      reactivePower: 3.2,
      apparentPower: 6.4,
      energy: 1234.5,
      thd: 5.2,
    });
  }, []);
  
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Toolbar
        onRun={onRun}
        onStop={onStop}
        onReset={onReset}
        onSave={onSave}
        onLoad={onLoad}
        onExport={onExport}
        isRunning={isRunning}
        simulationMode={simulationMode}
        onModeChange={setSimulationMode}
      />
      
      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Component palette */}
        <ComponentPalette onDragStart={onDragStart} />
        
        {/* Canvas */}
        <div ref={reactFlowWrapper} style={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            snapToGrid
            snapGrid={[10, 10]}
            defaultEdgeOptions={{
              type: 'default',
              animated: false,
            }}
          >
            <Controls />
            <MiniMap
              nodeStrokeColor={(n) => {
                if (n.type === 'ac_source_3ph') return '#22c55e';
                if (n.type === 'transformer_2w') return '#3b82f6';
                if (n.type === 'circuit_breaker') return '#ef4444';
                return '#666';
              }}
              style={{
                backgroundColor: '#1a1a1a',
              }}
            />
            <Background variant="dots" gap={20} size={1} />
            
            {/* Toggle instrumentation panel button */}
            <Panel position="top-right">
              <button
                onClick={() => setShowInstrumentation(!showInstrumentation)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                {showInstrumentation ? '📊 Hide Meters' : '📊 Show Meters'}
              </button>
            </Panel>
          </ReactFlow>
        </div>
        
        {/* Properties panel */}
        <PropertiesPanel
          selectedNode={selectedNode}
          onUpdateNode={onUpdateNode}
          onDeleteNode={onDeleteNode}
        />
      </div>
      
      {/* Instrumentation panel (bottom drawer) */}
      {showInstrumentation && (
        <div style={{
          height: '350px',
          borderTop: '1px solid #ddd',
          overflowY: 'auto',
          backgroundColor: '#fff',
        }}>
          <InstrumentationPanel
            meterData={simulationData}
            waveformData={[]}
            harmonicData={[]}
            eventData={[]}
          />
        </div>
      )}
    </div>
  );
};

// Wrap with ReactFlowProvider
const ElectricalSimulatorPage = () => {
  return (
    <ReactFlowProvider>
      <ElectricalSimulator />
    </ReactFlowProvider>
  );
};

export default ElectricalSimulatorPage;
