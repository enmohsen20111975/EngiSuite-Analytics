import { create } from 'zustand';
import { Circuit, CircuitComponent, Connection, PlcTag, PlcMapping, LadderRung, LogicCondition, LogicOutput, UnitSystem, SimulationSettings, ComponentParameter, Point, PlcInputMapping } from '../types';
import { produce } from 'immer';

interface SimulationUpdates {
    componentUpdates?: Record<string, object>;
    connectionUpdates?: Record<string, object>;
}
interface CircuitState {
  circuit: Circuit | null;
  selectedComponentId: string | null;
  selectedConnectionId: string | null;
  connectionStartPoint: { componentId: string; ioId: string } | null;
  
  // UI State
  showLabels: boolean;
  isSimulationRunning: boolean;
  zoom: number;

  // PLC State
  plcConnected: boolean;
  plcTags: PlcTag[];
  plcMappings: PlcMapping[];
  plcInputMappings: PlcInputMapping[];
  plcInputValues: Record<string, any>;
  plcSendMessage: (message: object) => void;

  loadCircuit: (circuit: Circuit) => void;
  addComponent: (component: CircuitComponent) => void;
  updateComponentPosition: (id: string, x: number, y: number) => void;
  updateComponentRotation: (id: string, rotation: number) => void;
  updateComponentState: (id: string, newState: object) => void;
  applySimulationUpdates: (updates: SimulationUpdates) => void;
  selectComponent: (id: string | null) => void;
  selectConnection: (id: string | null) => void;
  updateComponentParameter: (componentId: string, paramKey: string, value: any) => void;
  applyComponentPreset: (componentId: string, parameters: Record<string, ComponentParameter>) => void;
  updateSimulationSetting: (key: keyof SimulationSettings['environment'], value: number) => void;
  deleteComponent: (id: string) => void;
  deleteConnection: (id: string) => void;
  setConnectionStartPoint: (startPoint: { componentId: string; ioId: string } | null) => void;
  addConnection: (endPoint: { componentId: string; ioId: string }) => void;
  updateConnectionVertices: (connectionId: string, vertices: Point[]) => void;
  setUnitSystem: (system: UnitSystem) => void;
  
  // UI Actions
  toggleLabels: () => void;
  setSimulationRunning: (status: boolean) => void;
  setZoom: (zoom: number) => void;
  
  // PLC Actions
  setPlcStatus: (status: boolean, tags: PlcTag[]) => void;
  addPlcMapping: (mapping: PlcMapping) => void;
  removePlcMapping: (componentId: string, paramKey: string) => void;
  addPlcInputMapping: (mapping: PlcInputMapping) => void;
  removePlcInputMapping: (componentId: string, stateKey: string) => void;
  updatePlcInputs: (inputs: Record<string, any>) => void;
  setPlcSendMessage: (fn: (message: object) => void) => void;

  
  // Ladder Logic Actions
  addLadderRung: (rung: Omit<LadderRung, 'id'>) => void;
  updateLadderRung: (rungId: string, updates: Partial<{ conditions: LogicCondition[], output: LogicOutput }>) => void;
  deleteLadderRung: (rungId: string) => void;
}

