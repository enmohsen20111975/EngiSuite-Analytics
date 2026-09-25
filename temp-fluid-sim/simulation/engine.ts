
import { Circuit, ComponentType, CircuitComponent, PlcInputMapping, LadderRung } from '../types';

type SimulationUpdateCallback = (updates: {
    componentUpdates: Record<string, object> | null, 
    connectionUpdates: Record<string, object> | null
}) => void;

type PlcUpdateCallback = (update: { tagId: string, value: any }) => void;

export class SimulationEngine {
  private circuit: Circuit;
  private plcInputMappings: PlcInputMapping[];
  private lastMappedStates: Record<string, any>;
  private intervalId: number | null = null;
  private onUpdate: SimulationUpdateCallback;
  private onPlcUpdate: PlcUpdateCallback;

  // Maps for efficient lookups
  private componentMap: Map<string, CircuitComponent>;
  private nodeMap: Map<string, { component: CircuitComponent, port: any }>;
  private connectionsByNode: Map<string, any[]>;

  constructor(circuit: Circuit, plcInputMappings: PlcInputMapping[]) {
    this.circuit = JSON.parse(JSON.stringify(circuit));
    this.plcInputMappings = plcInputMappings || [];
    this.lastMappedStates = {};
    
    // Pre-build maps for efficient lookups
    this.componentMap = new Map();
    this.nodeMap = new Map();
    this.circuit.components.forEach(c => {
        this.componentMap.set(c.id, c);
        c.state = c.state || {};
        c.io.forEach(port => {
            this.nodeMap.set(`${c.id}#${port.id}`, { component: c, port });
        });
    });
    this.connectionsByNode = new Map();
    this.circuit.connections.forEach(conn => {
        const startNodeId = `${conn.from.componentId}#${conn.from.ioId}`;
        const endNodeId = `${conn.to.componentId}#${conn.to.ioId}`;
        if (!this.connectionsByNode.has(startNodeId)) this.connectionsByNode.set(startNodeId, []);
        if (!this.connectionsByNode.has(endNodeId)) this.connectionsByNode.set(endNodeId, []);
        this.connectionsByNode.get(startNodeId).push(conn);
        this.connectionsByNode.get(endNodeId).push(conn);
    });
  }
  
  updateComponentState(id: string, state: object) {
    const component = this.componentMap.get(id);
    if (component) {
        Object.assign(component.state, state);
    }
  }

