/**
 * Simulator Context
 * Centralized state management for hydraulic/electrical circuit simulator
 * 
 * Converted from: external/Hydraulic-Simulator_JS/modules/core/State.js
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

// Initial state
const initialState = {
  // Circuit elements
  components: [],
  wires: [],
  connections: [],
  nodes: [],
  
  // Selection state
  selectedComponents: [],
  selectedWires: [],
  
  // Clipboard for copy/paste
  clipboard: [],
  
  // History for undo/redo
  history: {
    past: [],
    present: null,
    future: []
  },
  
  // Canvas state
  canvas: {
    offset: { x: 0, y: 0 },
    zoom: 1,
    isDragging: false,
    isPanning: false
  },
  
  // Tool state
  tool: {
    current: 'select',
    currentComponent: null,
    drawingWire: false,
    wireStart: null,
    wirePoints: []
  },
  
  // Settings
  settings: {
    gridSize: 20,
    snapToGrid: true,
    showGrid: true,
    theme: typeof localStorage !== 'undefined' ? (localStorage.getItem('theme') || 'light') : 'light',
    symbolStandard: 'IEC',
    autoSave: true,
    autoSaveInterval: 30000,
    
    // Unit settings
    pressureUnit: 'bar',
    flowUnit: 'L/min',
    powerUnit: 'kW',
    
    // Display settings
    showPressures: true,
    showFlows: true,
    showPower: false,
    showNodeNumbers: false,
    
    // Wire routing settings
    routingGridSize: 10,
    enableSmartRouting: true,
    wireRoutingAlgorithm: 'orthogonal',
    componentClearance: 15,
    minWireSpacing: 12,
    showJunctionDots: true,
    showWireWaypoints: false
  },
  
  // Analysis state
  analysis: {
    isAnalyzing: false,
    pressures: {},
    flows: {},
    powers: {},
    mode: 'steady'
  },
  
  // Simulation state
  simulation: {
    isRunning: false,
    time: 0,
    speed: 1,
    results: {}
  },
  
  // UI state
  ui: {
    showProperties: true,
    showMeasurements: true,
    showAnalysis: false,
    selectedPropertyTab: 'properties',
    componentLibrary: 'hydraulic'
  }
};

// Action types
const ActionTypes = {
  // Component actions
  ADD_COMPONENT: 'ADD_COMPONENT',
  REMOVE_COMPONENT: 'REMOVE_COMPONENT',
  UPDATE_COMPONENT: 'UPDATE_COMPONENT',
  MOVE_COMPONENT: 'MOVE_COMPONENT',
  
  // Wire actions
  ADD_WIRE: 'ADD_WIRE',
  REMOVE_WIRE: 'REMOVE_WIRE',
  UPDATE_WIRE: 'UPDATE_WIRE',
  
  // Selection actions
  SELECT_COMPONENT: 'SELECT_COMPONENT',
  DESELECT_COMPONENT: 'DESELECT_COMPONENT',
  SELECT_WIRE: 'SELECT_WIRE',
  DESELECT_WIRE: 'DESELECT_WIRE',
  CLEAR_SELECTION: 'CLEAR_SELECTION',
  
  // Clipboard actions
  COPY_TO_CLIPBOARD: 'COPY_TO_CLIPBOARD',
  PASTE_FROM_CLIPBOARD: 'PASTE_FROM_CLIPBOARD',
  
  // History actions
  SAVE_STATE: 'SAVE_STATE',
  UNDO: 'UNDO',
  REDO: 'REDO',
  
  // Canvas actions
  SET_CANVAS_OFFSET: 'SET_CANVAS_OFFSET',
  SET_CANVAS_ZOOM: 'SET_CANVAS_ZOOM',
  PAN_CANVAS: 'PAN_CANVAS',
  RESET_VIEW: 'RESET_VIEW',
  
  // Tool actions
  SET_TOOL: 'SET_TOOL',
  SET_CURRENT_COMPONENT: 'SET_CURRENT_COMPONENT',
  START_WIRE_DRAWING: 'START_WIRE_DRAWING',
  ADD_WIRE_POINT: 'ADD_WIRE_POINT',
  END_WIRE_DRAWING: 'END_WIRE_DRAWING',
  
  // Settings actions
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  SET_THEME: 'SET_THEME',
  
  // Analysis actions
  SET_ANALYSIS_RESULTS: 'SET_ANALYSIS_RESULTS',
  CLEAR_ANALYSIS: 'CLEAR_ANALYSIS',
  
  // Simulation actions
  START_SIMULATION: 'START_SIMULATION',
  STOP_SIMULATION: 'STOP_SIMULATION',
  UPDATE_SIMULATION_TIME: 'UPDATE_SIMULATION_TIME',
  SET_SIMULATION_RESULTS: 'SET_SIMULATION_RESULTS',
  
  // UI actions
  SET_UI_STATE: 'SET_UI_STATE',
  SET_COMPONENT_LIBRARY: 'SET_COMPONENT_LIBRARY',
  
  // Circuit actions
  CLEAR_CIRCUIT: 'CLEAR_CIRCUIT',
  LOAD_CIRCUIT: 'LOAD_CIRCUIT',
  IMPORT_CIRCUIT: 'IMPORT_CIRCUIT'
};

// Generate unique ID
const generateId = (prefix = 'comp') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Reducer function
function simulatorReducer(state, action) {
  switch (action.type) {
    // Component actions
    case ActionTypes.ADD_COMPONENT: {
      const newComponent = {
        ...action.payload,
        id: action.payload.id || generateId('comp')
      };
      return {
        ...state,
        components: [...state.components, newComponent],
        history: saveToHistory(state)
      };
    }
    
    case ActionTypes.REMOVE_COMPONENT: {
      const id = action.payload;
      return {
        ...state,
        components: state.components.filter(c => c.id !== id),
        wires: state.wires.filter(w => w.from.componentId !== id && w.to.componentId !== id),
        selectedComponents: state.selectedComponents.filter(cid => cid !== id),
        history: saveToHistory(state)
      };
    }
    
    case ActionTypes.UPDATE_COMPONENT: {
      const { id, updates } = action.payload;
      return {
        ...state,
        components: state.components.map(c => 
          c.id === id ? { ...c, ...updates } : c
        ),
        history: saveToHistory(state)
      };
    }
    
    case ActionTypes.MOVE_COMPONENT: {
      const { id, x, y } = action.payload;
      return {
        ...state,
        components: state.components.map(c => 
          c.id === id ? { ...c, x, y } : c
        )
      };
    }
    
    // Wire actions
    case ActionTypes.ADD_WIRE: {
      const newWire = {
        ...action.payload,
        id: action.payload.id || generateId('wire')
      };
      return {
        ...state,
        wires: [...state.wires, newWire],
        history: saveToHistory(state)
      };
    }
    
    case ActionTypes.REMOVE_WIRE: {
      const id = action.payload;
      return {
        ...state,
        wires: state.wires.filter(w => w.id !== id),
        selectedWires: state.selectedWires.filter(wid => wid !== id),
        history: saveToHistory(state)
      };
    }
    
    case ActionTypes.UPDATE_WIRE: {
      const { id, updates } = action.payload;
      return {
        ...state,
        wires: state.wires.map(w => 
          w.id === id ? { ...w, ...updates } : w
        ),
        history: saveToHistory(state)
      };
    }
    
    // Selection actions
    case ActionTypes.SELECT_COMPONENT: {
      const { id, addToSelection } = action.payload;
      return {
        ...state,
        selectedComponents: addToSelection 
          ? [...state.selectedComponents, id]
          : [id],
        selectedWires: addToSelection ? state.selectedWires : []
      };
    }
    
    case ActionTypes.DESELECT_COMPONENT: {
      return {
        ...state,
        selectedComponents: state.selectedComponents.filter(id => id !== action.payload)
      };
    }
    
    case ActionTypes.SELECT_WIRE: {
      const { id, addToSelection } = action.payload;
      return {
        ...state,
        selectedWires: addToSelection 
          ? [...state.selectedWires, id]
          : [id],
        selectedComponents: addToSelection ? state.selectedComponents : []
      };
    }
    
    case ActionTypes.DESELECT_WIRE: {
      return {
        ...state,
        selectedWires: state.selectedWires.filter(id => id !== action.payload)
      };
    }
    
    case ActionTypes.CLEAR_SELECTION: {
      return {
        ...state,
        selectedComponents: [],
        selectedWires: []
      };
    }
    
    // Clipboard actions
    case ActionTypes.COPY_TO_CLIPBOARD: {
      const selectedComps = state.components.filter(c => 
        state.selectedComponents.includes(c.id)
      );
      return {
        ...state,
        clipboard: selectedComps.map(c => ({ ...c }))
      };
    }
    
    case ActionTypes.PASTE_FROM_CLIPBOARD: {
      const newComponents = state.clipboard.map(c => ({
        ...c,
        id: generateId('comp'),
        x: c.x + 30,
        y: c.y + 30
      }));
      return {
        ...state,
        components: [...state.components, ...newComponents],
        selectedComponents: newComponents.map(c => c.id),
        history: saveToHistory(state)
      };
    }
    
    // History actions
    case ActionTypes.UNDO: {
      if (state.history.past.length === 0) return state;
      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);
      return {
        ...state,
        components: previous.components,
        wires: previous.wires,
        history: {
          past: newPast,
          present: previous,
          future: [state.history.present, ...state.history.future]
        }
      };
    }
    
    case ActionTypes.REDO: {
      if (state.history.future.length === 0) return state;
      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);
      return {
        ...state,
        components: next.components,
        wires: next.wires,
        history: {
          past: [...state.history.past, state.history.present],
          present: next,
          future: newFuture
        }
      };
    }
    
    // Canvas actions
    case ActionTypes.SET_CANVAS_OFFSET: {
      return {
        ...state,
        canvas: {
          ...state.canvas,
          offset: action.payload
        }
      };
    }
    
    case ActionTypes.SET_CANVAS_ZOOM: {
      return {
        ...state,
        canvas: {
          ...state.canvas,
          zoom: action.payload
        }
      };
    }
    
    case ActionTypes.PAN_CANVAS: {
      const { dx, dy } = action.payload;
      return {
        ...state,
        canvas: {
          ...state.canvas,
          offset: {
            x: state.canvas.offset.x + dx,
            y: state.canvas.offset.y + dy
          }
        }
      };
    }
    
    case ActionTypes.RESET_VIEW: {
      return {
        ...state,
        canvas: {
          ...state.canvas,
          offset: { x: 0, y: 0 },
          zoom: 1
        }
      };
    }
    
    // Tool actions
    case ActionTypes.SET_TOOL: {
      return {
        ...state,
        tool: {
          ...state.tool,
          current: action.payload
        }
      };
    }
    
    case ActionTypes.SET_CURRENT_COMPONENT: {
      return {
        ...state,
        tool: {
          ...state.tool,
          currentComponent: action.payload
        }
      };
    }
    
    case ActionTypes.START_WIRE_DRAWING: {
      return {
        ...state,
        tool: {
          ...state.tool,
          drawingWire: true,
          wireStart: action.payload,
          wirePoints: [action.payload]
        }
      };
    }
    
    case ActionTypes.ADD_WIRE_POINT: {
      return {
        ...state,
        tool: {
          ...state.tool,
          wirePoints: [...state.tool.wirePoints, action.payload]
        }
      };
    }
    
    case ActionTypes.END_WIRE_DRAWING: {
      return {
        ...state,
        tool: {
          ...state.tool,
          drawingWire: false,
          wireStart: null,
          wirePoints: []
        }
      };
    }
    
    // Settings actions
    case ActionTypes.UPDATE_SETTINGS: {
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
    }
    
    case ActionTypes.SET_THEME: {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('theme', action.payload);
      }
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: action.payload
        }
      };
    }
    
    // Analysis actions
    case ActionTypes.SET_ANALYSIS_RESULTS: {
      return {
        ...state,
        analysis: {
          ...state.analysis,
          ...action.payload,
          isAnalyzing: false
        }
      };
    }
    
    case ActionTypes.CLEAR_ANALYSIS: {
      return {
        ...state,
        analysis: {
          ...state.analysis,
          pressures: {},
          flows: {},
          powers: {},
          results: {}
        }
      };
    }
    
    // Simulation actions
    case ActionTypes.START_SIMULATION: {
      return {
        ...state,
        simulation: {
          ...state.simulation,
          isRunning: true,
          time: 0
        }
      };
    }
    
    case ActionTypes.STOP_SIMULATION: {
      return {
        ...state,
        simulation: {
          ...state.simulation,
          isRunning: false
        }
      };
    }
    
    case ActionTypes.UPDATE_SIMULATION_TIME: {
      return {
        ...state,
        simulation: {
          ...state.simulation,
          time: action.payload
        }
      };
    }
    
    case ActionTypes.SET_SIMULATION_RESULTS: {
      return {
        ...state,
        simulation: {
          ...state.simulation,
          results: action.payload
        }
      };
    }
    
    // UI actions
    case ActionTypes.SET_UI_STATE: {
      return {
        ...state,
        ui: {
          ...state.ui,
          ...action.payload
        }
      };
    }
    
    case ActionTypes.SET_COMPONENT_LIBRARY: {
      return {
        ...state,
        ui: {
          ...state.ui,
          componentLibrary: action.payload
        }
      };
    }
    
    // Circuit actions
    case ActionTypes.CLEAR_CIRCUIT: {
      return {
        ...state,
        components: [],
        wires: [],
        nodes: [],
        selectedComponents: [],
        selectedWires: [],
        analysis: {
          ...state.analysis,
          pressures: {},
          flows: {},
          powers: {}
        },
        history: saveToHistory(state)
      };
    }
    
    case ActionTypes.LOAD_CIRCUIT: {
      const { components, wires, settings } = action.payload;
      return {
        ...state,
        components: components || [],
        wires: wires || [],
        settings: settings ? { ...state.settings, ...settings } : state.settings,
        selectedComponents: [],
        selectedWires: [],
        history: {
          past: [],
          present: { components: components || [], wires: wires || [] },
          future: []
        }
      };
    }
    
    case ActionTypes.IMPORT_CIRCUIT: {
      const data = action.payload;
      return {
        ...state,
        components: data.components || state.components,
        wires: data.wires || state.wires,
        settings: data.settings ? { ...state.settings, ...data.settings } : state.settings,
        history: saveToHistory(state)
      };
    }
    
    default:
      return state;
  }
}

// Helper function to save state to history
function saveToHistory(state) {
  const present = {
    components: JSON.parse(JSON.stringify(state.components)),
    wires: JSON.parse(JSON.stringify(state.wires))
  };
  
  const past = state.history.present 
    ? [...state.history.past, state.history.present].slice(-49) // Keep last 50 states
    : [];
  
  return {
    past,
    present,
    future: []
  };
}

// Create context
const SimulatorContext = createContext(null);

// Provider component
export function SimulatorProvider({ children, initialState: customInitialState }) {
  const [state, dispatch] = useReducer(
    simulatorReducer, 
    customInitialState ? { ...initialState, ...customInitialState } : initialState
  );
  
  // Action creators
  const actions = useMemo(() => ({
    // Component actions
    addComponent: (component) => dispatch({ type: ActionTypes.ADD_COMPONENT, payload: component }),
    removeComponent: (id) => dispatch({ type: ActionTypes.REMOVE_COMPONENT, payload: id }),
    updateComponent: (id, updates) => dispatch({ type: ActionTypes.UPDATE_COMPONENT, payload: { id, updates } }),
    moveComponent: (id, x, y) => dispatch({ type: ActionTypes.MOVE_COMPONENT, payload: { id, x, y } }),
    
    // Wire actions
    addWire: (wire) => dispatch({ type: ActionTypes.ADD_WIRE, payload: wire }),
    removeWire: (id) => dispatch({ type: ActionTypes.REMOVE_WIRE, payload: id }),
    updateWire: (id, updates) => dispatch({ type: ActionTypes.UPDATE_WIRE, payload: { id, updates } }),
    
    // Selection actions
    selectComponent: (id, addToSelection = false) => 
      dispatch({ type: ActionTypes.SELECT_COMPONENT, payload: { id, addToSelection } }),
    deselectComponent: (id) => dispatch({ type: ActionTypes.DESELECT_COMPONENT, payload: id }),
    selectWire: (id, addToSelection = false) => 
      dispatch({ type: ActionTypes.SELECT_WIRE, payload: { id, addToSelection } }),
    deselectWire: (id) => dispatch({ type: ActionTypes.DESELECT_WIRE, payload: id }),
    clearSelection: () => dispatch({ type: ActionTypes.CLEAR_SELECTION }),
    
    // Clipboard actions
    copyToClipboard: () => dispatch({ type: ActionTypes.COPY_TO_CLIPBOARD }),
    pasteFromClipboard: () => dispatch({ type: ActionTypes.PASTE_FROM_CLIPBOARD }),
    
    // History actions
    undo: () => dispatch({ type: ActionTypes.UNDO }),
    redo: () => dispatch({ type: ActionTypes.REDO }),
    
    // Canvas actions
    setCanvasOffset: (offset) => dispatch({ type: ActionTypes.SET_CANVAS_OFFSET, payload: offset }),
    setCanvasZoom: (zoom) => dispatch({ type: ActionTypes.SET_CANVAS_ZOOM, payload: zoom }),
    panCanvas: (dx, dy) => dispatch({ type: ActionTypes.PAN_CANVAS, payload: { dx, dy } }),
    resetView: () => dispatch({ type: ActionTypes.RESET_VIEW }),
    
    // Tool actions
    setTool: (tool) => dispatch({ type: ActionTypes.SET_TOOL, payload: tool }),
    setCurrentComponent: (component) => dispatch({ type: ActionTypes.SET_CURRENT_COMPONENT, payload: component }),
    startWireDrawing: (point) => dispatch({ type: ActionTypes.START_WIRE_DRAWING, payload: point }),
    addWirePoint: (point) => dispatch({ type: ActionTypes.ADD_WIRE_POINT, payload: point }),
    endWireDrawing: () => dispatch({ type: ActionTypes.END_WIRE_DRAWING }),
    
    // Settings actions
    updateSettings: (settings) => dispatch({ type: ActionTypes.UPDATE_SETTINGS, payload: settings }),
    setTheme: (theme) => dispatch({ type: ActionTypes.SET_THEME, payload: theme }),
    
    // Analysis actions
    setAnalysisResults: (results) => dispatch({ type: ActionTypes.SET_ANALYSIS_RESULTS, payload: results }),
    clearAnalysis: () => dispatch({ type: ActionTypes.CLEAR_ANALYSIS }),
    
    // Simulation actions
    startSimulation: () => dispatch({ type: ActionTypes.START_SIMULATION }),
    stopSimulation: () => dispatch({ type: ActionTypes.STOP_SIMULATION }),
    updateSimulationTime: (time) => dispatch({ type: ActionTypes.UPDATE_SIMULATION_TIME, payload: time }),
    setSimulationResults: (results) => dispatch({ type: ActionTypes.SET_SIMULATION_RESULTS, payload: results }),
    
    // UI actions
    setUIState: (uiState) => dispatch({ type: ActionTypes.SET_UI_STATE, payload: uiState }),
    setComponentLibrary: (library) => dispatch({ type: ActionTypes.SET_COMPONENT_LIBRARY, payload: library }),
    
    // Circuit actions
    clearCircuit: () => dispatch({ type: ActionTypes.CLEAR_CIRCUIT }),
    loadCircuit: (circuit) => dispatch({ type: ActionTypes.LOAD_CIRCUIT, payload: circuit }),
    importCircuit: (data) => dispatch({ type: ActionTypes.IMPORT_CIRCUIT, payload: data })
  }), []);
  
  // Computed values
  const computed = useMemo(() => ({
    getSelectedComponents: () => state.components.filter(c => state.selectedComponents.includes(c.id)),
    getSelectedWires: () => state.wires.filter(w => state.selectedWires.includes(w.id)),
    getComponent: (id) => state.components.find(c => c.id === id),
    getWire: (id) => state.wires.find(w => w.id === id),
    getConnectedWires: (componentId, terminalIndex) => state.wires.filter(w =>
      (w.from.componentId === componentId && w.from.terminalIndex === terminalIndex) ||
      (w.to.componentId === componentId && w.to.terminalIndex === terminalIndex)
    ),
    canUndo: state.history.past.length > 0,
    canRedo: state.history.future.length > 0,
    exportCircuit: () => ({
      version: '1.0',
      type: 'hydraulic-circuit',
      components: state.components,
      wires: state.wires,
      settings: state.settings
    })
  }), [state]);
  
  const value = useMemo(() => ({
    state,
    dispatch,
    actions,
    computed,
    generateId
  }), [state, actions, computed]);
  
  return (
    <SimulatorContext.Provider value={value}>
      {children}
    </SimulatorContext.Provider>
  );
}

// Custom hook to use simulator context
export function useSimulator() {
  const context = useContext(SimulatorContext);
  if (!context) {
    throw new Error('useSimulator must be used within a SimulatorProvider');
  }
  return context;
}

export { ActionTypes, generateId };
