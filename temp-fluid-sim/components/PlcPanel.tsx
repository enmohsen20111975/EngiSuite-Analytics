import React, { useState, useMemo } from 'react';
import { useCircuitStore } from '../hooks/useCircuitStore';
import { usePlcSocket } from '../hooks/usePlcSocket';
import { CircuitComponent, ComponentType, PlcTag } from '../types';
import { cn } from '../lib/utils';
import { Wifi, WifiOff, Link, Unlink } from 'lucide-react';

const PlcPanel: React.FC = () => {
  const { 
    circuit, 
    plcConnected, 
    plcTags, 
    plcMappings, 
    addPlcMapping, 
    removePlcMapping,
    plcInputMappings,
    addPlcInputMapping,
    removePlcInputMapping
  } = useCircuitStore();
  const { connect, disconnect } = usePlcSocket(null); // Worker ref not needed here

  const [selectedComponentIo, setSelectedComponentIo] = useState<string>(''); // format: "componentId.paramKey" for outputs
  const [selectedPlcTag, setSelectedPlcTag] = useState<string>('');
  
  const [selectedComponentState, setSelectedComponentState] = useState<string>(''); // format: "componentId.stateKey" for inputs
  const [selectedPlcInputTag, setSelectedPlcInputTag] = useState<string>('');

  // Mappings for PLC -> Circuit
  const mappableComponentIOs = useMemo(() => {
    if (!circuit) return [];
    const items: { id: string; label: string; component: CircuitComponent; paramKey: string }[] = [];
    circuit.components.forEach(c => {
      Object.keys(c.parameters).forEach(pKey => {
        if (pKey.toLowerCase().includes('solenoid') || c.type === ComponentType.RelayCoil) {
          items.push({
            id: `${c.id}.${pKey}`,
            label: `${c.label} - ${c.parameters[pKey].label}`,
            component: c,
            paramKey: pKey
          });
        }
      });
    });
    return items;
  }, [circuit]);
  
  const outputPlcTags = useMemo(() => plcTags.filter(t => t.direction === 'output'), [plcTags]);

  const handleMap = () => {
    if (!selectedComponentIo || !selectedPlcTag) return;
    const [componentId, paramKey] = selectedComponentIo.split('.');
    addPlcMapping({ componentId, paramKey, tagId: selectedPlcTag });
    setSelectedComponentIo('');
    setSelectedPlcTag('');
  };

  const handleUnmap = (componentId: string, paramKey: string) => {
    removePlcMapping(componentId, paramKey);
  };
  
  // Mappings for Circuit -> PLC
  const mappableComponentStates = useMemo(() => {
    if (!circuit) return [];
    const items: { id: string; label: string; componentId: string; stateKey: string }[] = [];
    circuit.components.forEach(c => {
      if (c.type === ComponentType.PushButton) {
        items.push({ id: `${c.id}.isPressed`, label: `${c.label} - State (Pressed)`, componentId: c.id, stateKey: 'isPressed' });
      }
      if (c.type === ComponentType.ContactNO || c.type === ComponentType.ContactNC || c.type === ComponentType.Switch) {
         items.push({ id: `${c.id}.isClosed`, label: `${c.label} - State (Closed)`, componentId: c.id, stateKey: 'isClosed' });
      }
    });
    return items;
  }, [circuit]);

  const inputPlcTags = useMemo(() => plcTags.filter(t => t.direction === 'input'), [plcTags]);

  const handleInputMap = () => {
    if (!selectedComponentState || !selectedPlcInputTag) return;
    const [componentId, stateKey] = selectedComponentState.split('.');
    addPlcInputMapping({ componentId, stateKey, tagId: selectedPlcInputTag });
    setSelectedComponentState('');
    setSelectedPlcInputTag('');
  };
  
  const handleInputUnmap = (componentId: string, stateKey: string) => {
      removePlcInputMapping(componentId, stateKey);
  };

  const getTagName = (tagId: string) => plcTags.find(t => t.id === tagId)?.name || 'Unknown Tag';
  const getComponentParamName = (componentId: string, paramKey: string) => {
    const comp = circuit?.components.find(c => c.id === componentId);
    return comp ? `${comp.label} - ${comp.parameters[paramKey]?.label}` : 'Unknown I/O';
  };
   const getComponentStateName = (componentId: string, stateKey: string) => {
    const comp = circuit?.components.find(c => c.id === componentId);
    return comp ? `${comp.label} - State (${stateKey})` : 'Unknown State';
  };


  return (
    <div className="p-4 h-full flex flex-col divide-y-2 divide-border">
      {/* Connection Section */}
      <div className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">PLC Connectivity</h3>
          <div className={cn("text-xs font-bold flex items-center gap-1.5 px-2 py-1 rounded", plcConnected ? "text-green-300" : "text-red-300")}>
              {plcConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
              {plcConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        {!plcConnected ? (
          <button onClick={connect} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
            Connect to Gateway
          </button>
        ) : (
          <button onClick={disconnect} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors">
            Disconnect
          </button>
        )}
      </div>

      {/* Mapping Sections */}
      {plcConnected && (
        <div className="pt-4 flex-1 flex flex-col min-h-0">
          {/* Output Mappings */}
          <div className="flex-1 flex flex-col min-h-0">
            <h4 className="font-semibold text-md mb-2">Output Mappings (PLC to Circuit)</h4>
            <div className="space-y-2 mb-2">
              <select value={selectedComponentIo} onChange={e => setSelectedComponentIo(e.target.value)} className="w-full bg-input border border-border rounded-md px-2 py-1.5 text-sm">
                <option value="">Select Circuit Output...</option>
                {mappableComponentIOs.map(io => (<option key={io.id} value={io.id}>{io.label}</option>))}
              </select>
              <select value={selectedPlcTag} onChange={e => setSelectedPlcTag(e.target.value)} className="w-full bg-input border border-border rounded-md px-2 py-1.5 text-sm">
                <option value="">Select PLC Output Tag...</option>
                {outputPlcTags.map(tag => (<option key={tag.id} value={tag.id}>{tag.name}</option>))}
              </select>
            </div>
            <ul className="space-y-1 overflow-y-auto">
              {plcMappings.map(m => (
                <li key={`${m.componentId}-${m.paramKey}`} className="flex items-center justify-between bg-muted p-2 rounded-md text-sm">
                    <span>{getComponentParamName(m.componentId, m.paramKey)} ↔ {getTagName(m.tagId)}</span>
                    <button onClick={() => handleUnmap(m.componentId, m.paramKey)} className="p-1 text-red-400 hover:bg-destructive/20 rounded"><Unlink size={14}/></button>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-border my-4"></div>

          {/* Input Mappings */}
          <div className="flex-1 flex flex-col min-h-0">
            <h4 className="font-semibold text-md mb-2">Input Mappings (Circuit to PLC)</h4>
            <div className="space-y-2 mb-2">
              <select value={selectedComponentState} onChange={e => setSelectedComponentState(e.target.value)} className="w-full bg-input border border-border rounded-md px-2 py-1.5 text-sm">
                <option value="">Select Circuit Input...</option>
                {mappableComponentStates.map(s => (<option key={s.id} value={s.id}>{s.label}</option>))}
              </select>
              <select value={selectedPlcInputTag} onChange={e => setSelectedPlcInputTag(e.target.value)} className="w-full bg-input border border-border rounded-md px-2 py-1.5 text-sm">
                <option value="">Select PLC Input Tag...</option>
                {inputPlcTags.map(tag => (<option key={tag.id} value={tag.id}>{tag.name}</option>))}
              </select>
              <button onClick={handleInputMap} disabled={!selectedComponentState || !selectedPlcInputTag} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2 px-4 rounded disabled:opacity-50">
                Map State to Tag
              </button>
            </div>
             <ul className="space-y-1 overflow-y-auto">
              {plcInputMappings.map(m => (
                <li key={`${m.componentId}-${m.stateKey}`} className="flex items-center justify-between bg-muted p-2 rounded-md text-sm">
                    <span>{getComponentStateName(m.componentId, m.stateKey)} → {getTagName(m.tagId)}</span>
                    <button onClick={() => handleInputUnmap(m.componentId, m.stateKey)} className="p-1 text-red-400 hover:bg-destructive/20 rounded"><Unlink size={14}/></button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlcPanel;