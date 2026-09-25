import React, { useState } from 'react';
import { ComponentInstance, ComponentType, ComponentDatabase, ComponentSpec, Wire, WireMaterial, Terminal } from '../types';

interface PropertiesPanelProps {
  selectedComponent: ComponentInstance | null;
  selectedWire: Wire | null;
  componentDb: ComponentDatabase;
  onUpdateComponent: (id: string, updates: Partial<ComponentInstance>) => void;
  onUpdateWire: (id: string, updates: Partial<Wire>) => void;
  onDeleteComponent: (id: string) => void;
  onDeleteWire: (id: string) => void;
}

const inputClass = "w-full bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded p-1 mt-1 border border-transparent focus:border-blue-500 focus:ring-0 focus:outline-none";
const readOnlyInputClass = "w-full bg-[var(--bg-primary)] text-[var(--text-muted)] rounded p-1 mt-1 border border-transparent cursor-default";
const labelClass = "block text-sm font-medium text-[var(--text-secondary)]";

const ReadOnlyField: React.FC<{label: string, value: any, unit?: string}> = ({label, value, unit}) => (
    <div>
        <label className={labelClass}>{label}</label>
        <input type="text" value={value !== undefined && value !== null ? `${value}${unit || ''}` : 'N/A'} readOnly className={readOnlyInputClass} />
    </div>
);

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
    selectedComponent, 
    selectedWire,
    componentDb, 
    onUpdateComponent, 
    onUpdateWire,
    onDeleteComponent,
    onDeleteWire,
}) => {
  const [isSpecVisible, setIsSpecVisible] = useState(true);

  if (!selectedComponent && !selectedWire) {
    return (
      <div className="h-full bg-[var(--bg-secondary)] p-4 flex flex-col">
        <h3 className="text-lg font-bold border-b border-[var(--border-secondary)] pb-2 mb-4">Properties</h3>
        <p className="text-[var(--text-muted)]">Select a component or wire to see its properties.</p>
      </div>
    );
  }
  
  let selectedSpec: ComponentSpec | null = null;
  if (selectedComponent && selectedComponent.properties.model) {
      const type = selectedComponent.type;
      const componentKey = 
          type === ComponentType.MCB ? 'mcb' :
          type === ComponentType.MCCB ? 'mccb' :
          type === ComponentType.ACB ? 'acb' :
          type === ComponentType.MotorProtector ? 'motorProtector' :
          type === ComponentType.RCBO ? 'rcbo' :
          type === ComponentType.Motor ? 'motor' :
          type === ComponentType.Contactor ? 'contactor' : null;
      
      if (componentKey) {
          const db = componentDb[componentKey as keyof ComponentDatabase];
          if (db) {
            selectedSpec = db.find(spec => spec.model === selectedComponent.properties.model) || null;
          }
      }
  }

  // Component Property Handlers
  const handleComponentPropertyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!selectedComponent) return;
    const { name, value, type } = e.target;
    const newProperties = { ...selectedComponent.properties };
    const updates: Partial<ComponentInstance> = {};

    if (type === 'number') {
      (newProperties as any)[name] = parseFloat(value) || 0;
    } else if (type === 'checkbox') {
        const checkbox = e.target as HTMLInputElement;
        (newProperties as any)[name] = checkbox.checked;
        if (checkbox.checked) {
            updates.isTripped = false; // Reset trip state when manually turning on
        }
    } else {
      (newProperties as any)[name] = value;
    }

    if (name === 'phases') {
        const newPhaseCount = parseInt(value, 10);
        newProperties.phases = newPhaseCount as 1 | 3;
        if (selectedComponent.type === ComponentType.ACSource) {
            if (newPhaseCount === 1) {
                updates.terminals = [
                    { id: 'L1', x: 0, y: -12 },
                    { id: 'N', x: 0, y: 12 }
                ] as Terminal[];
            } else { // 3-phase
                updates.terminals = [
                    { id: 'L1', x: 0, y: -12 },
                    { id: 'L2', x: -10, y: 6 },
                    { id: 'L3', x: 10, y: 6 }
                ] as Terminal[];
            }
        }
    }

    updates.properties = newProperties;
    onUpdateComponent(selectedComponent.id, updates);
  };

  const handleTripCurveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedComponent) return;
    const curve = e.target.value;
    const newProperties: any = { ...selectedComponent.properties, tripCurve: curve };

    switch (curve) {
        case 'B': newProperties.magneticMultiplier = 3; break;
        case 'C': newProperties.magneticMultiplier = 5; break;
        case 'D': newProperties.magneticMultiplier = 10; break;
        case 'K': newProperties.magneticMultiplier = 8; break;
        case 'Z': newProperties.magneticMultiplier = 2; break;
    }

    onUpdateComponent(selectedComponent.id, { properties: newProperties });
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (!selectedComponent) return;
      const { value } = e.target;
      const type = selectedComponent.type;
      const componentKey = 
          type === ComponentType.MCB ? 'mcb' :
          type === ComponentType.MCCB ? 'mccb' :
          type === ComponentType.ACB ? 'acb' :
          type === ComponentType.MotorProtector ? 'motorProtector' :
          type === ComponentType.RCBO ? 'rcbo' :
          type === ComponentType.Motor ? 'motor' :
          type === ComponentType.Contactor ? 'contactor' : null;
      
      if (!componentKey) return;

      const db = componentDb[componentKey as keyof ComponentDatabase];
      const selectedSpec = db.find(spec => spec.model === value);
      
      if (selectedSpec) {
          const newProperties = { ...selectedComponent.properties, ...selectedSpec };
          if (['mcb', 'mccb', 'acb', 'motorProtector', 'rcbo'].includes(componentKey)) {
              newProperties.tripCurve = selectedSpec.trip_curve_type;
              newProperties.magneticMultiplier = selectedSpec.magnetic_trip_current_multiplier[0];
          }
          onUpdateComponent(selectedComponent.id, { properties: newProperties });
      }
  }
  
  const handleRotationChange = (angle: number) => {
    if (!selectedComponent) return;
    onUpdateComponent(selectedComponent.id, { rotation: angle });
  }

  // Wire Property Handlers
  const handleWirePropertyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (!selectedWire) return;
      const { name, value, type } = e.target;
      const parsedValue = type === 'number' ? parseFloat(value) || 0 : value;
      onUpdateWire(selectedWire.id, { [name]: parsedValue });
  }

  // Render Functions
  const renderDbSelector = (type: 'motor' | 'contactor' | 'mcb' | 'mccb' | 'acb' | 'motorProtector' | 'rcbo') => {
      if (!selectedComponent) return null;
      const db = componentDb[type];
      if (!db || db.length === 0) return null;

      const brands = [...new Set(db.map(item => item.brand))];
      const models = db.filter(item => item.brand === selectedComponent.properties.brand);
      
      return (
          <>
              <div>
                  <label className={labelClass}>Brand</label>
                  <select name="brand" value={selectedComponent.properties.brand || ''} onChange={handleComponentPropertyChange} className={inputClass}>
                      <option value="">Select Brand</option>
                      {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                  </select>
              </div>
              <div>
                  <label className={labelClass}>Model</label>
                  <select name="model" value={selectedComponent.properties.model || ''} onChange={handleModelChange} className={inputClass} disabled={!selectedComponent.properties.brand}>
                      <option value="">Select Model</option>
                      {models.map(model => <option key={model.model} value={model.model}>{model.model}</option>)}
                  </select>
              </div>
          </>
      )
  }
  
  const renderComponentProperties = () => {
      if (!selectedComponent) return null;
      const props = selectedComponent.properties;
      return (
            <div className="space-y-4">
                <p className="font-bold mb-2">{selectedComponent.type}</p>
                 <div>
                    <label className={labelClass}>Rotation</label>
                    <div className="flex space-x-2 mt-1">
                        {[0, 90, 180, 270].map(angle => (
                            <button 
                                key={angle}
                                onClick={() => handleRotationChange(angle)}
                                className={`flex-1 p-1 rounded text-xs transition-colors ${selectedComponent.rotation === angle ? 'bg-blue-600 text-white' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-interactive)]'}`}
                            >
                                {angle}°
                            </button>
                        ))}
                    </div>
                </div>
                { ![ComponentType.Junction].includes(selectedComponent.type) && (
                    <div>
                        <label className={labelClass}>Label</label>
                        <input type="text" name="label" value={props.label || ''} onChange={handleComponentPropertyChange} className={inputClass} />
                    </div>
                )}
                
                {(() => {
                    switch (selectedComponent.type) {
                        case ComponentType.DCSource:
                            return (
                                <div>
                                    <label className={labelClass}>Voltage (V)</label>
                                    <input type="number" name="voltage" value={props.voltage || ''} onChange={handleComponentPropertyChange} className={inputClass} />
                                </div>
                            );
                        case ComponentType.ACSource:
                             return (
                                <>
                                    <div>
                                        <label className={labelClass}>Voltage (V)</label>
                                        <input type="number" name="voltage" value={props.voltage || ''} onChange={handleComponentPropertyChange} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Phases</label>
                                        <select name="phases" value={props.phases || 3} onChange={handleComponentPropertyChange} className={inputClass}>
                                            <option value={1}>1-Phase</option>
                                            <option value={3}>3-Phase</option>
                                        </select>
                                    </div>
                                </>
                            );
                        case ComponentType.Resistor:
                            return (
                                <div>
                                    <label className={labelClass}>Resistance (Ω)</label>
                                    <input type="number" name="resistance" value={props.resistance || ''} onChange={handleComponentPropertyChange} className={inputClass} />
                                </div>
                            );
                        case ComponentType.Switch:
                        case ComponentType.PushButton:
                             return (
                                <div className="flex items-center">
                                    <input type="checkbox" name="on" checked={!!props.on} onChange={handleComponentPropertyChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                    <label className="ml-2 block text-sm text-[var(--text-secondary)]">On / Closed</label>
                                </div>
                            );
                        case ComponentType.AND:
                        case ComponentType.OR:
                        case ComponentType.NAND:
                        case ComponentType.NOR:
                        case ComponentType.XOR:
                        case ComponentType.NOT:
                            const isNotGate = selectedComponent.type === ComponentType.NOT;
                            return (
                                <div>
                                    <label className={labelClass}>Number of Inputs</label>
                                    <input 
                                        type="number" 
                                        name="numInputs" 
                                        value={props.numInputs || (isNotGate ? 1 : 2)} 
                                        onChange={handleComponentPropertyChange} 
                                        className={inputClass}
                                        min={isNotGate ? 1 : 2}
                                        max={64}
                                        step={1}
                                        disabled={isNotGate}
                                    />
                                </div>
                            );
                        case ComponentType.LED:
                        case ComponentType.Lamp:
                             return (
                                <>
                                <div>
                                    <label className={labelClass}>Color</label>
                                    <input type="color" name="color" value={props.color || '#22c55e'} onChange={handleComponentPropertyChange} className="w-full bg-transparent rounded p-0 mt-1 h-8" />
                                </div>
                                <div>
                                    <label className={labelClass}>Rated Voltage (V)</label>
                                    <input type="number" name="voltage" value={props.voltage || ''} onChange={handleComponentPropertyChange} className={inputClass} />
                                </div>
                                { selectedComponent.type === ComponentType.LED ? (
                                    <div>
                                        <label className={labelClass}>Rated Current (A)</label>
                                        <input type="number" step="0.001" name="ratedCurrent" value={props.ratedCurrent || ''} onChange={handleComponentPropertyChange} className={inputClass} />
                                    </div>
                                ) : (
                                    <div>
                                        <label className={labelClass}>Power (W)</label>
                                        <input type="number" name="powerKW" value={(props.powerKW || 0) * 1000} onChange={(e) => handleComponentPropertyChange({ target: { name: 'powerKW', value: (parseFloat(e.target.value) / 1000).toString(), type: 'number' } } as any)} className={inputClass} />
                                    </div>
                                )}
                                </>
                            );
                        case ComponentType.Contactor:
                        case ComponentType.RelayCoil:
                        case ComponentType.ContactorCoil:
                        case ComponentType.ContactNO:
                        case ComponentType.ContactNC:
                        case ComponentType.OverloadRelay:
                            return (
                                 <>
                                    { (selectedComponent.type === ComponentType.Contactor) && renderDbSelector('contactor') }
                                    <div>
                                        <label className={labelClass}>Link ID</label>
                                        <input type="text" name="linkId" value={props.linkId || ''} onChange={handleComponentPropertyChange} className={inputClass} />
                                    </div>
                                     { (selectedComponent.type === ComponentType.ContactorCoil || selectedComponent.type === ComponentType.RelayCoil) &&
                                        <div>
                                            <label className={labelClass}>Coil Voltage</label>
                                            <input type="text" name="coilVoltage" value={props.coilVoltage || ''} onChange={handleComponentPropertyChange} className={inputClass} />
                                        </div>
                                     }
                                     { selectedComponent.type === ComponentType.OverloadRelay &&
                                        <div>
                                            <label className={labelClass}>Rated Current (A)</label>
                                            <input type="number" name="ratedCurrent" value={props.ratedCurrent || ''} onChange={handleComponentPropertyChange} className={inputClass} />
                                        </div>
                                     }
                                     { selectedComponent.type === ComponentType.Contactor && props.model &&
                                        <>
                                            <ReadOnlyField label="Rated Current" value={props.ratedCurrent} unit="A"/>
                                            <ReadOnlyField label="Power" value={props.powerKW} unit="kW"/>
                                        </>
                                     }
                                     { [ComponentType.OverloadRelay].includes(selectedComponent.type) && (
                                         <>
                                            <div className="flex items-center pt-2">
                                                <input type="checkbox" name="on" checked={!!props.on} onChange={handleComponentPropertyChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                                <label className="ml-2 block text-sm text-[var(--text-secondary)]">On / Not Tripped</label>
                                            </div>
                                            {selectedComponent.isTripped && <p className="text-red-500 font-bold mt-2">RELAY TRIPPED. Toggle 'On' to reset.</p>}
                                         </>
                                     )}
                                </>
                            );
                        case ComponentType.Motor:
                        case ComponentType.DCMotor:
                        case ComponentType.ServoMotor:
                        case ComponentType.StepperMotor:
                            return renderDbSelector('motor');
                        case ComponentType.MotorProtector:
                        case ComponentType.MCB:
                        case ComponentType.MCCB:
                        case ComponentType.ACB:
                        case ComponentType.RCBO:
                            const dbKey = (selectedComponent.type as string).charAt(0).toLowerCase() + (selectedComponent.type as string).slice(1) as 'mcb' | 'mccb' | 'acb' | 'motorProtector' | 'rcbo';
                            return (
                                <>
                                    {renderDbSelector(dbKey)}
                                    {selectedComponent.type === ComponentType.RCBO && (
                                        <div>
                                            <label className={labelClass}>Residual Current (mA)</label>
                                             <select name="residualCurrent" value={props.residualCurrent || 30} onChange={handleComponentPropertyChange} className={inputClass}>
                                                {[10, 30, 100, 300].map(c => <option key={c} value={c}>{c}mA</option>)}
                                            </select>
                                        </div>
                                    )}
                                    <div>
                                        <label className={labelClass}>Trip Curve</label>
                                        <select name="tripCurve" value={props.tripCurve || ''} onChange={handleTripCurveChange} className={inputClass}>
                                            {['B', 'C', 'D', 'K', 'Z'].map(c => <option key={c} value={c}>{c}-Curve</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Magnetic Multiplier (xIn)</label>
                                        <input type="number" step="0.5" name="magneticMultiplier" value={props.magneticMultiplier || ''} onChange={handleComponentPropertyChange} className={inputClass} />
                                    </div>
                                    <div className="flex items-center pt-2">
                                        <input type="checkbox" name="on" checked={!!props.on} onChange={handleComponentPropertyChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                        <label className="ml-2 block text-sm text-[var(--text-secondary)]">On / Closed</label>
                                    </div>
                                    {selectedComponent.isTripped && <p className="text-red-500 font-bold mt-2">BREAKER TRIPPED. Toggle 'On' to reset.</p>}
                                </>
                            );
                        case ComponentType.Fuse:
                            return (
                                <>
                                    <div>
                                        <label className={labelClass}>Rated Current (A)</label>
                                        <input type="number" name="ratedCurrent" value={props.ratedCurrent || ''} onChange={handleComponentPropertyChange} className={inputClass} disabled={selectedComponent.isTripped} />
                                    </div>
                                     {selectedComponent.isTripped && <p className="text-red-500 font-bold mt-2">FUSE BLOWN</p>}
                                </>
                            );
                        case ComponentType.Transformer:
                            return (
                                 <>
                                    <div>
                                        <label className={labelClass}>Primary Voltage (V)</label>
                                        <input type="number" name="primaryVoltage" value={props.primaryVoltage || ''} onChange={handleComponentPropertyChange} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Secondary Voltage (V)</label>
                                        <input type="number" name="secondaryVoltage" value={props.secondaryVoltage || ''} onChange={handleComponentPropertyChange} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Power (kVA)</label>
                                        <input type="number" name="powerKVA" value={props.powerKVA || ''} onChange={handleComponentPropertyChange} className={inputClass} />
                                    </div>
                                </>
                            );
                        case ComponentType.PLCInput:
                        case ComponentType.PLCOutput:
                             return (
                                <div>
                                    <label className={labelClass}>I/O Address (e.g., I0.0)</label>
                                    <input type="text" name="ioAddress" value={props.ioAddress || ''} onChange={handleComponentPropertyChange} className={inputClass} />
                                </div>
                            );
                        default:
                            return <p className="text-[var(--text-muted)]">No editable properties for this component.</p>;
                    }
                })()}
                 <div className="pt-4 mt-4 border-t border-[var(--border-primary)]">
                    <h4 className="font-semibold text-sm text-[var(--text-secondary)] mb-2">Fault Simulation</h4>
                     <div>
                        <label className={labelClass}>Fault State</label>
                        <select name="fault" value={props.fault || 'none'} onChange={handleComponentPropertyChange} className={inputClass}>
                            <option value="none">None</option>
                            <option value="open_circuit">Open Circuit</option>
                            <option value="short_circuit">Short Circuit</option>
                        </select>
                    </div>
                     <div>
                        <label className={labelClass}>Failure Rate (%)</label>
                        <input type="number" step="0.0001" name="failureRate" value={props.failureRate !== undefined ? props.failureRate * 100 : 0.01} onChange={(e) => handleComponentPropertyChange({ target: { name: 'failureRate', value: (parseFloat(e.target.value) / 100).toString(), type: 'number' } } as any)} className={inputClass} />
                    </div>
                </div>
            </div>
      );
  }

  const renderWireProperties = () => {
      if (!selectedWire) return null;
      return (
        <div className="space-y-4">
             <p className="font-bold mb-2">Wire</p>
            <div>
                <label className={labelClass}>Length (m)</label>
                <input type="number" name="length" value={selectedWire.length || ''} onChange={handleWirePropertyChange} className={inputClass} />
            </div>
            <div>
                <label className={labelClass}>Size (mm²)</label>
                <input type="number" name="size" value={selectedWire.size || ''} onChange={handleWirePropertyChange} className={inputClass} />
            </div>
            <div>
                <label className={labelClass}>Material</label>
                <select name="material" value={selectedWire.material || ''} onChange={handleWirePropertyChange} className={inputClass}>
                    <option value={WireMaterial.Copper}>Copper</option>
                    <option value={WireMaterial.Aluminum}>Aluminum</option>
                </select>
            </div>
        </div>
      )
  }

  const renderSpecifications = () => {
      if (!selectedSpec) return null;

      const formatKey = (key: string): string => {
          return key
              .replace(/_/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());
      };

      const formatValue = (value: any): string => {
          if (Array.isArray(value)) {
              return value.join(' - ');
          }
          if (typeof value === 'boolean') {
              return value ? 'Yes' : 'No';
          }
          if (value === null || value === undefined) {
              return 'N/A';
          }
          return String(value);
      };

      return (
          <div className="mt-4 pt-4 border-t border-[var(--border-primary)]">
              <button 
                  onClick={() => setIsSpecVisible(!isSpecVisible)} 
                  className="w-full flex justify-between items-center text-left font-semibold text-[var(--text-secondary)]"
              >
                  Specifications
                  <svg className={`w-5 h-5 transition-transform ${isSpecVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
              </button>
              {isSpecVisible && (
                  <div className="mt-2 space-y-1 text-xs text-[var(--text-muted)] bg-black/20 p-2 rounded max-h-64 overflow-y-auto">
                      {Object.entries(selectedSpec).map(([key, value]) => {
                          if (['brand', 'model', 'id'].includes(key)) return null; 
                          return (
                              <div key={key} className="grid grid-cols-2 gap-2 items-center hover:bg-white/10 rounded p-0.5">
                                  <span className="text-[var(--text-placeholder)] truncate">{formatKey(key)}</span>
                                  <span className="font-mono text-[var(--text-secondary)] text-right truncate">{formatValue(value)}</span>
                              </div>
                          )
                      })}
                  </div>
              )}
          </div>
      );
  }

  return (
    <div className="h-full bg-[var(--bg-secondary)] p-4 flex flex-col">
      <h3 className="text-lg font-bold border-b border-[var(--border-secondary)] pb-2">Properties</h3>
      <div className="flex-grow space-y-4 overflow-y-auto pt-4 pr-2">
        {selectedComponent && renderComponentProperties()}
        {selectedWire && renderWireProperties()}
        {selectedComponent && renderSpecifications()}
      </div>
      {selectedComponent && (
        <button onClick={() => onDeleteComponent(selectedComponent.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 mt-4">
            Delete Component
        </button>
      )}
       {selectedWire && (
        <button onClick={() => onDeleteWire(selectedWire.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 mt-4">
            Delete Wire
        </button>
      )}
    </div>
  );
};