
import React, { useState } from 'react';
import * as Icons from '../../icons';
import { cn } from '../../../lib/utils';

const SeriesParallel: React.FC = () => {
    const [seriesSwitch, setSeriesSwitch] = useState(false);
    const [parallelSwitch, setParallelSwitch] = useState(false);
    const [seriesLamp2, setSeriesLamp2] = useState(true); // true means lamp is in circuit
    const [parallelLamp2, setParallelLamp2] = useState(true);

    return (
        <div>
            <h3 className="text-3xl font-bold mb-3">Series vs. Parallel Circuits</h3>
            <p className="text-muted-foreground mb-8 max-w-3xl leading-relaxed">
                The way components are wired together drastically changes a circuit's behavior. A <span className="font-semibold text-primary">series circuit</span> provides only one path for current, while a <span className="font-semibold text-primary">parallel circuit</span> provides multiple paths. Toggle the switches and remove lamps below to see the difference.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Series Circuit */}
                <div className="bg-card/50 p-6 rounded-lg border border-border">
                    <h4 className="text-xl font-bold mb-2 text-center">Series Circuit</h4>
                    <div className="h-64 w-full relative">
                        <svg viewBox="0 0 200 150" className="w-full h-full">
                            <g transform="translate(10, 50) scale(0.4)"><Icons.DC_SOURCE /></g>
                            <g transform="translate(75, 10) scale(0.5)"><Icons.SWITCH /></g>
                            <g transform="translate(140, 50) scale(0.4)"><Icons.LAMP className={cn("transition-colors", (seriesSwitch) ? 'text-yellow-400' : 'text-foreground')} style={{ opacity: seriesSwitch && seriesLamp2 ? 0.7 : (seriesSwitch ? 1 : 0.5) }} /></g>
                            {seriesLamp2 && <g transform="translate(75, 90) scale(0.4)"><Icons.LAMP className={cn("transition-colors", (seriesSwitch) ? 'text-yellow-400' : 'text-foreground')} style={{ opacity: seriesSwitch ? 0.7 : 0.5 }} /></g>}
                            
                            {/* Wires */}
                            <path d="M50,75 V25 H75" stroke="currentColor" strokeWidth="2" />
                             {/* Animated switch part */}
                            <line x1="100" y1="25" x2="125" y2={seriesSwitch ? "25" : "20"} className="transition-all duration-200" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M125,25 H180 V75" stroke="currentColor" strokeWidth="2" />
                            {seriesLamp2 ? (
                                <>
                                <path d="M180,100 H115 V115" stroke="currentColor" strokeWidth="2" />
                                <path d="M75,115 H50 V100" stroke="currentColor" strokeWidth="2" />
                                </>
                            ) : (
                                <path d="M180,100 H50 V100" stroke="currentColor" strokeWidth="2" />
                            )}
                             {/* Flow Animation */}
                            {seriesSwitch && seriesLamp2 && <path d="M50,75 V25 H125 H180 V100 H115 V115 H75 V115 H50 V100" stroke="hsl(50 90% 50% / 0.7)" strokeWidth="3" fill="none" className="flow-animation" />}
                            {seriesSwitch && !seriesLamp2 && <path d="M50,75 V25 H125 H180 V100 H50 V100" stroke="hsl(50 90% 50% / 0.7)" strokeWidth="3" fill="none" className="flow-animation" />}
                        </svg>
                    </div>
                    <div className="text-center mt-4 space-y-3">
                        <button onClick={() => setSeriesSwitch(!seriesSwitch)} className="w-full bg-secondary hover:bg-accent font-semibold py-2 px-4 rounded">Toggle Main Switch</button>
                        <button onClick={() => setSeriesLamp2(!seriesLamp2)} className="w-full bg-secondary hover:bg-accent font-semibold py-2 px-4 rounded">{seriesLamp2 ? 'Remove Lamp 2' : 'Add Lamp 2'}</button>
                         <div className="text-sm text-muted-foreground pt-2">
                            <p>Current flows through all components in a single path.</p>
                            <p className="font-bold text-primary">If the path is broken anywhere, the entire circuit stops working.</p>
                        </div>
                    </div>
                </div>

                {/* Parallel Circuit */}
                <div className="bg-card/50 p-6 rounded-lg border border-border">
                    <h4 className="text-xl font-bold mb-2 text-center">Parallel Circuit</h4>
                    <div className="h-64 w-full relative">
                        <svg viewBox="0 0 200 150" className="w-full h-full">
                            <g transform="translate(10, 50) scale(0.4)"><Icons.DC_SOURCE /></g>
                            <g transform="translate(75, 10) scale(0.5)"><Icons.SWITCH /></g>
                            <g transform="translate(140, 40) scale(0.4)"><Icons.LAMP className={cn("transition-colors", parallelSwitch ? 'text-yellow-400' : 'text-foreground')} /></g>
                            {parallelLamp2 && <g transform="translate(140, 90) scale(0.4)"><Icons.LAMP className={cn("transition-colors", parallelSwitch ? 'text-yellow-400' : 'text-foreground')} /></g>}
                            
                            {/* Wires */}
                            <path d="M50,75 V25 H75" stroke="currentColor" strokeWidth="2" />
                             {/* Animated switch part */}
                            <line x1="100" y1="25" x2="125" y2={parallelSwitch ? "25" : "20"} className="transition-all duration-200" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M125,25 H180" stroke="currentColor" strokeWidth="2" />
                            <path d="M50,100 v25 h130" stroke="currentColor" strokeWidth="2" />
                            <path d="M180,25 V65" stroke="currentColor" strokeWidth="2" />
                             {parallelLamp2 && <path d="M180,65 V115" stroke="currentColor" strokeWidth="2" /> }
                            <path d="M140,65 H180" stroke="currentColor" strokeWidth="2" />
                            {parallelLamp2 && <path d="M140,115 H180" stroke="currentColor" strokeWidth="2" /> }

                             {/* Flow Animation */}
                            {parallelSwitch && <path d="M50,75 V25 H125 M50,100 v25 h130" stroke="hsl(50 90% 50% / 0.7)" strokeWidth="3" fill="none" className="flow-animation" />}
                            {parallelSwitch && <path d="M125,25 H180 V65 H140" stroke="hsl(50 90% 50% / 0.7)" strokeWidth="3" fill="none" className="flow-animation" />}
                            {parallelSwitch && parallelLamp2 && <path d="M180,65 V115 H140" stroke="hsl(50 90% 50% / 0.7)" strokeWidth="3" fill="none" className="flow-animation" />}
                        </svg>
                    </div>
                     <div className="text-center mt-4 space-y-3">
                        <button onClick={() => setParallelSwitch(!parallelSwitch)} className="w-full bg-secondary hover:bg-accent font-semibold py-2 px-4 rounded">Toggle Main Switch</button>
                        <button onClick={() => setParallelLamp2(!parallelLamp2)} className="w-full bg-secondary hover:bg-accent font-semibold py-2 px-4 rounded">{parallelLamp2 ? 'Remove Lamp 2' : 'Add Lamp 2'}</button>
                        <div className="text-sm text-muted-foreground pt-2">
                            <p>Current splits and flows through multiple branches simultaneously.</p>
                            <p className="font-bold text-primary">If one branch is broken, the others can continue to operate.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SeriesParallel;