  start(onUpdate: SimulationUpdateCallback, onPlcUpdate: PlcUpdateCallback) {
    this.onUpdate = onUpdate;
    this.onPlcUpdate = onPlcUpdate;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = self.setInterval(
      () => this.step(),
      this.circuit.simulationSettings.timestep
    );
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  step() {
    const componentUpdates: Record<string, object> = {};
    const connectionUpdates: Record<string, object> = {};
    
    this.evaluateLadderLogic(componentUpdates);
    this.simulateElectricalCircuit(componentUpdates);
    this.checkPlcInputMappings();
    this.simulateFlow(componentUpdates, connectionUpdates);
    this.simulateFluidPower(componentUpdates);

    if (Object.keys(componentUpdates).length > 0 || Object.keys(connectionUpdates).length > 0) {
      // Apply updates to internal state for next tick
      Object.entries(componentUpdates).forEach(([id, newState]) => {
          const component = this.componentMap.get(id);
          if (component) Object.assign(component.state, newState);
      });
      Object.entries(connectionUpdates).forEach(([id, newState]) => {
          const conn = this.circuit.connections.find(c => c.id === id);
          if (conn) {
              if (!conn.state) conn.state = {};
              Object.assign(conn.state, newState);
          }
      });
      this.onUpdate({ componentUpdates, connectionUpdates });
    }
  }

  checkPlcInputMappings() {
      if (!this.plcInputMappings || this.plcInputMappings.length === 0) return;

      this.plcInputMappings.forEach(mapping => {
          const component = this.componentMap.get(mapping.componentId);
          if (!component) return;

          const currentState = component.state[mapping.stateKey];
          const cacheKey = `${mapping.componentId}.${mapping.stateKey}`;
          const lastState = this.lastMappedStates[cacheKey];
          
          if (currentState !== undefined && currentState !== lastState) {
              this.onPlcUpdate({
                  tagId: mapping.tagId,
                  value: currentState
              });
              this.lastMappedStates[cacheKey] = currentState;
          }
      });
  }
  
  evaluateLadderLogic(updates: Record<string, object>) {
      const coilStates: Record<string, boolean> = {};
      this.circuit.components.forEach(c => {
        if(c.type === ComponentType.RelayCoil) {
          coilStates[c.id] = false;
        }
      });

      this.circuit.ladderLogic.forEach(rung => {
          const rungIsTrue = rung.conditions.every(cond => {
              const comp = this.componentMap.get(cond.componentId);
              if (!comp) return false;
              
              let isClosed = false;
              if (comp.type === ComponentType.PushButton) isClosed = comp.state.isPressed;
              else if (comp.type === ComponentType.ContactNO) {
                  const parentCoil = this.circuit.components.find(c => c.parameters.tag?.value === comp.parameters.tag?.value && c.type === ComponentType.RelayCoil);
                  isClosed = parentCoil?.state.isEnergized ?? false;
              }
              return (cond.type === 'NO' && isClosed) || (cond.type === 'NC' && !isClosed);
          });
          if (rungIsTrue) {
            coilStates[rung.output.componentId] = true;
          }
      });
      
      this.circuit.components.forEach(c => {
          if (c.type === ComponentType.RelayCoil && c.state.isEnergized !== coilStates[c.id]) {
              updates[c.id] = { isEnergized: coilStates[c.id] };
          }
      });
  }
  
  simulateElectricalCircuit(updates: Record<string, object>) {
      this.circuit.components.forEach(c => {
          if (c.type === ComponentType.ContactNO) {
              const parentCoil = this.circuit.components.find(p => p.type === ComponentType.RelayCoil && p.parameters.tag?.value === c.parameters.tag?.value);
              const isClosed = parentCoil?.state.isEnergized ?? false;
              if (c.state.isClosed !== isClosed) updates[c.id] = { ...updates[c.id], isClosed };
          }
      });
  
      const dcv = this.circuit.components.find(c => c.type === ComponentType.DirectionalControlValve);
      if (dcv) {
          const contact = this.componentMap.get('contact-1');
          const isSolenoidPowered = contact?.state.isClosed ?? false;
          if (dcv.state.solenoidA_isPowered !== isSolenoidPowered) {
              updates[dcv.id] = { ...updates[dcv.id], solenoidA_isPowered: isSolenoidPowered };
          }
      }
  }

  simulateFlow(componentUpdates: Record<string, object>, connectionUpdates: Record<string, object>) {
      this.circuit.connections.forEach(c => connectionUpdates[c.id] = { flowRate: 0 });
      this.circuit.components.forEach(c => {
          if (c.type === ComponentType.HydraulicPump) componentUpdates[c.id] = { ...componentUpdates[c.id], isActive: false };
      });

      const pump = this.circuit.components.find(c => c.type === ComponentType.HydraulicPump);
      if (!pump) return;

      componentUpdates[pump.id] = { ...componentUpdates[pump.id], isActive: true };
      const flowRate = (parseFloat(pump.parameters.displacement.value as string) * parseFloat(pump.parameters.speed.value as string)) / 1000;

      let queue = new Set([`${pump.id}#out`]);
      let visitedNodes = new Set(queue);

      while (queue.size > 0) {
          const nextQueue = new Set<string>();
          for (const nodeId of queue) {
              const connections = this.connectionsByNode.get(nodeId) || [];
              for (const conn of connections) {
                  connectionUpdates[conn.id] = { ...connectionUpdates[conn.id], flowRate };
                  
                  const currentNodeInfo = this.nodeMap.get(nodeId);
                  const isFromNode = conn.from.componentId === currentNodeInfo.component.id && conn.from.ioId === currentNodeInfo.port.id;
                  const nextCompId = isFromNode ? conn.to.componentId : conn.from.componentId;
                  const nextIoId = isFromNode ? conn.to.ioId : conn.from.ioId;
                  const nextNodeId = `${nextCompId}#${nextIoId}`;

                  if (visitedNodes.has(nextNodeId)) continue;
                  
                  const nextComp = this.componentMap.get(nextCompId);
                  if (!nextComp || nextComp.type === ComponentType.Reservoir) continue;
                  
                  visitedNodes.add(nextNodeId);

                  if (nextComp.type === ComponentType.DirectionalControlValve) {
                      const dcv = nextComp;
                      const spoolType = dcv.parameters.spoolType.value;
                      let flowPaths: string[] = [];
                      if (dcv.state.solenoidA_isPowered) {
                          if (nextIoId === 'p') flowPaths.push('a');
                          if (nextIoId === 'b') flowPaths.push('t');
                      } else if (dcv.state.solenoidB_isPowered) {
                          if (nextIoId === 'p') flowPaths.push('b');
                          if (nextIoId === 'a') flowPaths.push('t');
                      } else {
                           if (spoolType === 'Tandem Center' && nextIoId === 'p') flowPaths.push('t');
                      }
                      flowPaths.forEach(p => nextQueue.add(`${dcv.id}#${p}`));
                  } else {
                       nextQueue.add(nextNodeId);
                  }
              }
          }
          queue = nextQueue;
      }
  }
  
  simulateFluidPower(updates: Record<string, object>) {
      const dt = this.circuit.simulationSettings.timestep / 1000;
      this.circuit.components.forEach(c => {
        if (c.type === ComponentType.DoubleActingCylinder) {
          const dcv = this.circuit.components.find(d => d.type === ComponentType.DirectionalControlValve);
          const isExtending = dcv?.state.solenoidA_isPowered ?? false;
          const isRetracting = dcv?.state.solenoidB_isPowered ?? false;

          const newState = this.simulateCylinder(c, dt, isExtending, isRetracting);
          if (newState) updates[c.id] = { ...updates[c.id], ...newState };
        }
      });
  }

  private simulateCylinder(c: CircuitComponent, dt: number, isExtending: boolean, isRetracting: boolean) {
    const stroke = parseFloat(c.parameters.stroke.value as string) / 1000;
    const { fluidViscosity } = this.circuit.simulationSettings.environment;
    let drivingForce = 0;
    const { position: currentPosition = 0, velocity: currentVelocity = 0 } = c.state;
    const dampingFactor = 5 + (fluidViscosity / 10);

    if (isExtending && !isRetracting) drivingForce = 1;
    else if (!isExtending && isRetracting) drivingForce = -1;
    
    const acceleration = drivingForce - (currentVelocity * dampingFactor);
    let newVelocity = currentVelocity + acceleration * dt;
    let newPosition = currentPosition + (newVelocity * dt) / stroke;

    if (newPosition < 0) { newPosition = 0; newVelocity = 0; }
    if (newPosition > 1) { newPosition = 1; newVelocity = 0; }
    
    if (Math.abs(newPosition - currentPosition) > 1e-6 || Math.abs(newVelocity - currentVelocity) > 1e-6) {
        return { position: newPosition, velocity: newVelocity };
    }
    return null;
  }
}
