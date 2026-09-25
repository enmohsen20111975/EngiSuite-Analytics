/**
 * HydraulicSimulatorPage
 * Main page component for the hydraulic circuit simulator
 * 
 * Converted from: external/Hydraulic-Simulator_JS/index.html and app.js
 */

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { SimulatorProvider, useSimulator } from '../components/simulator/context/SimulatorContext';
import { SimulatorCanvas } from '../components/simulator/canvas/SimulatorCanvas';
import { ComponentPanel } from '../components/simulator/panels/ComponentPanel';
import { PropertiesPanel } from '../components/simulator/panels/PropertiesPanel';
import { AnalysisPanel } from '../components/simulator/panels/AnalysisPanel';
import { Toolbar } from '../components/simulator/ui/Toolbar';
import { StatusBar } from '../components/simulator/ui/StatusBar';
import { createComponentInstance, HYDRAULIC_CATEGORIES } from '../components/simulator/components/definitions/hydraulic';

// Main simulator content (needs to be inside SimulatorProvider)
function SimulatorContent() {
  const { state, actions, computed } = useSimulator();
  const fileInputRef = useRef(null);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      const ctrl = e.ctrlKey || e.metaKey;
      
      if (ctrl && e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if (ctrl && e.key === 'o') {
        e.preventDefault();
        handleLoad();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state]);
  
  // Save circuit to file
  const handleSave = useCallback(() => {
    const circuit = computed.exportCircuit();
    const dataStr = JSON.stringify(circuit, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `hydraulic-circuit-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }, [computed]);
  
  // Load circuit from file
  const handleLoad = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  // Handle file input change
  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const circuit = JSON.parse(event.target.result);
        actions.loadCircuit(circuit);
      } catch (error) {
        console.error('Failed to load circuit:', error);
        alert('Failed to load circuit file. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    e.target.value = '';
  }, [actions]);
  
  // Handle new circuit
  const handleNew = useCallback(() => {
    if (state.components.length > 0 || state.wires.length > 0) {
      if (!confirm('Are you sure you want to create a new circuit? Unsaved changes will be lost.')) {
        return;
      }
    }
    actions.clearCircuit();
  }, [state.components.length, state.wires.length, actions]);
  
  // Handle example circuit load
  const handleLoadExample = useCallback((exampleId) => {
    const examples = getExampleCircuits();
    const example = examples.find(e => e.id === exampleId);
    if (example) {
      actions.loadCircuit(example.circuit);
    }
  }, [actions]);
  
  // Toggle simulation
  const handleToggleSimulation = useCallback(() => {
    if (state.simulation.isRunning) {
      actions.stopSimulation();
    } else {
      actions.startSimulation();
    }
  }, [state.simulation.isRunning, actions]);
  
  // Theme styles
  const isDark = state.settings.theme === 'dark';
  
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: isDark ? '#1a1a2e' : '#f5f5f5',
    color: isDark ? '#ffffff' : '#333333',
    overflow: 'hidden'
  };
  
  const mainStyle = {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
  };
  
  const sidebarStyle = (side) => ({
    width: side === 'left' ? '250px' : '300px',
    backgroundColor: isDark ? '#16213e' : '#ffffff',
    borderRight: side === 'left' ? `1px solid ${isDark ? '#2a2a4a' : '#e0e0e0'}` : 'none',
    borderLeft: side === 'right' ? `1px solid ${isDark ? '#2a2a4a' : '#e0e0e0'}` : 'none',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  });
  
  const canvasContainerStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };
  
  return (
    <div style={containerStyle}>
      {/* Header / Toolbar */}
      <Toolbar
        onSave={handleSave}
        onLoad={handleLoad}
        onNew={handleNew}
        onLoadExample={handleLoadExample}
        onToggleSimulation={handleToggleSimulation}
        isSimulationRunning={state.simulation.isRunning}
        canUndo={computed.canUndo}
        canRedo={computed.canRedo}
        onUndo={actions.undo}
        onRedo={actions.redo}
        currentTool={state.tool.current}
        onToolChange={actions.setTool}
        theme={state.settings.theme}
        onThemeChange={actions.setTheme}
        zoom={state.canvas.zoom}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        onFitToScreen={() => {}}
      />
      
      {/* Main Content */}
      <div style={mainStyle}>
        {/* Left Sidebar - Component Panel */}
        <aside style={sidebarStyle('left')}>
          <ComponentPanel
            categories={HYDRAULIC_CATEGORIES}
            currentLibrary={state.ui.componentLibrary}
            onLibraryChange={actions.setComponentLibrary}
            onComponentSelect={(type) => {
              actions.setCurrentComponent(type);
              actions.setTool('component');
            }}
            theme={state.settings.theme}
          />
        </aside>
        
        {/* Center - Canvas */}
        <main style={canvasContainerStyle}>
          <SimulatorCanvas />
        </main>
        
        {/* Right Sidebar - Properties & Analysis */}
        <aside style={sidebarStyle('right')}>
          <PropertiesPanel
            selectedComponents={computed.getSelectedComponents()}
            selectedWires={computed.getSelectedWires()}
            onUpdateComponent={actions.updateComponent}
            onUpdateWire={actions.updateWire}
            onDelete={ () => {
              state.selectedComponents.forEach(id => actions.removeComponent(id));
              state.selectedWires.forEach(id => actions.removeWire(id));
              actions.clearSelection();
            }}
            theme={state.settings.theme}
          />
          
          {state.ui.showAnalysis && (
            <AnalysisPanel
              analysis={state.analysis}
              onClose={() => actions.setUIState({ showAnalysis: false })}
              theme={state.settings.theme}
            />
          )}
        </aside>
      </div>
      
      {/* Status Bar */}
      <StatusBar
        componentCount={state.components.length}
        wireCount={state.wires.length}
        zoom={state.canvas.zoom}
        cursorPosition={state.ui.cursorPosition}
        isSimulationRunning={state.simulation.isRunning}
        simulationTime={state.simulation.time}
        theme={state.settings.theme}
      />
      
      {/* Hidden file input for loading */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}

// Example circuits
function getExampleCircuits() {
  return [
    {
      id: 'basic-pump-circuit',
      name: 'Basic Pump Circuit',
      description: 'Simple pump with tank and pressure relief valve',
      circuit: {
        components: [
          { ...createComponentInstance('TANK', 100, 200), id: 'tank-1' },
          { ...createComponentInstance('PUMP', 200, 180), id: 'pump-1' },
          { ...createComponentInstance('PRESSURE_RELIEF_VALVE', 350, 180), id: 'prv-1' },
          { ...createComponentInstance('PRESSURE_GAUGE', 420, 150), id: 'gauge-1' }
        ],
        wires: []
      }
    },
    {
      id: 'cylinder-control',
      name: 'Cylinder Control',
      description: 'Double-acting cylinder with 4/3 valve',
      circuit: {
        components: [
          { ...createComponentInstance('TANK', 100, 300), id: 'tank-1' },
          { ...createComponentInstance('PUMP', 200, 280), id: 'pump-1' },
          { ...createComponentInstance('DIRECTIONAL_VALVE_4_3', 350, 260), id: 'valve-1' },
          { ...createComponentInstance('CYLINDER_DOUBLE', 500, 270), id: 'cylinder-1' }
        ],
        wires: []
      }
    },
    {
      id: 'motor-circuit',
      name: 'Motor Circuit',
      description: 'Hydraulic motor with flow control',
      circuit: {
        components: [
          { ...createComponentInstance('TANK', 100, 250), id: 'tank-1' },
          { ...createComponentInstance('PUMP', 200, 230), id: 'pump-1' },
          { ...createComponentInstance('FLOW_CONTROL_VALVE', 350, 230), id: 'fcv-1' },
          { ...createComponentInstance('HYDRAULIC_MOTOR', 500, 220), id: 'motor-1' }
        ],
        wires: []
      }
    }
  ];
}

// Page wrapper with provider
export default function HydraulicSimulatorPage() {
  return (
    <SimulatorProvider>
      <SimulatorContent />
    </SimulatorProvider>
  );
}
