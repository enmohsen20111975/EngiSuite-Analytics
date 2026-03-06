/**
 * Pneumatic Component Definitions
 * Catalog of pneumatic components for the simulator
 * 
 * Note: This is a placeholder for future expansion
 */

export const PNEUMATIC_CATEGORIES = [
  { id: 'sources', name: 'Sources', icon: '💨', description: 'Compressors and air sources' },
  { id: 'valves', name: 'Valves', icon: '🔧', description: 'Control valves' },
  { id: 'actuators', name: 'Actuators', icon: '💪', description: 'Cylinders and motors' },
  { id: 'measurement', name: 'Measurement', icon: '📊', description: 'Sensors and gauges' },
  { id: 'accessories', name: 'Accessories', icon: '🔩', description: 'Filters, regulators, lubricators' },
  { id: 'connections', name: 'Connections', icon: '🔗', description: 'Junctions and manifolds' }
];

export const PNEUMATIC_COMPONENTS = {
  // Placeholder - will be expanded in future
  COMPRESSOR: {
    type: 'COMPRESSOR',
    name: 'Compressor',
    category: 'sources',
    description: 'Air compressor',
    icon: '💨',
    width: 60,
    height: 50,
    terminals: [
      { id: 'outlet', type: 'PRESSURE_OUT', x: 60, y: 25 }
    ],
    defaultProperties: {
      pressure: { value: 7, unit: 'bar', min: 1, max: 12 }
    }
  },
  
  AIR_TANK: {
    type: 'AIR_TANK',
    name: 'Air Tank',
    category: 'sources',
    description: 'Air reservoir',
    icon: '📦',
    width: 80,
    height: 50,
    terminals: [
      { id: 'in', type: 'PRESSURE_IN', x: 20, y: 0 },
      { id: 'out', type: 'PRESSURE_OUT', x: 60, y: 0 }
    ],
    defaultProperties: {
      capacity: { value: 100, unit: 'L', min: 10, max: 1000 }
    }
  }
};

export const getComponentsByCategory = (categoryId) => {
  return Object.values(PNEUMATIC_COMPONENTS).filter(c => c.category === categoryId);
};

export const getComponentByType = (type) => {
  return PNEUMATIC_COMPONENTS[type] || null;
};

export default PNEUMATIC_COMPONENTS;
