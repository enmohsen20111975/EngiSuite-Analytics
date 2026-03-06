/**
 * CircuitAnalyzer
 * Analyzes hydraulic circuits for correctness and performance
 * 
 * Converted from: external/Hydraulic-Simulator_JS/modules/features/CircuitAnalyzer.js
 */

import { HydraulicCalculations } from './HydraulicCalculations';

export class CircuitAnalyzer {
  constructor(state) {
    this.state = state;
  }
  
  /**
   * Run full circuit analysis
   */
  analyze() {
    const results = {
      isValid: true,
      errors: [],
      warnings: [],
      info: [],
      metrics: {
        componentCount: this.state.components.length,
        wireCount: this.state.wires.length,
        totalPower: 0,
        maxPressure: 0,
        totalFlow: 0,
        efficiency: 0
      }
    };
    
    // Basic validation
    this.validateCircuit(results);
    
    // Component analysis
    this.analyzeComponents(results);
    
    // Connection analysis
    this.analyzeConnections(results);
    
    // Performance analysis
    this.analyzePerformance(results);
    
    return results;
  }
  
  /**
   * Validate circuit structure
   */
  validateCircuit(results) {
    // Check for empty circuit
    if (this.state.components.length === 0) {
      results.warnings.push({
        type: 'empty',
        message: 'Circuit is empty. Add components to begin.'
      });
      return;
    }
    
    // Check for sources
    const sources = this.state.components.filter(c => 
      c.type === 'PUMP' || 
      c.type === 'VARIABLE_DISPLACEMENT_PUMP' ||
      c.type === 'PRESSURE_SOURCE'
    );
    
    if (sources.length === 0) {
      results.errors.push({
        type: 'no_source',
        message: 'No pressure source found. Add a pump or pressure source.'
      });
      results.isValid = false;
    }
    
    // Check for tanks
    const tanks = this.state.components.filter(c => c.type === 'TANK');
    if (sources.length > 0 && tanks.length === 0) {
      results.warnings.push({
        type: 'no_tank',
        message: 'No reservoir found. Consider adding a tank.'
      });
    }
    
    // Check for pressure relief
    const reliefValves = this.state.components.filter(c => 
      c.type === 'PRESSURE_RELIEF_VALVE'
    );
    
    if (sources.length > 0 && reliefValves.length === 0) {
      results.warnings.push({
        type: 'no_relief',
        message: 'No pressure relief valve found. System may be unsafe.'
      });
    }
  }
  
  /**
   * Analyze individual components
   */
  analyzeComponents(results) {
    this.state.components.forEach(comp => {
      // Check for unconnected terminals
      const connectedTerminals = this.getConnectedTerminals(comp.id);
      const totalTerminals = (comp.terminals || []).length;
      
      if (connectedTerminals.length < totalTerminals) {
        results.info.push({
          type: 'unconnected',
          component: comp.id,
          message: `${comp.name || comp.type} has ${totalTerminals - connectedTerminals.length} unconnected terminals`
        });
      }
      
      // Component-specific analysis
      switch (comp.type) {
        case 'PUMP':
        case 'VARIABLE_DISPLACEMENT_PUMP':
          this.analyzePump(comp, results);
          break;
          
        case 'CYLINDER_DOUBLE':
        case 'CYLINDER_SINGLE':
          this.analyzeCylinder(comp, results);
          break;
          
        case 'HYDRAULIC_MOTOR':
          this.analyzeMotor(comp, results);
          break;
          
        case 'FILTER':
          this.analyzeFilter(comp, results);
          break;
      }
    });
  }
  
  /**
   * Analyze pump component
   */
  analyzePump(pump, results) {
    const displacement = pump.properties?.displacement?.value || 10;
    const speed = pump.properties?.speed?.value || 1450;
    const efficiency = pump.properties?.efficiency?.value || 0.9;
    
    const flow = HydraulicCalculations.calculateFlowRate(displacement, speed, efficiency);
    const pressure = pump.state?.currentPressure || 150;
    const power = HydraulicCalculations.calculatePower(pressure, flow);
    
    results.metrics.totalFlow += flow;
    results.metrics.totalPower += power;
    results.metrics.maxPressure = Math.max(results.metrics.maxPressure, pressure);
    
    // Check for cavitation risk
    if (speed > 2500) {
      results.warnings.push({
        type: 'cavitation_risk',
        component: pump.id,
        message: 'High pump speed may cause cavitation'
      });
    }
  }
  