export const useCircuitStore = create<CircuitState>((set, get) => ({
  circuit: null,
  selectedComponentId: null,
  selectedConnectionId: null,
  connectionStartPoint: null,

  // UI State
  showLabels: true,
  isSimulationRunning: false,
  zoom: 1,
  
  // PLC State
  plcConnected: false,
  plcTags: [],
  plcMappings: [],
  plcInputMappings: [],
  plcInputValues: {},
  plcSendMessage: () => {},
  
  loadCircuit: (circuit) => set({ circuit, selectedComponentId: null, selectedConnectionId: null }),

  addComponent: (component) =>
    set((state) => {
      if (!state.circuit) return state;
      return {
        circuit: {
          ...state.circuit,
          components: [...state.circuit.components, component],
        },
      };
    }),

  updateComponentPosition: (id, x, y) =>
    set((state) => {
      if (!state.circuit) return state;
      return {
        circuit: {
          ...state.circuit,
          components: state.circuit.components.map((c) =>
            c.id === id ? { ...c, position: { x, y } } : c
          ),
        },
      };
    }),

  updateComponentRotation: (id, rotation) =>
    set((state) => {
        if (!state.circuit) return state;
        return {
            circuit: {
                ...state.circuit,
                components: state.circuit.components.map((c) =>
                    c.id === id ? { ...c, rotation } : c
                ),
            },
        };
    }),

  updateComponentState: (id, newState) =>
    set(produce((draft: CircuitState) => {
      if (!draft.circuit) return;
      const component = draft.circuit.components.find(c => c.id === id);
      if (component) {
        Object.assign(component.state, newState);
      }
    })),

  applySimulationUpdates: ({ componentUpdates, connectionUpdates }) => 
    set(produce((draft: CircuitState) => {
        if (!draft.circuit) return;
        if (componentUpdates) {
            for (const id in componentUpdates) {
                const component = draft.circuit.components.find(c => c.id === id);
                if (component) {
                    Object.assign(component.state, componentUpdates[id]);
                }
            }
        }
        if (connectionUpdates) {
             for (const id in connectionUpdates) {
                const connection = draft.circuit.connections.find(c => c.id === id);
                if (connection) {
                    if (!connection.state) connection.state = {};
                    Object.assign(connection.state, connectionUpdates[id]);
                }
            }
        }
    })),

  selectComponent: (id) => set({ selectedComponentId: id, selectedConnectionId: null }),
  
  selectConnection: (id) => set({ selectedConnectionId: id, selectedComponentId: null }),

  updateComponentParameter: (componentId, paramKey, value) => 
    set((state) => {
        if (!state.circuit) return state;
        const newComponents = state.circuit.components.map(c => {
            if (c.id === componentId) {
                return {
                    ...c,
                    parameters: {
                        ...c.parameters,
                        [paramKey]: {
                            ...c.parameters[paramKey],
                            value: value
                        }
                    }
                };
            }
            return c;
        });
        return {
            circuit: {
                ...state.circuit,
                components: newComponents
            }
        };
    }),

  applyComponentPreset: (componentId, parameters) =>
    set(produce((draft: CircuitState) => {
      if (!draft.circuit) return;
      const component = draft.circuit.components.find(c => c.id === componentId);
      if (component) {
        component.parameters = parameters;
      }
    })),
    
  updateSimulationSetting: (key, value) =>
    set(produce((draft: CircuitState) => {
      if (!draft.circuit) return;
      (draft.circuit.simulationSettings.environment as any)[key] = value;
    })),
  
  deleteComponent: (id) =>
    set((state) => {
      if (!state.circuit) return state;
      return {
        circuit: {
          ...state.circuit,
          components: state.circuit.components.filter((c) => c.id !== id),
          connections: state.circuit.connections.filter(
            (conn) => conn.from.componentId !== id && conn.to.componentId !== id
          ),
           // Also remove any ladder logic associated with the deleted component
          ladderLogic: state.circuit.ladderLogic.filter(rung => 
            rung.output.componentId !== id && !rung.conditions.some(c => c.componentId === id)
          ),
        },
        selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
        plcMappings: state.plcMappings.filter(m => m.componentId !== id),
      };
    }),
    
  deleteConnection: (id) =>
    set((state) => {
      if (!state.circuit) return state;
      return {
        circuit: {
          ...state.circuit,
          connections: state.circuit.connections.filter((c) => c.id !== id),
        },
        selectedConnectionId: state.selectedConnectionId === id ? null : state.selectedConnectionId,
      };
    }),

  setConnectionStartPoint: (startPoint) => set({ connectionStartPoint: startPoint }),

  addConnection: (endPoint) => {
    const { circuit, connectionStartPoint } = get();
    if (!circuit || !connectionStartPoint) return;

    // TODO: Derive mediaType from the component/port type
    const mediaType = 'hydraulic';

    const newConnection: Connection = {
      id: `conn_${Date.now()}`,
      from: connectionStartPoint,
      to: endPoint,
      mediaType: mediaType,
      vertices: [],
    };

    set({
      circuit: {
        ...circuit,
        connections: [...circuit.connections, newConnection],
      },
      connectionStartPoint: null, // Reset after creating connection
    });
  },

  updateConnectionVertices: (connectionId, vertices) =>
    set(produce((draft: CircuitState) => {
      if (!draft.circuit) return;
      const connection = draft.circuit.connections.find(c => c.id === connectionId);
      if (connection) {
        connection.vertices = vertices;
      }
    })),

  setUnitSystem: (system) => 
    set(produce((draft: CircuitState) => {
        if (!draft.circuit) return;
        draft.circuit.unitSystem = system;
    })),
  
  // UI Actions
  toggleLabels: () => set(state => ({ showLabels: !state.showLabels })),
  setSimulationRunning: (status) => set({ isSimulationRunning: status }),
  setZoom: (zoom) => set({ zoom }),
  
  // PLC Actions
  setPlcStatus: (status, tags) => set({ plcConnected: status, plcTags: status ? tags : [], plcMappings: status ? get().plcMappings : [] }),
  
  addPlcMapping: (mapping) => set(state => ({
      plcMappings: [...state.plcMappings.filter(m => !(m.componentId === mapping.componentId && m.paramKey === mapping.paramKey)), mapping]
  })),
  
  removePlcMapping: (componentId, paramKey) => set(state => ({
      plcMappings: state.plcMappings.filter(m => !(m.componentId === componentId && m.paramKey === paramKey))
  })),

  addPlcInputMapping: (mapping) => set(state => ({
    plcInputMappings: [...state.plcInputMappings.filter(m => !(m.componentId === mapping.componentId && m.stateKey === mapping.stateKey)), mapping]
  })),

  removePlcInputMapping: (componentId, stateKey) => set(state => ({
      plcInputMappings: state.plcInputMappings.filter(m => !(m.componentId === componentId && m.stateKey === stateKey))
  })),

  updatePlcInputs: (inputs) => set(state => {
      const newInputs = { ...state.plcInputValues, ...inputs };
      // Pass PLC input updates to the simulation worker
      const worker = (get() as any).workerRef?.current;
      if (worker) {
        worker.postMessage({ type: 'update-plc-inputs', payload: newInputs });
      }
      return { plcInputValues: newInputs };
  }),

  setPlcSendMessage: (fn) => set({ plcSendMessage: fn }),
  
  // Ladder Logic Actions
  addLadderRung: (rung) => set(produce((draft: CircuitState) => {
      if (!draft.circuit) return;
      const newRung: LadderRung = { ...rung, id: `rung_${Date.now()}` };
      draft.circuit.ladderLogic.push(newRung);
  })),
  
  updateLadderRung: (rungId, updates) => set(produce((draft: CircuitState) => {
      if (!draft.circuit) return;
      const rung = draft.circuit.ladderLogic.find(r => r.id === rungId);
      if (rung) {
          if (updates.conditions) rung.conditions = updates.conditions;
          if (updates.output) rung.output = updates.output;
      }
  })),
  
  deleteLadderRung: (rungId) => set(produce((draft: CircuitState) => {
      if (!draft.circuit) return;
      draft.circuit.ladderLogic = draft.circuit.ladderLogic.filter(r => r.id !== rungId);
  })),
}));