
import React, { useState, useMemo } from 'react';
import { useCircuitStore } from '../hooks/useCircuitStore';
import { ComponentType, LogicCondition } from '../types';
import { Plus, Trash2 } from 'lucide-react';

const LogicPanel: React.FC = () => {
  const { circuit, ladderLogic, addLadderRung, deleteLadderRung, updateLadderRung } = useCircuitStore(state => ({
    circuit: state.circuit,
    ladderLogic: state.circuit?.ladderLogic || [],
    addLadderRung: state.addLadderRung,
    deleteLadderRung: state.deleteLadderRung,
    updateLadderRung: state.updateLadderRung
  }));
  
  const logicComponents = useMemo(() => {
    if (!circuit) return { inputs: [], outputs: [] };
    const inputs = circuit.components.filter(c => 
      [ComponentType.PushButton, ComponentType.Switch, ComponentType.ContactNO, ComponentType.ContactNC].includes(c.type)
    );
    const outputs = circuit.components.filter(c => c.type === ComponentType.RelayCoil);
    return { inputs, outputs };
  }, [circuit]);

  const handleAddRung = () => {
    if (logicComponents.inputs.length > 0 && logicComponents.outputs.length > 0) {
      addLadderRung({
        conditions: [{ componentId: logicComponents.inputs[0].id, type: 'NO' }],
        output: { componentId: logicComponents.outputs[0].id }
      });
    } else {
      alert("Please add at least one input (Button, Switch, Contact) and one output (Relay Coil) to the circuit.");
    }
  };
  
  const handleConditionChange = (rungId: string, condIndex: number, newComponentId: string) => {
    const rung = ladderLogic.find(r => r.id === rungId);
    if (!rung) return;
    const newConditions = [...rung.conditions];
    newConditions[condIndex] = { ...newConditions[condIndex], componentId: newComponentId };
    updateLadderRung(rungId, { conditions: newConditions });
  };
  
  const handleOutputTypeChange = (rungId: string, newComponentId: string) => {
     const rung = ladderLogic.find(r => r.id === rungId);
     if (!rung) return;
     updateLadderRung(rungId, { output: { componentId: newComponentId } });
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Ladder Logic</h3>
        <button onClick={handleAddRung} className="p-1.5 text-green-400 hover:bg-accent rounded">
          <Plus size={18} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3">
        {ladderLogic.length === 0 ? (
           <p className="text-sm text-muted-foreground text-center mt-4">No logic rungs defined. Click the '+' button to add one.</p>
        ) : (
          ladderLogic.map((rung, rungIndex) => (
            <div key={rung.id} className="bg-muted/50 p-3 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                 <span className="text-xs font-bold text-muted-foreground">RUNG {rungIndex + 1}</span>
                 <button onClick={() => deleteLadderRung(rung.id)} className="p-1 text-red-400 hover:bg-destructive/20 rounded">
                    <Trash2 size={14} />
                 </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">IF</span>
                {/* For now, we only support one condition per rung for simplicity */}
                <select 
                  value={rung.conditions[0]?.componentId || ''}
                  onChange={(e) => handleConditionChange(rung.id, 0, e.target.value)}
                  className="flex-1 bg-input border border-border rounded-md px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                    <option value="" disabled>Select Input...</option>
                    {logicComponents.inputs.map(c => (
                        <option key={c.id} value={c.id}>{c.label} ({c.parameters.tag?.value || c.type})</option>
                    ))}
                </select>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-bold">THEN</span>
                <select
                  value={rung.output.componentId}
                  onChange={(e) => handleOutputTypeChange(rung.id, e.target.value)}
                  className="flex-1 bg-input border border-border rounded-md px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                    <option value="" disabled>Select Output...</option>
                    {logicComponents.outputs.map(c => (
                        <option key={c.id} value={c.id}>{c.label} ({c.parameters.tag.value})</option>
                    ))}
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogicPanel;
