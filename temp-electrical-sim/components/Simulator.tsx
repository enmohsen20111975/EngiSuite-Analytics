import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Toolbox } from './Toolbox';
import { PropertiesPanel } from './PropertiesPanel';
import { ComponentInstance, Wire, ComponentType, PLCState, ComponentDatabase, WireMaterial, LadderRung, LadderElement } from '../types';
import { createComponent, createLogicGateTerminals } from '../utils/componentFactory';
import { ComponentRenderer } from './ComponentRenderer';
import { PLCPanel } from './PLCPanel';
import { AnalysisPanel } from './AnalysisPanel';
import { dolStarterDemo } from '../demos/dolStarter';
import { Tooltip } from './Tooltip';
import { motors as rawMotors } from '../Data/motors';
import { circuitBreakers as rawCircuitBreakers } from '../Data/circuit_breakers';
import { ZoomInIcon, ZoomOutIcon, RefreshIcon, UndoIcon, RedoIcon, BookOpenIcon, SplitScreenIcon, ArrowLeftIcon } from './ActionIcons';
import { getTerminalPosition, isPointOnSegment } from '../utils/geometry';
import { findOrthogonalPath } from '../utils/pathfinding';
import { solveDCCircuit } from '../utils/simulationSolver';

// Custom hook to get the previous value of a prop or state
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const mapBreaker = (cb: any) => ({
    ...cb,
    ratedVoltage: cb.rated_voltage_v,
    ratedCurrent: cb.rated_current_a,
});

const motors = rawMotors.map(m => ({
    ...m,
    ratedVoltage: m.rated_voltage_v,
    ratedCurrent: m.rated_current_a,
    powerKW: m.rated_power_kw,
    powerFactor: m.power_factor_pf,
    efficiency: m.efficiency_percent,
}));

const COMPONENT_DB: ComponentDatabase = {
  contactor: [
    { brand: "Siemens", model: "3RT2015-1BB41", coilVoltage: "24V DC", ratedCurrent: 7, powerKW: 3 },
    { brand: "Schneider", model: "LC1D09BD", coilVoltage: "24V DC", ratedCurrent: 9, powerKW: 4 }
  ],
  motor: motors,
  mcb: rawCircuitBreakers.filter(cb => cb.type === 'MCB').map(mapBreaker),
  mccb: rawCircuitBreakers.filter(cb => cb.type === 'MCCB').map(mapBreaker),
  acb: rawCircuitBreakers.filter(cb => cb.type === 'ACB').map(mapBreaker),
  motorProtector: rawCircuitBreakers.filter(cb => cb.type === 'Motor Protector').map(mapBreaker),
  rcbo: rawCircuitBreakers.filter(cb => cb.type === 'RCBO').map(mapBreaker),
};

const GRID_SIZE = 20;
const MOTOR_STARTUP_DURATION_MS = 2000;
const SIM_INTERVAL = 50; // ms - faster simulation for more accurate trip curves
const BOUNCE_DURATION = 100; // ms (2 simulation ticks)

type SimulationEvent = { timestamp: number; message: string };

interface SimulatorProps {
    onBack: () => void;
}

