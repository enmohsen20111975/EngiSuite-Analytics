/**
 * SimulationEngine
 * Real-time hydraulic circuit simulation
 * 
 * Converted from: external/Hydraulic-Simulator_JS/modules/simulation/AdvancedSimulationEngine.js
 */

export class SimulationEngine {
  constructor(state, actions) {
    this.state = state;
    this.actions = actions;
    this.isRunning = false;
    this.animationFrame = null;
    this.lastTime = 0;
    this.time = 0;
    this.speed = 1;
    this.subscribers = [];
  }
  
  /**
   * Start the simulation
   */
  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.actions?.startSimulation?.();
    
    this.runLoop();
  }
  
  /**
   * Stop the simulation
   */
  async stop() {
    this.isRunning = false;
    this.actions?.stopSimulation?.();
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
  
  /**
   * Main simulation loop
   */
  runLoop() {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000 * this.speed;
    this.lastTime = currentTime;
    
    // Update simulation time
    this.time += deltaTime;
    this.actions?.updateSimulationTime?.(this.time);
    
    // Run simulation step
    this.step(deltaTime);
    
    // Notify subscribers
    this.subscribers.forEach(callback => callback(this.time, deltaTime));
    
    // Schedule next frame
    this.animationFrame = requestAnimationFrame(() => this.runLoop());
  }
  
  /**
   * Single simulation step
   */
  step(deltaTime) {
    // Get all components
    const components = this.state.components;
    const wires = this.state.wires;
    
    // Find sources (pumps, pressure sources)
    const sources = components.filter(c => 
      c.type === 'PUMP' || 
      c.type === 'VARIABLE_DISPLACEMENT_PUMP' ||
      c.type === 'PRESSURE_SOURCE'
    );
    
    // Calculate flows and pressures
    const results = this.calculateCircuit(components, wires, sources);
    
    // Update component states
    this.updateComponentStates(components, results, deltaTime);
    
    // Update wire states
    this.updateWireStates(wires, results);
    
    // Store results
    this.actions?.setSimulationResults?.(results);
  }
  
  /**
   * Calculate circuit pressures and flows
   */
  calculateCircuit(components, wires, sources) {
    const results = {
      pressures: {},
      flows: {},
      powers: {}
    };
    
    // Process each source
    sources.forEach(source => {
      const pressure = this.getSourcePressure(source);
      const flow = this.getSourceFlow(source);
      
      results.pressures[source.id] = pressure;
      results.flows[source.id] = flow;
      results.powers[source.id] = (pressure * flow) / 600; // Power in kW
      
      // Propagate through connected wires
      this.propagatePressure(source, pressure, flow, wires, components, results);
    });
    
    return results;
  }
  
  /**
   * Get source pressure
   */
  getSourcePressure(source) {
    if (source.type === 'PRESSURE_SOURCE') {
      return source.properties?.pressure?.value || 100;
    }
    
    // For pumps, calculate based on displacement and speed
    const displacement = source.properties?.displacement?.value || 10; // cm³/rev
    const speed = source.properties?.speed?.value || 1450; // rpm
    const efficiency = source.properties?.efficiency?.value || 0.9;
    
    // Simplified pressure calculation
    return source.state?.currentPressure || 150;
  }
  
  /**
   * Get source flow rate
   */
  getSourceFlow(source) {
    if (source.type === 'PRESSURE_SOURCE') {
      return 50; // Default flow
    }
    
    const displacement = source.properties?.displacement?.value || 10; // cm³/rev
    const speed = source.properties?.speed?.value || 1450; // rpm
    const efficiency = source.properties?.efficiency?.value || 0.9;
    
    // Flow = displacement × speed × efficiency
    return (displacement * speed * efficiency) / 1000; // L/min
  }
  
  /**
   * Propagate pressure through circuit
   */
  propagatePressure(source, pressure, flow, wires, components, results, visited = new Set()) {
    if (visited.has(source.id)) return;
    visited.add(source.id);
    
    // Find connected wires
    const connectedWires = wires.filter(w => 
      w.from.componentId === source.id || w.to.componentId === source.id
    );
    
    connectedWires.forEach(wire => {
      // Get connected component
      const targetId = wire.from.componentId === source.id 
        ? wire.to.componentId 
        : wire.from.componentId;
      
      const target = components.find(c => c.id === targetId);
      if (!target) return;
      
      // Calculate pressure drop
      const pressureDrop = this.calculatePressureDrop(target, flow);
      const targetPressure = pressure - pressureDrop;
      
      // Store results
      results.pressures[targetId] = Math.max(0, targetPressure);
      results.flows[targetId] = flow;
      results.powers[targetId] = (targetPressure * flow) / 600;
      
      // Continue propagation
      this.propagatePressure(target, targetPressure, flow, wires, components, results, visited);
    });
  }
  
  /**
   * Calculate pressure drop across component
   */
  calculatePressureDrop(component, flow) {
    // Simplified pressure drop calculation
    const baseDrop = 2; // bar base pressure drop
    
    switch (component.type) {
      case 'CHECK_VALVE':
        return component.state?.isOpen ? baseDrop : 999;
      case 'PRESSURE_RELIEF_VALVE':
        return component.state?.isOpen ? baseDrop : 0;
      case 'FLOW_CONTROL_VALVE':
        return baseDrop * 2;
      case 'FILTER':
        return baseDrop * (1 + (component.state?.clogging || 0) / 100);
      default:
        return baseDrop;
    }
  }
  
  /**
   * Update component states based on simulation
   */
  updateComponentStates(components, results, deltaTime) {
    components.forEach(comp => {
      const pressure = results.pressures[comp.id] || 0;
      const flow = results.flows[comp.id] || 0;
      
      switch (comp.type) {
        case 'PUMP':
        case 'VARIABLE_DISPLACEMENT_PUMP':
          this.actions?.updateComponent?.(comp.id, {
            state: {
              ...comp.state,
              currentPressure: pressure,
              currentFlow: flow,
              isRunning: true
            }
          });
          break;
          
        case 'CYLINDER_DOUBLE':
        case 'CYLINDER_SINGLE':
          // Update cylinder position based on flow
          const stroke = comp.properties?.stroke?.value || 200;
          const bore = comp.properties?.bore?.value || 50;
          const area = Math.PI * (bore / 2) ** 2 / 100; // cm²
          const velocity = (flow * 1000) / (area * 60); // mm/s
          const position = Math.min(100, Math.max(0, 
            (comp.state?.position || 0) + velocity * deltaTime / stroke * 100
          ));
          
          this.actions?.updateComponent?.(comp.id, {
            state: {
              ...comp.state,
              position,
              velocity,
              force: pressure * area * 10 // N
            }
          });
          break;
          
        case 'HYDRAULIC_MOTOR':
          const displacement = comp.properties?.displacement?.value || 50;
          const speed = (flow * 1000) / displacement; // rpm
          const torque = (pressure * displacement) / (2 * Math.PI * 10); // Nm
          
          this.actions?.updateComponent?.(comp.id, {
            state: {
              ...comp.state,
              speed,
              torque
            }
          });
          break;
          
        case 'PRESSURE_GAUGE':
          this.actions?.updateComponent?.(comp.id, {
            state: { ...comp.state, pressure }
          });
          break;
          
        case 'FLOW_METER':
          this.actions?.updateComponent?.(comp.id, {
            state: { 
              ...comp.state, 
              flow,
              totalVolume: (comp.state?.totalVolume || 0) + flow * deltaTime / 60
            }
          });
          break;
          
        case 'CHECK_VALVE':
          this.actions?.updateComponent?.(comp.id, {
            state: {
              ...comp.state,
              isOpen: flow > 0,
              currentFlow: flow
            }
          });
          break;
          
        case 'PRESSURE_RELIEF_VALVE':
          const setPressure = comp.properties?.setPressure?.value || 200;
          this.actions?.updateComponent?.(comp.id, {
            state: {
              ...comp.state,
              isOpen: pressure >= setPressure,
              currentPressure: pressure
            }
          });
          break;
      }
    });
  }
  
  /**
   * Update wire states
   */
  updateWireStates(wires, results) {
    wires.forEach(wire => {
      const fromPressure = results.pressures[wire.from.componentId] || 0;
      const toPressure = results.pressures[wire.to.componentId] || 0;
      const flow = results.flows[wire.from.componentId] || 0;
      
      this.actions?.updateWire?.(wire.id, {
        state: {
          pressure: (fromPressure + toPressure) / 2,
          flow
        }
      });
    });
  }
  
  /**
   * Subscribe to simulation updates
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Check if simulation is running
   */
  isRunning() {
    return this.isRunning;
  }
  
  /**
   * Get current simulation time
   */
  getTime() {
    return this.time;
  }
  
  /**
   * Set simulation speed
   */
  setSpeed(speed) {
    this.speed = Math.max(0.1, Math.min(10, speed));
  }
}

export default SimulationEngine;
