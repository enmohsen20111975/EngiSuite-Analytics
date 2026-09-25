import { ComponentType, ComponentParameter } from '../types';

type Preset = {
  name: string;
  parameters: Record<string, ComponentParameter>;
};

export const componentCatalog: Partial<Record<ComponentType, Preset[]>> = {
  [ComponentType.HydraulicPump]: [
    {
      name: 'Generic - 10cc',
      parameters: {
        displacement: { label: 'Displacement', value: 10, unit: 'cc/rev', type: 'number' },
        speed: { label: 'Speed', value: 1500, unit: 'rpm', type: 'number' },
        pressure: { label: 'Max Pressure', value: 210, unit: 'bar', type: 'number' },
      }
    },
    {
      name: 'Vickers V10 - 5gpm',
      parameters: {
        displacement: { label: 'Displacement', value: 16.38, unit: 'cc/rev', type: 'number' },
        speed: { label: 'Speed', value: 1200, unit: 'rpm', type: 'number' },
        pressure: { label: 'Max Pressure', value: 172, unit: 'bar', type: 'number' },
      }
    },
    {
      name: 'Bosch Rexroth AZPF - 22cc',
      parameters: {
        displacement: { label: 'Displacement', value: 22, unit: 'cc/rev', type: 'number' },
        speed: { label: 'Speed', value: 1800, unit: 'rpm', type: 'number' },
        pressure: { label: 'Max Pressure', value: 250, unit: 'bar', type: 'number' },
      }
    }
  ],
  [ComponentType.DoubleActingCylinder]: [
    {
        name: 'Generic - 50mm Bore',
        parameters: {
            bore: { label: 'Bore Diameter', value: 50, unit: 'mm', type: 'number' },
            rod: { label: 'Rod Diameter', value: 25, unit: 'mm', type: 'number' },
            stroke: { label: 'Stroke', value: 200, unit: 'mm', type: 'number' },
            load: { label: 'External Load', value: 100, unit: 'kg', type: 'number' },
        },
    },
    {
        name: 'Festo DNC - 80mm',
        parameters: {
            bore: { label: 'Bore Diameter', value: 80, unit: 'mm', type: 'number' },
            rod: { label: 'Rod Diameter', value: 40, unit: 'mm', type: 'number' },
            stroke: { label: 'Stroke', value: 300, unit: 'mm', type: 'number' },
            load: { label: 'External Load', value: 250, unit: 'kg', type: 'number' },
        },
    }
  ],
};