export const Simulator: React.FC<SimulatorProps> = ({ onBack }) => {
  const [components, setComponents] = useState<ComponentInstance[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [ladderRungs, setLadderRungs] = useState<LadderRung[]>([]);
  const [rungStates, setRungStates] = useState<Map<string, boolean>>(new Map());
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([]);
  const [selectedWireIds, setSelectedWireIds] = useState<string[]>([]);
  const [wiringStart, setWiringStart] = useState<{ componentId: string; terminalId: string } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }); // Used for single view
  const [powerMousePosition, setPowerMousePosition] = useState({ x: 0, y: 0 });
  const [controlMousePosition, setControlMousePosition] = useState({ x: 0, y: 0 });
  const [isSimulating, setIsSimulating] = useState(false);
  const [isFaultsEnabled, setIsFaultsEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<'properties' | 'plc' | 'analysis'>('properties');
  const [activeDiagram, setActiveDiagram] = useState<'power' | 'control'>('power');
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [plcState, setPlcState] = useState<PLCState>({ I: Array(8).fill(false), Q: Array(8).fill(false), M: Array(8).fill(false) });
  const [plcCode, setPlcCode] = useState('// PLC Logic (runs every cycle)\n// Example: Q[0] = I[0];\n');
  const [componentDb] = useState<ComponentDatabase>(COMPONENT_DB);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [hoveredWireId, setHoveredWireId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [theme, setTheme] = useState(() => localStorage.getItem('circuitTheme') || 'dark');
  const initialPushButtonState = useRef(new Map<string, boolean>());
  const [terminalVoltages, setTerminalVoltages] = useState<Map<string, number>>(new Map());

  // Split View State
  const [isSplitView, setIsSplitView] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50); // percentage
  const [highlightedLinkId, setHighlightedLinkId] = useState<string | null>(null);

  // View states for pan & zoom
  const [powerView, setPowerView] = useState({ x: 0, y: 0, zoom: 1 });
  const [controlView, setControlView] = useState({ x: 0, y: 0, zoom: 1 });

  const workspaceContainerRef = useRef<HTMLDivElement>(null);
  const simulationIntervalRef = useRef<number | null>(null);
  const overloadTimers = useRef<Record<string, number>>({});
  const magneticTripTimers = useRef<Record<string, number>>({});

  const selectedComponent = components.find(c => c.id === selectedComponentIds[0]) || null;
  const selectedWire = wires.find(w => w.id === selectedWireIds[0]) || null;
  const prevComponents = usePrevious(components);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('circuitTheme', theme);
    }, [theme]);

    const getTerminalPositionCallback = useCallback((componentId: string, terminalId: string): {x: number, y: number} | null => getTerminalPosition(componentId, terminalId, components), [components]);

    useEffect(() => {
        if (isSimulating || !prevComponents || !components) return;
        const newOrMovedIds = new Set<string>();
        const prevCompsMap: Map<string, ComponentInstance> = new Map(prevComponents.map(c => [c.id, c]));
        components.forEach(comp => {
            const prevComp = prevCompsMap.get(comp.id);
            if (!prevComp || prevComp.x !== comp.x || prevComp.y !== comp.y || prevComp.rotation !== comp.rotation) {
                newOrMovedIds.add(comp.id);
            }
        });
        if (newOrMovedIds.size > 0) {
            setWires(currentWires => {
                const wiresToUpdate = currentWires.filter(w => newOrMovedIds.has(w.startComponentId) || newOrMovedIds.has(w.endComponentId));
                if (wiresToUpdate.length === 0) return currentWires;
                const updates = new Map<string, Partial<Wire>>();
                wiresToUpdate.forEach(wire => {
                    const startPos = getTerminalPosition(wire.startComponentId, wire.startTerminalId, components);
                    const endPos = getTerminalPosition(wire.endComponentId, wire.endTerminalId, components);
                    if (startPos && endPos) {
                        const otherWires = currentWires.filter(w => w.id !== wire.id);
                        const newPoints = findOrthogonalPath(startPos, endPos, components, otherWires, getTerminalPosition);
                        updates.set(wire.id, { points: newPoints });
                    }
                });
                if (updates.size === 0) return currentWires;
                return currentWires.map(wire => updates.has(wire.id) ? { ...wire, ...updates.get(wire.id)! } : wire);
            });
        }
    }, [components, isSimulating, prevComponents, getTerminalPosition]);

    const generateComponentTooltipContent = useCallback((component: ComponentInstance): React.ReactNode => {
        const props = component.properties;
        const details = [];
        if (isSimulating) {
            details.push(<p key="volt">Voltage: <span className="font-mono text-cyan-400">{props.liveVoltage?.toFixed(2) ?? '0.00'}V</span></p>)
            details.push(<p key="curr">Current: <span className="font-mono text-cyan-400">{props.liveCurrent?.toFixed(2) ?? '0.00'}A</span></p>)
            return <div className="space-y-1"><h4 className="font-bold text-base">{props.label || component.type}</h4>{details}</div>
        }
        if (props.brand || props.model) details.push(<p key="model"><strong>{props.model || 'N/A'}</strong> ({props.brand || 'N/A'})</p>);
        if(props.linkId) details.push(<p key="linkId" className="text-[var(--text-secondary)]">Link ID: <span className="font-mono text-yellow-400">{props.linkId}</span></p>);
        if(props.ioAddress) details.push(<p key="ioAddress" className="text-[var(--text-secondary)]">Address: <span className="font-mono text-yellow-400">{props.ioAddress}</span></p>);
        if(props.voltage) details.push(<p key="voltage" className="text-[var(--text-secondary)]">Voltage: <span className="font-mono text-yellow-400">{props.voltage}V</span></p>);
        if(props.ratedVoltage) details.push(<p key="ratedVoltage" className="text-[var(--text-secondary)]">Rated Voltage: <span className="font-mono text-yellow-400">{props.ratedVoltage}V</span></p>);
        if(props.ratedCurrent) details.push(<p key="ratedCurrent" className="text-[var(--text-secondary)]">Rated Current: <span className="font-mono text-yellow-400">{props.ratedCurrent}A</span></p>);
        if(props.powerKW) details.push(<p key="powerKW" className="text-[var(--text-secondary)]">Power: <span className="font-mono text-yellow-400">{props.powerKW}kW</span></p>);
        if(props.resistance) details.push(<p key="resistance" className="text-[var(--text-secondary)]">Resistance: <span className="font-mono text-yellow-400">{props.resistance}Ω</span></p>);
        
        return <div className="space-y-1"><h4 className="font-bold text-base border-b border-gray-500 pb-1 mb-2">{props.label || component.type}</h4>{details.length > 0 ? details : <p className="text-[var(--text-muted)]">No specific properties.</p>}</div>;
    }, [isSimulating]);

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  
  const handleUpdateComponent = (id: string, updates: Partial<ComponentInstance>) => {
    setComponents(prev =>
      prev.map(c => {
        if (c.id === id) {
          const newComp = { ...c, ...updates };
          
          if (
            updates.properties &&
            updates.properties.numInputs !== undefined &&
            updates.properties.numInputs !== c.properties.numInputs &&
            [ComponentType.AND, ComponentType.OR, ComponentType.NOT, ComponentType.NAND, ComponentType.NOR, ComponentType.XOR].includes(c.type)
          ) {
            const isNot = newComp.type === ComponentType.NOT;
            const numInputs = Math.max(isNot ? 1 : 2, Math.min(64, Math.floor(updates.properties.numInputs)));
            
            // Regenerate terminals if numInputs changes
            if (newComp.terminals.filter(t => t.isInput).length !== numInputs) {
                newComp.terminals = createLogicGateTerminals(numInputs);
            }
            
            // Ensure properties reflect the clamped value
            if(newComp.properties) newComp.properties.numInputs = numInputs;
          }
          return newComp;
        }
        return c;
      })
    );
};
  const handleUpdateWire = (id: string, updates: Partial<Wire>) => setWires(prev => prev.map(w => w.id === id ? {...w, ...updates} : w));
  const handleDeleteComponent = (id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id));
    setWires(prev => prev.filter(w => w.startComponentId !== id && w.endComponentId !== id));
    setSelectedComponentIds(prev => prev.filter(selectedId => selectedId !== id));
  }
  const handleDeleteWire = (id: string) => {
      setWires(prev => prev.filter(w => w.id !== id));
      setSelectedWireIds(prev => prev.filter(selectedId => selectedId !== id));
  }
  
  const addEvent = useCallback((message: string) => setEvents(prev => [{ timestamp: Date.now(), message }, ...prev].slice(0, 100)), []);
  
  const runSimulation = useCallback(() => {
    setComponents(prevComponents => {
      let updatedComponents: ComponentInstance[] = JSON.parse(JSON.stringify(prevComponents));
      let updatedWires: Wire[] = JSON.parse(JSON.stringify(wires));

      // 1. Update logic gates based on previous tick's voltages
      const logicGates = updatedComponents.filter(c => 
          [ComponentType.AND, ComponentType.OR, ComponentType.NOT, ComponentType.NAND, ComponentType.NOR, ComponentType.XOR].includes(c.type)
      );
      if (logicGates.length > 0) {
          const updatedGateStates = new Map<string, boolean>();
          logicGates.forEach(gate => {
              const inputTerminals = gate.terminals.filter(t => t.isInput);
              const inputValues = inputTerminals.map(t => (terminalVoltages.get(`${gate.id}-${t.id}`) || 0) > 12);
              let outputValue = false;
              switch (gate.type) {
                  case ComponentType.AND:
                      outputValue = inputValues.length > 0 ? inputValues.every(v => v) : false;
                      break;
                  case ComponentType.OR:
                      outputValue = inputValues.some(v => v);
                      break;
                  case ComponentType.NOT:
                      outputValue = inputValues.length > 0 ? !inputValues[0] : true;
                      break;
                  case ComponentType.NAND:
                      outputValue = inputValues.length > 0 ? !inputValues.every(v => v) : true;
                      break;
                  case ComponentType.NOR:
                      outputValue = !inputValues.some(v => v);
                      break;
                  case ComponentType.XOR:
                      outputValue = inputValues.filter(v => v).length % 2 === 1;
                      break;
              }
              updatedGateStates.set(gate.id, outputValue);
          });
          
          updatedComponents = updatedComponents.map(c => 
              updatedGateStates.has(c.id) ? { ...c, isEnergized: updatedGateStates.get(c.id)! } : c
          );
      }
      
      // 2. PLC Simulation
      const newPlcInputs = Array(plcState.I.length).fill(false);
      updatedComponents.forEach(c => {
        if (c.type === ComponentType.PLCInput && c.properties.ioAddress?.startsWith('I')) {
          const address = parseInt(c.properties.ioAddress.split('.')[0].substring(1), 10);
          if (!isNaN(address) && address < newPlcInputs.length) {
            newPlcInputs[address] = c.isEnergized || false;
          }
        }
      });
      
      const currentState = { I: newPlcInputs, Q: plcState.Q, M: plcState.M };
      const nextQ = Array(currentState.Q.length).fill(false);
      const nextM = Array(currentState.M.length).fill(false);
      const newRungStates = new Map<string, boolean>();

      const readBit = (address: string): boolean => {
          const type = address.charAt(0).toUpperCase();
          const index = parseInt(address.substring(1).split('.')[0], 10);
          if (isNaN(index)) return false;

          switch (type) {
              case 'I': return currentState.I[index] || false;
              case 'Q': return currentState.Q[index] || false; // Read previous state for latches
              case 'M': return currentState.M[index] || false;
              default: return false;
          }
      };

      const evaluateBranch = (branch: (LadderElement | LadderElement[])): boolean => {
          if (Array.isArray(branch)) {
              return branch.some(subBranch => evaluateBranch(subBranch));
          }
          const el = branch as LadderElement;
          if (el.type === 'Coil') return true;
          return el.type === 'NO' ? readBit(el.address) : !readBit(el.address);
      };

      ladderRungs.forEach(rung => {
          let powerFlow = true;
          for (const item of rung.network) {
              if ((item as LadderElement).type === 'Coil') {
                  if (powerFlow) {
                      const address = (item as LadderElement).address;
                      const type = address.charAt(0).toUpperCase();
                      const index = parseInt(address.substring(1).split('.')[0], 10);
                      if (type === 'Q') nextQ[index] = true;
                      else if (type === 'M') nextM[index] = true;
                  }
                  break; 
              }
              powerFlow = powerFlow && evaluateBranch(item);
              if (!powerFlow) break;
          }
          newRungStates.set(rung.id, powerFlow);

          // Visualization pass
          let visPower = true;
          const processItem = (item: LadderElement | LadderElement[]) => {
            if (Array.isArray(item)) {
              const branchStates = item.map(branchEl => {
                const el = branchEl as LadderElement;
                const passes = el.type === 'NO' ? readBit(el.address) : !readBit(el.address);
                newRungStates.set(el.id, visPower && passes);
                return passes;
              });
              if (!branchStates.some(s => s)) visPower = false;
            } else {
              if (item.type !== 'Coil') {
                const passes = item.type === 'NO' ? readBit(item.address) : !readBit(item.address);
                newRungStates.set(item.id, visPower && passes);
                if (!passes) visPower = false;
              } else {
                newRungStates.set(item.id, visPower);
              }
            }
          };
          rung.network.forEach(processItem);
      });

      setPlcState({ I: newPlcInputs, Q: nextQ, M: nextM });
      setRungStates(newRungStates);

      updatedComponents = updatedComponents.map(c => {
          if (c.type === ComponentType.PLCOutput && c.properties.ioAddress?.startsWith('Q')) {
              const address = parseInt(c.properties.ioAddress.split('.')[0].substring(1), 10);
              if (!isNaN(address) && address < nextQ.length) {
                  return { ...c, properties: { ...c.properties, on: nextQ[address] } };
              }
          }
          return c;
      });

      // 3. DC Circuit Solver
      const { updatedComponents: solvedComponents, updatedWires: solvedWires, terminalVoltages: newTerminalVoltages } = solveDCCircuit(updatedComponents, updatedWires);
      let finalComponents = solvedComponents;
      let finalWires = solvedWires;
      setTerminalVoltages(newTerminalVoltages);

      // 4. Update component states based on solver results
      finalComponents = finalComponents.map(comp => {
          if ([ComponentType.RelayCoil, ComponentType.ContactorCoil].includes(comp.type)) {
              return { ...comp, isEnergized: comp.isEnergized || false };
          }
          return comp;
      });

      // 5. Update linked components (contacts)
      const coilStates = new Map<string, boolean>();
      finalComponents.forEach(c => {
          if ([ComponentType.RelayCoil, ComponentType.ContactorCoil].includes(c.type)) {
              coilStates.set(c.properties.linkId!, c.isEnergized!);
          }
          if (c.type === ComponentType.PLCOutput) {
              coilStates.set(c.properties.ioAddress!, c.properties.on!);
          }
      });
      
      finalComponents = finalComponents.map(c => {
          if ([ComponentType.ContactNO, ComponentType.ContactNC, ComponentType.Contactor].includes(c.type)) {
              const isEnergized = coilStates.get(c.properties.linkId!) || false;
              const originalState = c.type === ComponentType.ContactNC;
              const newState = isEnergized ? !originalState : originalState;
              if (c.properties.on !== newState) {
                  return {...c, properties: {...c.properties, on: newState}, bouncingUntil: Date.now() + BOUNCE_DURATION};
              }
          }
          return c;
      });
      return finalComponents;
    });
  }, [wires, ladderRungs, addEvent, terminalVoltages, plcState.Q, plcState.M]);

  useEffect(() => {
    if (isSimulating) {
        simulationIntervalRef.current = window.setInterval(runSimulation, SIM_INTERVAL);
    } else if(simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        overloadTimers.current = {};
        magneticTripTimers.current = {};
        setComponents(prev => prev.map(c => {
            if (c.type === ComponentType.PushButton) {
                const originalState = initialPushButtonState.current.get(c.id);
                if (originalState !== undefined) return {...c, properties: {...c.properties, on: originalState}};
            }
             if ([ComponentType.Motor, ComponentType.DCMotor].includes(c.type)) return {...c, motorState: 'stopped', startupTimer: 0, isEnergized: false, properties: {...c.properties, liveCurrent: 0, livePower: 0, liveApparentPower: 0, liveReactivePower: 0}};
            const { bouncingUntil, ...rest } = c;
            return rest;
        }));
        initialPushButtonState.current.clear();
    }
    return () => { if(simulationIntervalRef.current) clearInterval(simulationIntervalRef.current); }
  }, [isSimulating, runSimulation]);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Delete' || e.key === 'Backspace') {
             if (selectedWireIds.length > 0) { setWires(prev => prev.filter(w => !selectedWireIds.includes(w.id))); setSelectedWireIds([]); }
             if (selectedComponentIds.length > 0) {
                const compIds = new Set(selectedComponentIds);
                setComponents(prev => prev.filter(c => !compIds.has(c.id)));
                setWires(prev => prev.filter(w => !compIds.has(w.startComponentId) && !compIds.has(w.endComponentId)));
                setSelectedComponentIds([]);
             }
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWireIds, selectedComponentIds]);

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startSplit = splitPosition;
    const containerWidth = workspaceContainerRef.current?.getBoundingClientRect().width || window.innerWidth;
    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const deltaPercentage = (dx / containerWidth) * 100;
      setSplitPosition(Math.max(20, Math.min(80, startSplit + deltaPercentage)));
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  
  const saveProject = () => { localStorage.setItem('circuitProject', JSON.stringify({ components, wires, plcCode, ladderRungs })); alert('Project saved!'); }
  const loadProject = () => {
    const savedData = localStorage.getItem('circuitProject');
    if(savedData){
        const { components, wires, plcCode, ladderRungs } = JSON.parse(savedData);
        setComponents(components || []); setWires(wires || []); setPlcCode(plcCode || ''); setLadderRungs(ladderRungs || []); alert('Project loaded!');
    } else alert('No saved project found.');
  }
  const loadDemo = (demo: 'dol') => { if(demo === 'dol'){ const { components, wires, plcCode, ladderRungs } = dolStarterDemo(); setComponents(components); setWires(wires); setPlcCode(plcCode); setLadderRungs(ladderRungs); } }

  const handleComponentDrag = (e: React.MouseEvent, componentId: string) => {
    if (e.button !== 0 || isSimulating) return;
    e.preventDefault();

    const selectedIds = new Set(selectedComponentIds.includes(componentId) ? selectedComponentIds : [componentId]);
    if (!selectedComponentIds.includes(componentId)) {
      setSelectedComponentIds([componentId]);
      setSelectedWireIds([]);
    }

    const viewState = isSplitView
      ? (components.find(c => c.id === componentId)?.diagram === 'power' ? powerView : controlView)
      : (activeDiagram === 'power' ? powerView : controlView);

    const startMouseX = e.clientX / viewState.zoom;
    const startMouseY = e.clientY / viewState.zoom;

    const initialPositions = new Map<string, { x: number; y: number }>();
    components.forEach(c => {
      if (selectedIds.has(c.id)) {
        initialPositions.set(c.id, { x: c.x, y: c.y });
      }
    });

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX / viewState.zoom - startMouseX;
      const dy = moveEvent.clientY / viewState.zoom - startMouseY;

      setComponents(currentComponents =>
        currentComponents.map(c => {
          if (selectedIds.has(c.id)) {
            const initialPos = initialPositions.get(c.id)!;
            const newX = initialPos.x + dx;
            const newY = initialPos.y + dy;
            return {
              ...c,
              x: Math.round(newX / GRID_SIZE) * GRID_SIZE,
              y: Math.round(newY / GRID_SIZE) * GRID_SIZE,
            };
          }
          return c;
        })
      );
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleTerminalClick = (componentId: string, terminalId: string) => {
    if (isSimulating) return;
    const clickedComponent = components.find(c => c.id === componentId);
    if (!clickedComponent) return;

    if (!wiringStart) {
      setWiringStart({ componentId, terminalId });
    } else {
      const startComponent = components.find(c => c.id === wiringStart.componentId);
      if (!startComponent) {
        setWiringStart(null);
        return;
      }
      if (wiringStart.componentId === componentId && wiringStart.terminalId === terminalId) {
        setWiringStart(null);
        return;
      }
      if (startComponent.diagram !== clickedComponent.diagram) {
        alert(`Cannot connect a '${startComponent.diagram}' component to a '${clickedComponent.diagram}' component.`);
        setWiringStart(null);
        return;
      }

      const startPos = getTerminalPosition(wiringStart.componentId, wiringStart.terminalId, components);
      const endPos = getTerminalPosition(componentId, terminalId, components);

      if (startPos && endPos) {
        const newPoints = findOrthogonalPath(startPos, endPos, components, wires, getTerminalPosition);
        const newWire: Wire = {
          id: `wire-${Date.now()}`,
          startComponentId: wiringStart.componentId,
          startTerminalId: wiringStart.terminalId,
          endComponentId: componentId,
          endTerminalId: terminalId,
          points: newPoints,
          diagram: startComponent.diagram,
          material: WireMaterial.Copper,
          size: startComponent.diagram === 'power' ? 2.5 : 1.5,
        };
        setWires(prev => [...prev, newWire]);
      }
      setWiringStart(null);
    }
  };

    const handleWireClick = (e: React.MouseEvent<SVGGElement>, clickedWire: Wire) => {
        e.stopPropagation();

        if (!wiringStart) {
            setSelectedWireIds([clickedWire.id]);
            setSelectedComponentIds([]);
            if (!isSimulating) setActiveTab('properties');
            return;
        }

        const diagram = clickedWire.diagram;
        const startComponent = components.find(c => c.id === wiringStart.componentId);
        if (!startComponent || startComponent.diagram !== diagram) {
            setWiringStart(null);
            return;
        }

        const view = isSplitView ? (diagram === 'power' ? powerView : controlView) : (activeDiagram === 'power' ? powerView : controlView);
        const svg = (e.currentTarget as SVGElement).ownerSVGElement;
        if (!svg) return;

        const workspaceRect = svg.getBoundingClientRect();
        const clickX = (e.clientX - workspaceRect.left - view.x) / view.zoom;
        const clickY = (e.clientY - workspaceRect.top - view.y) / view.zoom;
        const junctionX = Math.round(clickX / GRID_SIZE) * GRID_SIZE;
        const junctionY = Math.round(clickY / GRID_SIZE) * GRID_SIZE;

        const newJunction = createComponent(ComponentType.Junction, junctionX, junctionY, diagram);
        const tempComponents = [...components, newJunction];
        const tempWires = wires.filter(w => w.id !== clickedWire.id);

        const startPosPending = getTerminalPosition(wiringStart.componentId, wiringStart.terminalId, tempComponents);
        const endPosPending = { x: newJunction.x, y: newJunction.y };
        const points1 = findOrthogonalPath(startPosPending!, endPosPending, tempComponents, tempWires, getTerminalPosition);
        const wire1: Wire = {
            id: `wire-${Date.now()}-a`,
            startComponentId: wiringStart.componentId,
            startTerminalId: wiringStart.terminalId,
            endComponentId: newJunction.id,
            endTerminalId: 't1',
            points: points1,
            diagram: diagram,
            material: WireMaterial.Copper, size: diagram === 'power' ? 2.5 : 1.5,
        };

        const startPosSplit1 = getTerminalPosition(clickedWire.startComponentId, clickedWire.startTerminalId, tempComponents);
        const points2 = findOrthogonalPath(startPosSplit1!, endPosPending, tempComponents, tempWires, getTerminalPosition);
        const wire2: Wire = {
            ...clickedWire,
            id: `wire-${Date.now()}-b`,
            endComponentId: newJunction.id,
            endTerminalId: 't2',
            points: points2,
        };

        const endPosSplit2 = getTerminalPosition(clickedWire.endComponentId, clickedWire.endTerminalId, tempComponents);
        const points3 = findOrthogonalPath(endPosPending, endPosSplit2!, tempComponents, tempWires, getTerminalPosition);
        const wire3: Wire = {
            ...clickedWire,
            id: `wire-${Date.now()}-c`,
            startComponentId: newJunction.id,
            startTerminalId: 't3',
            endComponentId: clickedWire.endComponentId,
            endTerminalId: clickedWire.endTerminalId,
            points: points3,
        };

        setComponents(prev => [...prev, newJunction]);
        setWires(prev => [...prev.filter(w => w.id !== clickedWire.id), wire1, wire2, wire3]);
        setWiringStart(null);
        setHoveredWireId(null);
    };

  let tooltipContent: React.ReactNode = null;
  if (hoveredItemId) {
      const component = components.find(c => c.id === hoveredItemId);
      if (component) tooltipContent = generateComponentTooltipContent(component);
      else {
          const wire = wires.find(w => w.id === hoveredItemId);
          if (wire && isSimulating) {
              const displayVoltage = wire.diagram === 'control' ? (Math.max(terminalVoltages.get(`${wire.startComponentId}-${wire.startTerminalId}`) ?? 0, terminalVoltages.get(`${wire.endComponentId}-${wire.endTerminalId}`) ?? 0)) : (wire.liveVoltage ?? 0);
              tooltipContent = <div><p>Voltage: <span className="font-mono text-cyan-400">{displayVoltage.toFixed(2)}V</span></p><p>Current: <span className="font-mono text-cyan-400">{wire.liveCurrent?.toFixed(2) ?? '0.00'}A</span></p></div>;
          }
      }
  }

  const WorkspaceView: React.FC<{
    diagram: 'power' | 'control';
    view: { x: number; y: number; zoom: number };
    setView: React.Dispatch<React.SetStateAction<{ x: number; y: number; zoom: number }>>;
    setMousePos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
    mousePos: {x: number; y: number};
    containerRef: React.RefObject<HTMLDivElement>;
  }> = ({ diagram, view, setView, setMousePos, mousePos, containerRef }) => {
    const workspaceRef = useRef<SVGSVGElement>(null);
    const panStart = useRef({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);

    const visibleComponents = useMemo(() => components.filter(c => c.diagram === diagram), [components, diagram]);
    const visibleWires = useMemo(() => wires.filter(w => w.diagram === diagram), [wires, diagram]);
    
    const handleMouseDown = (e: React.MouseEvent) => {
      if (e.button === 1) {
          e.preventDefault();
          setIsPanning(true);
          panStart.current = { x: e.clientX - view.x, y: e.clientY - view.y };
          if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
      }
    };
    const handleMouseUp = (e: React.MouseEvent) => {
      if (e.button === 1) {
          setIsPanning(false);
          if (containerRef.current) containerRef.current.style.cursor = 'default';
      }
    };
    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            setView({ ...view, x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
            return;
        }
        if(workspaceRef.current){
            const rect = workspaceRef.current.getBoundingClientRect();
            setMousePos({ x: (e.clientX - rect.left - view.x) / view.zoom, y: (e.clientY - rect.top - view.y) / view.zoom });
        }
    };
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const { deltaY, clientX, clientY } = e;
        if (!workspaceRef.current) return;
        const rect = workspaceRef.current.getBoundingClientRect();
        const newZoom = Math.max(0.2, Math.min(3, view.zoom * (deltaY < 0 ? 1.1 : 1 / 1.1)));
        const mouseX = clientX - rect.left, mouseY = clientY - rect.top;
        const worldX = (mouseX - view.x) / view.zoom, worldY = (mouseY - view.y) / view.zoom;
        setView({ x: mouseX - worldX * newZoom, y: mouseY - worldY * newZoom, zoom: newZoom });
    };
    const zoomOnCenter = (factor: number) => {
        if (!workspaceRef.current) return;
        const rect = workspaceRef.current.getBoundingClientRect();
        const newZoom = Math.max(0.2, Math.min(3, view.zoom * factor));
        const centerX = rect.width / 2, centerY = rect.height / 2;
        const worldX = (centerX - view.x) / view.zoom, worldY = (centerY - view.y) / view.zoom;
        setView({ x: centerX - worldX * newZoom, y: centerY - worldY * newZoom, zoom: newZoom });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('componentType') as ComponentType;
        if (!workspaceRef.current) return;
        const rect = workspaceRef.current.getBoundingClientRect();
        const dropX = (e.clientX - rect.left - view.x) / view.zoom;
        const dropY = (e.clientY - rect.top - view.y) / view.zoom;
        const newComponent = createComponent(type, Math.round(dropX / GRID_SIZE) * GRID_SIZE, Math.round(dropY / GRID_SIZE) * GRID_SIZE);
        if (newComponent.diagram !== diagram && !isSplitView) setActiveDiagram(newComponent.diagram);
        if (newComponent.diagram === diagram) setComponents(prev => [...prev, newComponent]);
        else if (isSplitView) alert(`Cannot drop a ${newComponent.diagram} component on the ${diagram} diagram.`);
    };

    const handleComponentClick = (e: React.MouseEvent, component: ComponentInstance) => {
      e.stopPropagation();
      const interactiveTypes = [ComponentType.Switch, ComponentType.MCB, ComponentType.MCCB, ComponentType.ACB, ComponentType.MotorProtector, ComponentType.RCBO];
      if (interactiveTypes.includes(component.type)) {
          const newOnState = !component.properties.on;
          const updates: Partial<ComponentInstance> = { properties: { ...component.properties, on: newOnState }};
          if (newOnState && component.isTripped) updates.isTripped = false; 
          handleUpdateComponent(component.id, updates);
      }
      if (e.shiftKey) setSelectedComponentIds(prev => prev.includes(component.id) ? prev.filter(id => id !== component.id) : [...prev, component.id]);
      else setSelectedComponentIds([component.id]);
      setSelectedWireIds([]);
      setActiveTab(!isSimulating ? 'properties' : 'analysis');
    };
    
    return (
        <div className="w-full h-full" onMouseMove={handleMouseMove} onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
        <svg ref={workspaceRef} className="w-full h-full" onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => { setSelectedComponentIds([]); setWiringStart(null); setSelectedWireIds([]); }}>
            <defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="var(--grid-dot)" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <g transform={`translate(${view.x} ${view.y}) scale(${view.zoom})`}>
                {visibleWires.map(wire => {
                    const startPos = getTerminalPosition(wire.startComponentId, wire.startTerminalId, components);
                    const endPos = getTerminalPosition(wire.endComponentId, wire.endTerminalId, components);
                    if(!startPos || !endPos) return null;
                    const pointsStr = [startPos, ...(wire.points || []), endPos].map(p => `${p.x},${p.y}`).join(' ');
                    const isEnergized = isSimulating && wire.isEnergized;
                    const isSelected = selectedWireIds.includes(wire.id);
                    const isHoveredForJunction = wiringStart && hoveredWireId === wire.id;
                    return (
                        <g 
                            key={wire.id} 
                            className="cursor-pointer group" 
                            onClick={(e) => handleWireClick(e, wire)} 
                            onMouseEnter={(e) => { 
                                setHoveredItemId(wire.id); 
                                setTooltipPosition({ x: e.clientX, y: e.clientY });
                                if (wiringStart) setHoveredWireId(wire.id);
                            }} 
                            onMouseMove={(e) => setTooltipPosition({ x: e.clientX, y: e.clientY })} 
                            onMouseLeave={() => { 
                                setHoveredItemId(null);
                                setHoveredWireId(null);
                            }}
                        >
                            <polyline points={pointsStr} stroke="transparent" strokeWidth="10" fill="none" />
                            <polyline 
                                points={pointsStr} 
                                className={isEnergized ? 'wire-energized-animated' : ''}
                                stroke={isSelected || isHoveredForJunction ? 'var(--wire-selected)' : (isEnergized ? 'var(--wire-energized)' : 'var(--wire-idle)')} 
                                strokeWidth={isSelected || isHoveredForJunction ? 3 : 2} 
                                fill="none" 
                            />
                        </g>
                    );
                })}

                {wiringStart && (getTerminalPositionCallback(wiringStart.componentId, wiringStart.terminalId)?.x !== undefined) && <line x1={getTerminalPositionCallback(wiringStart.componentId, wiringStart.terminalId)!.x} y1={getTerminalPositionCallback(wiringStart.componentId, wiringStart.terminalId)!.y} x2={mousePos.x} y2={mousePos.y} stroke="var(--wire-pending)" strokeWidth="2" strokeDasharray="4" />}

                {visibleComponents.map(component => (
                  <g key={component.id} transform={`translate(${component.x}, ${component.y}) rotate(${component.rotation || 0})`}
                    onMouseDown={(e) => { e.stopPropagation(); if (component.type === ComponentType.PushButton) { const defaultState = component.properties.on || false; initialPushButtonState.current.set(component.id, defaultState); handleUpdateComponent(component.id, { properties: { ...component.properties, on: !defaultState }}); } handleComponentDrag(e, component.id); }}
                    onMouseUp={(e) => { if (component.type === ComponentType.PushButton) { const defaultState = initialPushButtonState.current.get(component.id); if (defaultState !== undefined) handleUpdateComponent(component.id, { properties: { ...component.properties, on: defaultState } }); } }}
                    onClick={(e) => handleComponentClick(e, component)}
                    onMouseEnter={(e) => { setHoveredItemId(component.id); setTooltipPosition({ x: e.clientX, y: e.clientY }); if (component.properties.linkId) setHighlightedLinkId(component.properties.linkId); }}
                    onMouseMove={(e) => setTooltipPosition({ x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => { setHoveredItemId(null); setHighlightedLinkId(null); }} className="cursor-pointer" >
                    <foreignObject x="-50" y="-40" width="100" height="80"><div className="w-full h-full flex items-center justify-center"><ComponentRenderer component={component} /></div></foreignObject>
                    {selectedComponentIds.includes(component.id) && <rect x="-55" y="-45" width="110" height="90" fill="none" stroke="var(--wire-selected)" strokeWidth={2 / view.zoom} rx="5" />}
                    {highlightedLinkId && component.properties.linkId === highlightedLinkId && !selectedComponentIds.includes(component.id) && <rect x="-55" y="-45" width="110" height="90" fill="none" stroke="cyan" strokeOpacity="0.8" strokeWidth={3 / view.zoom} rx="5" pointerEvents="none" />}
                    {component.terminals.map(terminal => <circle key={terminal.id} cx={terminal.x} cy={terminal.y} r="5" fill={isSimulating && component.isEnergized ? 'var(--wire-energized)' : 'var(--icon-fill-idle)'} stroke="var(--bg-primary)" strokeWidth="2" onMouseDown={(e) => e.stopPropagation()} onMouseUp={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); handleTerminalClick(component.id, terminal.id); }} className="hover:fill-yellow-400" />)}
                  </g>
                ))}
            </g>
          </svg>
          <div className="absolute bottom-4 right-4 flex items-center bg-[var(--bg-secondary)] p-1 rounded-md shadow-lg border border-[var(--border-primary)]">
            <button onClick={() => zoomOnCenter(1.2)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-interactive)] rounded"><ZoomInIcon/></button>
            <button onClick={() => setView({ x: 0, y: 0, zoom: 1 })} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-interactive)] rounded"><RefreshIcon/></button>
            <button onClick={() => zoomOnCenter(1 / 1.2)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-interactive)] rounded"><ZoomOutIcon/></button>
          </div>
        </div>
    );
  };
  
  return (
    <div className="flex h-screen w-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">
      <Tooltip visible={!!tooltipContent} x={tooltipPosition.x} y={tooltipPosition.y} content={tooltipContent} />
      <Toolbox onDragStart={(e, type) => e.dataTransfer.setData('componentType', type)} />
      <div className="flex-grow flex flex-col">
        <div className="bg-[var(--bg-secondary)] p-2 flex items-center justify-between border-b border-[var(--border-primary)]">
            <div className="flex items-center space-x-4">
                 <button title="Back to Home" onClick={onBack} className="p-2 rounded hover:bg-[var(--bg-interactive)]">
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-xl font-bold">Simulator</h1>
                 <button title="Split View" onClick={() => setIsSplitView(!isSplitView)} className={`p-2 rounded ${isSplitView ? 'bg-blue-600 text-white' : 'hover:bg-[var(--bg-interactive)]'}`}>
                    <SplitScreenIcon />
                </button>
            </div>
            <div className="flex items-center space-x-2">
                <button title="Learning Center" onClick={onBack} className="flex items-center space-x-2 px-4 py-2 font-semibold hover:bg-[var(--bg-interactive)] rounded text-blue-400 border border-blue-500/50">
                    <BookOpenIcon size={22}/> 
                    <span className="text-sm">Learning Center</span>
                </button>
                <button title="Undo (Ctrl+Z)" className="p-2 hover:bg-[var(--bg-interactive)] rounded"><UndoIcon/></button>
                <button title="Redo (Ctrl+Y)" className="p-2 hover:bg-[var(--bg-interactive)] rounded"><RedoIcon/></button>
                <select value={theme} onChange={e => setTheme(e.target.value)} className="bg-[var(--bg-tertiary)] hover:bg-[var(--bg-interactive)] rounded p-2 text-sm">
                    <option value="dark">Dark Theme</option>
                    <option value="light">Light Theme</option>
                    <option value="blueprint">Blueprint</option>
                    <option value="matrix">Matrix</option>
                    <option value="solarized-dark">Solarized Dark</option>
                    <option value="solarized-light">Solarized Light</option>
                    <option value="retro-terminal">Retro Terminal</option>
                    <option value="high-contrast">High Contrast</option>
                    <option value="cyberpunk">Cyberpunk</option>
                    <option value="dracula">Dracula</option>
                    <option value="nord">Nord</option>
                    <option value="monokai">Monokai</option>
                    <option value="paper">Paper</option>
                </select>
                <div className="flex items-center space-x-2 bg-[var(--bg-tertiary)] p-1 rounded-md">
                  <label htmlFor="fault-toggle" className="text-xs font-medium cursor-pointer select-none">Enable Faults</label>
                  <button role="switch" aria-checked={isFaultsEnabled} onClick={() => setIsFaultsEnabled(!isFaultsEnabled)} id="fault-toggle" className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isFaultsEnabled ? 'bg-yellow-500' : 'bg-gray-500'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isFaultsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <button onClick={() => loadDemo('dol')} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded">Demos</button>
                <button onClick={saveProject} className="px-3 py-1 bg-[var(--bg-interactive)] hover:bg-[var(--bg-tertiary)] rounded">Save</button>
                <button onClick={loadProject} className="px-3 py-1 bg-[var(--bg-interactive)] hover:bg-[var(--bg-tertiary)] rounded">Load</button>
                <button onClick={() => setIsSimulating(!isSimulating)} className={`px-4 py-2 rounded font-semibold transition-colors w-40 ${isSimulating ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>{isSimulating ? 'Stop Simulation' : 'Run Simulation'}</button>
            </div>
        </div>
        <div ref={workspaceContainerRef} className="flex-grow relative flex bg-[var(--bg-primary)]">
          {isSplitView ? (
            <>
              <div className="h-full" style={{ width: `${splitPosition}%` }}>
                <WorkspaceView diagram="power" view={powerView} setView={setPowerView} setMousePos={setPowerMousePosition} mousePos={powerMousePosition} containerRef={workspaceContainerRef} />
              </div>
              <div onMouseDown={handleResizeMouseDown} className="w-2 h-full cursor-col-resize bg-[var(--bg-tertiary)] hover:bg-[var(--text-accent)] transition-colors" style={{ flexShrink: 0 }} />
              <div className="h-full" style={{ width: `${100 - splitPosition}%` }}>
                 <WorkspaceView diagram="control" view={controlView} setView={setControlView} setMousePos={setControlMousePosition} mousePos={controlMousePosition} containerRef={workspaceContainerRef} />
              </div>
            </>
          ) : (
             <WorkspaceView diagram={activeDiagram} view={activeDiagram === 'power' ? powerView : controlView} setView={activeDiagram === 'power' ? setPowerView : setControlView} setMousePos={setMousePosition} mousePos={mousePosition} containerRef={workspaceContainerRef}/>
          )}
        </div>
      </div>
      <div className="w-80 bg-[var(--bg-secondary)] flex flex-col" style={{ flexShrink: 0 }}>
        <div className="flex border-b border-[var(--border-primary)]">
            <button onClick={() => setActiveTab('properties')} className={`flex-1 p-2 font-semibold ${activeTab === 'properties' ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-interactive)]'}`}>Properties</button>
            <button onClick={() => setActiveTab('analysis')} className={`flex-1 p-2 font-semibold ${activeTab === 'analysis' ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-interactive)]'}`}>Analysis</button>
            <button onClick={() => setActiveTab('plc')} className={`flex-1 p-2 font-semibold ${activeTab === 'plc' ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-interactive)]'}`}>PLC</button>
        </div>
        <div className="flex-grow overflow-y-auto">
            {activeTab === 'properties' && <PropertiesPanel selectedComponent={selectedComponent} selectedWire={selectedWire} componentDb={componentDb} onUpdateComponent={handleUpdateComponent} onUpdateWire={handleUpdateWire} onDeleteComponent={handleDeleteComponent} onDeleteWire={handleDeleteWire} />}
            {activeTab === 'analysis' && <AnalysisPanel selectedComponent={selectedComponent} events={events} />}
            {activeTab === 'plc' && <PLCPanel ladderRungs={ladderRungs} setLadderRungs={setLadderRungs} isSimulating={isSimulating} rungStates={rungStates}/>}
        </div>
      </div>
    </div>
  );
};