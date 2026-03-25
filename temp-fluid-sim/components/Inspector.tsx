
import React from 'react';
import { useCircuitStore } from '../hooks/useCircuitStore';
import { getConvertedValue, convertValueFromDisplay } from '../lib/conversions';
import { SimulationSettings } from '../types';
import { componentCatalog } from '../data/componentCatalog';

const GlobalSettings: React.FC = () => {
    const { circuit, updateSimulationSetting } = useCircuitStore();
    const settings = circuit?.simulationSettings;
    const unitSystem = circuit?.unitSystem || 'SI';

    if (!settings) return null;

    const handleSettingChange = (key: keyof SimulationSettings['environment'], value: string, displayUnit: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        const siValue = unitSystem === 'Imperial'
            ? convertValueFromDisplay(numValue, displayUnit)
            : numValue;
        
        updateSimulationSetting(key, siValue);
    };

    const environmentSettings = [
        { key: 'temperature', label: 'Temperature', siUnit: '°C' },
        { key: 'fluidViscosity', label: 'Fluid Viscosity', siUnit: 'cSt' },
        { key: 'fluidDensity', label: 'Fluid Density', siUnit: 'kg/m³' },
    ];

    return (
        <div className="p-4 h-full">
            <h3 className="text-lg font-semibold mb-4">Global Circuit Settings</h3>
            <div className="space-y-4">
                 {environmentSettings.map(({ key, label, siUnit }) => {
                     const value = settings.environment[key as keyof typeof settings.environment] as number;
                     const converted = getConvertedValue(value, siUnit, unitSystem);
                     const displayValue = parseFloat(converted.value.toPrecision(4));
                     const displayUnit = converted.unit;

                     return (
                        <div key={key}>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            {label}
                          </label>
                          <div className="flex items-center">
                            <input
                              type="number"
                              value={displayValue}
                              onChange={(e) => handleSettingChange(key as any, e.target.value, displayUnit)}
                              className="w-full bg-input border border-border rounded-md px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                            {displayUnit && (
                              <span className="ml-2 text-sm text-muted-foreground">{displayUnit}</span>
                            )}
                          </div>
                        </div>
                     );
                 })}
            </div>
        </div>
    );
};


const Inspector: React.FC = () => {
  const { circuit, selectedComponentId, updateComponentParameter, applyComponentPreset, plcMappings } = useCircuitStore();
  const component = circuit?.components.find(c => c.id === selectedComponentId);
  const unitSystem = circuit?.unitSystem || 'SI';

  if (!component) {
    return <GlobalSettings />;
  }

  const catalogPresets = componentCatalog[component.type];

  const handleParamChange = (paramKey: string, value: string, displayUnit: string) => {
    const param = component.parameters[paramKey];
    if (param.type === 'number') {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return; // Don't update if input is not a valid number

        // Convert value back to SI before storing if needed
        const siValue = unitSystem === 'Imperial'
            ? convertValueFromDisplay(numValue, displayUnit)
            : numValue;
        
        updateComponentParameter(component.id, paramKey, siValue);

    } else { // Handle string/select types
        // For selects that represent numbers, parse them
        const isNumericSelect = param.type === 'select' && typeof param.value === 'number';
        const finalValue = isNumericSelect ? parseFloat(value) : value;
        updateComponentParameter(component.id, paramKey, finalValue);
    }
  };

  const handlePresetChange = (presetName: string) => {
    if (!catalogPresets) return;
    const preset = catalogPresets.find(p => p.name === presetName);
    if (preset) {
        // Deep copy preset to avoid mutating catalog
        applyComponentPreset(component.id, JSON.parse(JSON.stringify(preset.parameters)));
    }
  };

  return (
    <div className="p-4 overflow-y-auto h-full">
      <h3 className="text-lg font-semibold mb-1">{component.label}</h3>
      <p className="text-xs text-muted-foreground mb-4">ID: {component.id}</p>
      
      {catalogPresets && (
        <div className="mb-4">
            <label className="block text-sm font-medium text-muted-foreground mb-1">
                Preset / Catalog Model
            </label>
            <select
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full bg-input border border-border rounded-md px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
                <option value="">Custom</option>
                {catalogPresets.map(preset => (
                    <option key={preset.name} value={preset.name}>{preset.name}</option>
                ))}
            </select>
        </div>
      )}

      <div className="space-y-4">
        {Object.keys(component.parameters).map((key) => {
          const param = component.parameters[key];
          const mapping = plcMappings.find(m => m.componentId === component.id && m.paramKey === key);
          const isMapped = !!mapping;
          
          let displayValue: string | number = param.value;
          let displayUnit = param.unit;

          if (param.type === 'number' && typeof param.value === 'number' && unitSystem === 'Imperial') {
              const converted = getConvertedValue(param.value, param.unit, 'Imperial');
              displayValue = parseFloat(converted.value.toPrecision(4)); 
              displayUnit = converted.unit;
          } else if (typeof param.value === 'number') {
              displayValue = Number(param.value);
          }
          
          return (
            <div key={key}>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {param.label}
              </label>
              <div className="flex items-center">
                {param.type === 'select' ? (
                   <select
                      value={String(param.value)}
                      onChange={(e) => handleParamChange(key, e.target.value, displayUnit || '')}
                      disabled={isMapped}
                      className="w-full bg-input border border-border rounded-md px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                       {param.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                   </select>
                ) : (
                    <input
                      type={param.type === 'number' ? 'number' : 'text'}
                      value={isMapped ? 'Controlled by PLC' : String(displayValue)}
                      onChange={(e) => handleParamChange(key, e.target.value, displayUnit || '')}
                      disabled={isMapped}
                      className="w-full bg-input border border-border rounded-md px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                )}
                {displayUnit && (
                  <span className="ml-2 text-sm text-muted-foreground">{displayUnit}</span>
                )}
              </div>
               {isMapped && (
                  <p className="text-xs text-blue-400 mt-1">
                      Mapped to PLC tag: <strong>{useCircuitStore.getState().plcTags.find(t => t.id === mapping.tagId)?.name}</strong>
                  </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Inspector;
