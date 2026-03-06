/**
 * HydraulicCalculations
 * Hydraulic formulas and calculations
 * 
 * Converted from: external/Hydraulic-Simulator_JS/modules/calculations/HydraulicCalculations.js
 */

export const HydraulicCalculations = {
  /**
   * Calculate flow rate from displacement and speed
   * Q = V * n / 1000 (L/min)
   */
  calculateFlowRate(displacement, speed, efficiency = 1) {
    return (displacement * speed * efficiency) / 1000;
  },
  
  /**
   * Calculate hydraulic power
   * P = p * Q / 600 (kW)
   */
  calculatePower(pressure, flow) {
    return (pressure * flow) / 600;
  },
  
  /**
   * Calculate cylinder velocity
   * v = Q * 1000 / A (mm/s)
   */
  calculateCylinderVelocity(flow, boreArea) {
    return (flow * 1000) / (boreArea * 60);
  },
  
  /**
   * Calculate cylinder force
   * F = p * A * 10 (N)
   */
  calculateCylinderForce(pressure, area) {
    return pressure * area * 10;
  },
  
  /**
   * Calculate motor torque
   * T = p * V / (2π) (Nm)
   */
  calculateMotorTorque(pressure, displacement) {
    return (pressure * displacement) / (2 * Math.PI * 10);
  },
  
  /**
   * Calculate motor speed
   * n = Q * 1000 / V (rpm)
   */
  calculateMotorSpeed(flow, displacement) {
    return (flow * 1000) / displacement;
  },
  
  /**
   * Calculate pressure drop in pipe
   * Δp = f * (L/D) * (ρv²/2)
   */
  calculatePipePressureDrop(length, diameter, velocity, frictionFactor = 0.02, density = 850) {
    return frictionFactor * (length / diameter) * (density * velocity ** 2 / 2) / 100000;
  },
  
  /**
   * Calculate Reynolds number
   * Re = v * D / ν
   */
  calculateReynoldsNumber(velocity, diameter, kinematicViscosity = 46e-6) {
    return (velocity * diameter) / kinematicViscosity;
  },
  
  /**
   * Calculate cylinder area
   * A = π * D² / 4 (cm²)
   */
  calculateCylinderArea(diameter) {
    return Math.PI * (diameter / 2) ** 2 / 100;
  },
  
  /**
   * Calculate rod-side cylinder area
   * A = π * (D² - d²) / 4 (cm²)
   */
  calculateAnnularArea(boreDiameter, rodDiameter) {
    return Math.PI * ((boreDiameter / 2) ** 2 - (rodDiameter / 2) ** 2) / 100;
  },
  
  /**
   * Calculate cylinder stroke time
   * t = V / Q (s)
   */
  calculateStrokeTime(volume, flow) {
    return (volume / flow) * 60;
  },
  
  /**
   * Calculate accumulator gas precharge
   */
  calculateAccumulatorPrecharge(maxPressure, minPressure, gasType = 'nitrogen') {
    // For isothermal process
    return Math.sqrt(maxPressure * minPressure);
  },
  
  /**
   * Calculate fluid velocity in pipe
   * v = Q * 1000 / (A * 60) (m/s)
   */
  calculateFluidVelocity(flow, pipeArea) {
    return (flow * 1000) / (pipeArea * 60);
  },
  
  /**
   * Calculate heat generated
   * Q = P * (1 - η) (kW)
   */
  calculateHeatGenerated(power, efficiency) {
    return power * (1 - efficiency);
  },
  
  /**
   * Calculate required cooling capacity
   */
  calculateCoolingRequired(totalPower, systemEfficiency) {
    return totalPower * (1 - systemEfficiency);
  },
  
  /**
   * Calculate tank volume requirement
   * V = 3 * Q_pump (rule of thumb)
   */
  calculateTankVolume(pumpFlow) {
    return pumpFlow * 3;
  },
  
  /**
   * Calculate pipe diameter for given flow
   * D = √(4 * Q / (π * v))
   */
  calculatePipeDiameter(flow, maxVelocity = 5) {
    const area = (flow / 60000) / maxVelocity; // m²
    return Math.sqrt(4 * area / Math.PI) * 1000; // mm
  },
  
  /**
   * Calculate system efficiency
   */
  calculateSystemEfficiency(inputPower, outputPower) {
    return outputPower / inputPower;
  },
  
  /**
   * Convert units
   */
  convertPressure(value, fromUnit, toUnit) {
    const toBar = {
      'bar': 1,
      'Pa': 1e-5,
      'kPa': 0.01,
      'MPa': 10,
      'psi': 0.0689476
    };
    
    const barValue = value * (toBar[fromUnit] || 1);
    return barValue / (toBar[toUnit] || 1);
  },
  
  convertFlow(value, fromUnit, toUnit) {
    const toLpm = {
      'L/min': 1,
      'L/s': 60,
      'm³/h': 16.667,
      'gal/min': 3.78541,
      'gal/s': 227.125
    };
    
    const lpmValue = value * (toLpm[fromUnit] || 1);
    return lpmValue / (toLpm[toUnit] || 1);
  },
  
  /**
   * Analyze complete circuit
   */
  analyzeCircuit(components, wires) {
    const analysis = {
      totalPower: 0,
      totalFlow: 0,
      maxPressure: 0,
      efficiency: 0,
      warnings: [],
      recommendations: []
    };
    
    // Find all pumps
    const pumps = components.filter(c => 
      c.type === 'PUMP' || c.type === 'VARIABLE_DISPLACEMENT_PUMP'
    );
    
    pumps.forEach(pump => {
      const flow = this.calculateFlowRate(
        pump.properties?.displacement?.value || 10,
        pump.properties?.speed?.value || 1450,
        pump.properties?.efficiency?.value || 0.9
      );
      
      const pressure = pump.state?.currentPressure || 150;
      const power = this.calculatePower(pressure, flow);
      
      analysis.totalFlow += flow;
      analysis.totalPower += power;
      analysis.maxPressure = Math.max(analysis.maxPressure, pressure);
    });
    
    // Check for issues
    if (analysis.maxPressure > 250) {
      analysis.warnings.push('System pressure exceeds 250 bar - consider pressure relief');
    }
    
    if (analysis.totalPower > 50) {
      analysis.recommendations.push('Consider adding oil cooler for high power system');
    }
    
    // Calculate efficiency
    analysis.efficiency = 0.85; // Placeholder
    
    return analysis;
  }
};

export default HydraulicCalculations;
