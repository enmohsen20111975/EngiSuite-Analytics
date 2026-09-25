import React, { useState } from 'react';
import { LadderRung, LadderElement, LadderElementType } from '../types';

interface PLCPanelProps {
    ladderRungs: LadderRung[];
    setLadderRungs: (rungs: LadderRung[]) => void;
    isSimulating: boolean;
    rungStates: Map<string, boolean>;
}

const LadderNOIcon: React.FC = () => <><path d="M10 5 V25 M20 5 V25" /></>;
const LadderNCIcon: React.FC = () => <><path d="M10 5 V25 M20 5 V25 M10 23 L20 7" /></>;
const LadderCoilIcon: React.FC = () => <><path d="M10 15 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0" /></>;

const Element: React.FC<{ el: LadderElement, isEnergized: boolean, onEdit: (newAddress: string) => void, onDelete: () => void, isSimulating: boolean }> = ({ el, isEnergized, onEdit, onDelete, isSimulating }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [address, setAddress] = useState(el.address);

    const handleSave = () => {
        onEdit(address);
        setIsEditing(false);
    };

    return (
        <div className="relative group p-1 flex flex-col items-center">
            <svg width="30" height="30" viewBox="0 0 30 30" stroke={isEnergized ? 'var(--component-energized)' : 'currentColor'} strokeWidth="2" fill="none">
                {el.type === 'NO' && <LadderNOIcon />}
                {el.type === 'NC' && <LadderNCIcon />}
                {el.type === 'Coil' && <LadderCoilIcon />}
            </svg>
            {isEditing ? (
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    autoFocus
                    className="w-20 text-center bg-gray-900 text-white text-xs rounded"
                />
            ) : (
                <span onClick={() => !isSimulating && setIsEditing(true)} className="text-xs cursor-pointer">{el.address}</span>
            )}
            {!isSimulating && (
                 <button onClick={onDelete} className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center">&times;</button>
            )}
        </div>
    );
};

export const PLCPanel: React.FC<PLCPanelProps> = ({ ladderRungs, setLadderRungs, isSimulating, rungStates }) => {
    
    // Most of the logic for adding/editing elements would go here.
    // To keep it simple, we'll just render the existing ladder logic for now.
    // A full implementation would require significant state management for the editor.

    return (
        <div className="h-full bg-[var(--bg-secondary)] p-4 flex flex-col space-y-4">
            <h3 className="text-lg font-bold border-b border-[var(--border-secondary)] pb-2">PLC Ladder Logic</h3>
            
            <div className="flex-grow min-h-0 overflow-y-auto font-mono">
                {ladderRungs.map((rung, rIndex) => {
                    let pathEnergized = true; // Start with power from the left rail

                    return (
                        <div key={rung.id} className="flex items-center my-4">
                             {/* Power Rail */}
                            <div className="w-1 h-full bg-[var(--component-energized)]" />
                            <div className="w-4 border-b-2" style={{borderColor: pathEnergized ? 'var(--component-energized)' : 'currentColor'}} />

                            {rung.network.map((item, iIndex) => {
                                const isLastItem = iIndex === rung.network.length - 1;
                                if (Array.isArray(item)) { // Parallel Branch
                                    const branchStates = item.map(el => rungStates.get(el.id) || false);
                                    const isAnyBranchPathEnergized = branchStates.some(s => s);
                                    
                                    const afterBranchPower = pathEnergized && isAnyBranchPathEnergized;
                                    
                                    return (
                                        <div key={iIndex} className="flex relative">
                                            {/* Vertical line entering branch */}
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-px" style={{backgroundColor: pathEnergized ? 'var(--component-energized)' : 'currentColor'}}/>

                                            <div className="flex flex-col">
                                                {item.map((el, bIndex) => (
                                                     <div key={el.id} className="flex items-center my-1">
                                                        <div className="w-4 border-b-2" style={{borderColor: (pathEnergized) ? 'var(--component-energized)' : 'currentColor'}}/>
                                                        <Element el={el} isEnergized={rungStates.get(el.id) || false} onEdit={()=>{}} onDelete={()=>{}} isSimulating={isSimulating} />
                                                        <div className="w-4 border-b-2" style={{borderColor: (rungStates.get(el.id)) ? 'var(--component-energized)' : 'currentColor'}}/>
                                                     </div>
                                                ))}
                                            </div>
                                            {/* Vertical line exiting branch */}
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-px" style={{backgroundColor: afterBranchPower ? 'var(--component-energized)' : 'currentColor'}}/>
                                            {!isLastItem && <div className="w-4 border-b-2" style={{borderColor: afterBranchPower ? 'var(--component-energized)' : 'currentColor'}}/>}
                                            {pathEnergized = afterBranchPower}
                                        </div>
                                    )
                                } else { // Series Element
                                     const el = item as LadderElement;
                                     const isElementEnergized = rungStates.get(el.id) ?? false;
                                     const nextPathEnergized = pathEnergized && isElementEnergized;
                                     
                                     return (
                                         <div key={el.id} className="flex items-center">
                                            <Element el={el} isEnergized={isElementEnergized} onEdit={()=>{}} onDelete={()=>{}} isSimulating={isSimulating}/>
                                            {!isLastItem && <div className="w-4 border-b-2" style={{borderColor: nextPathEnergized ? 'var(--component-energized)' : 'currentColor'}}/>}
                                            {pathEnergized = nextPathEnergized}
                                         </div>
                                     )
                                }
                            })}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};