  /**
   * Analyze cylinder component
   */
  analyzeCylinder(cylinder, results) {
    const bore = cylinder.properties?.bore?.value || 50;
    const stroke = cylinder.properties?.stroke?.value || 200;
    const rodDiameter = cylinder.properties?.rodDiameter?.value || 25;
    
    const area = HydraulicCalculations.calculateCylinderArea(bore);
    const volume = area * stroke / 1000; // liters
    
    // Check stroke-to-bore ratio
    const ratio = stroke / bore;
    if (ratio > 10) {
      results.warnings.push({
        type: 'stroke_ratio',
        component: cylinder.id,
        message: 'Stroke-to-bore ratio is high. Consider checking buckling.'
      });
    }
  }
  
  /**
   * Analyze motor component
   */
  analyzeMotor(motor, results) {
    const displacement = motor.properties?.displacement?.value || 50;
    const maxSpeed = motor.properties?.maxSpeed?.value || 3000;
    
    // Check for overspeed risk
    if (motor.state?.speed > maxSpeed) {
      results.warnings.push({
        type: 'overspeed',
        component: motor.id,
        message: 'Motor speed exceeds maximum rating'
      });
    }
  }
  
  /**
   * Analyze filter component
   */
  analyzeFilter(filter, results) {
    const clogging = filter.state?.clogging || 0;
    
    if (clogging > 80) {
      results.warnings.push({
        type: 'filter_clogged',
        component: filter.id,
        message: 'Filter is heavily clogged. Consider replacement.'
      });
    }
  }
  
  /**
   * Analyze connections between components
   */
  analyzeConnections(results) {
    // Check for loops
    const loops = this.findLoops();
    if (loops.length > 0) {
      results.info.push({
        type: 'loops',
        message: `Found ${loops.length} closed loop(s) in circuit`
      });
    }
    
    // Check wire routing
    this.state.wires.forEach(wire => {
      if (!wire.route || wire.route.length < 2) {
        results.errors.push({
          type: 'invalid_wire',
          wire: wire.id,
          message: 'Wire has no valid route'
        });
      }
    });
  }
  
  /**
   * Analyze circuit performance
   */
  analyzePerformance(results) {
    // Calculate overall efficiency
    if (results.metrics.totalPower > 0) {
      results.metrics.efficiency = 0.85; // Placeholder
    }
    
    // Generate recommendations
    if (results.metrics.totalPower > 30) {
      results.info.push({
        type: 'cooling',
        message: 'Consider adding oil cooler for high-power system'
      });
    }
    
    if (results.metrics.totalFlow > 100) {
      results.info.push({
        type: 'tank_size',
        message: 'Ensure tank capacity is at least 3x pump flow rate'
      });
    }
  }
  
  /**
   * Get connected terminals for a component
   */
  getConnectedTerminals(componentId) {
    const connected = [];
    
    this.state.wires.forEach(wire => {
      if (wire.from.componentId === componentId) {
        connected.push(wire.from.terminalId);
      }
      if (wire.to.componentId === componentId) {
        connected.push(wire.to.terminalId);
      }
    });
    
    return [...new Set(connected)];
  }
  
  /**
   * Find loops in circuit
   */
  findLoops() {
    const loops = [];
    const visited = new Set();
    
    const dfs = (componentId, path) => {
      if (visited.has(componentId)) {
        if (path.includes(componentId)) {
          loops.push([...path.slice(path.indexOf(componentId)), componentId]);
        }
        return;
      }
      
      visited.add(componentId);
      path.push(componentId);
      
      // Find connected components
      const connectedComponents = this.getConnectedComponents(componentId);
      connectedComponents.forEach(id => dfs(id, [...path]));
    };
    
    this.state.components.forEach(comp => {
      visited.clear();
      dfs(comp.id, []);
    });
    
    return loops;
  }
  
  /**
   * Get connected components
   */
  getConnectedComponents(componentId) {
    const connected = new Set();
    
    this.state.wires.forEach(wire => {
      if (wire.from.componentId === componentId) {
        connected.add(wire.to.componentId);
      }
      if (wire.to.componentId === componentId) {
        connected.add(wire.from.componentId);
      }
    });
    
    return [...connected];
  }
}

export default CircuitAnalyzer;
