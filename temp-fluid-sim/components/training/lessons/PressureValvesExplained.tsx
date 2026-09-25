
import React, { useState } from 'react';
import * as Icons from '../../icons';
import { cn } from '../../../lib/utils';

const PressureValvesExplained: React.FC = () => {
    const [systemPressure, setSystemPressure] = useState(80); // in bar
    const reliefSetting = 100;
    const reducingSetting = 50;

    const isReliefActive = systemPressure > reliefSetting;
    const gaugePressure = Math.min(systemPressure, reducingSetting);

    return (
        <div>
            <h3 className="text-3xl font-bold mb-3">Pressure Control Valves</h3>
            <p className="text-muted-foreground mb-8 max-w-3xl leading-relaxed">
                Pressure valves are essential for safety and control. Although they sound similar, <span className="font-semibold text-primary">Relief Valves</span> and <span className="font-semibold text-primary">Reducing Valves</span> have opposite functions. A relief valve limits maximum system pressure, while a reducing valve maintains a constant lower pressure in a sub-circuit.
            </p>

            <div className="w-full bg-card p-6 rounded-lg border border-border mb-8">
                 <label className="block text-sm font-medium mb-2">System Pressure from Pump: <span className="font-bold text-primary">{systemPressure.toFixed(0)} bar</span></label>
                 <input type="range" min="20" max="150" value={systemPressure} onChange={e => setSystemPressure(Number(e.target.value))} className="w-full accent-blue-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Relief Valve */}
                <div className="bg-card/50 p-6 rounded-lg border border-border">
                    <h4 className="text-xl font-bold mb-2">Pressure Relief Valve (Normally Closed)</h4>
                    <p className="text-sm text-muted-foreground mb-4">Opens to divert excess flow to the tank when pressure exceeds its setting. Protects the system from over-pressurization.</p>
                    <div className="h-64 w-full relative">
                        <svg viewBox="0 0 200 150" className="w-full h-full">
                           <g transform="translate(10, 80) scale(0.4)"><Icons.HYDRAULIC_PUMP/></g>
                           <g transform="translate(130, 80) scale(0.4)"><Icons.RESERVOIR/></g>
                           <g transform="translate(65, 0) scale(0.7)"><Icons.PRESSURE_RELIEF_VALVE/></g>
                           <g transform="translate(130, 0) scale(0.5)"><Icons.PRESSURE_GAUGE/></g>

                           {/* Piping */}
                           <path d="M50,100 H75" stroke="currentColor" strokeWidth="2" />
                           <path d="M125,100 H150" stroke="currentColor" strokeWidth="2" />
                           <path d="M100,56 V100" stroke="currentColor" strokeWidth="2" />
                           <path d="M100,100 H150" stroke="currentColor" strokeWidth="2" />
                           <text x="90" y="75" fontSize="8">{reliefSetting} bar</text>

                           {/* Flow */}
                           {isReliefActive && (
                               <path d="M100,56 V20 H125" stroke="hsl(190 90% 60%)" strokeWidth="3" fill="none" className="flow-animation" />
                           )}
                           <text x="170" y="30" fontSize="12" fill={isReliefActive ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}>{systemPressure.toFixed(0)} bar</text>
                        </svg>
                    </div>
                </div>

                {/* Reducing Valve */}
                 <div className="bg-card/50 p-6 rounded-lg border border-border">
                    <h4 className="text-xl font-bold mb-2">Pressure Reducing Valve (Normally Open)</h4>
                    <p className="text-sm text-muted-foreground mb-4">Senses downstream pressure and throttles flow to maintain a constant, reduced pressure, regardless of higher inlet pressure.</p>
                     <div className="h-64 w-full relative">
                        <svg viewBox="0 0 200 150" className="w-full h-full">
                           <text x="0" y="100" fontSize="10">In: {systemPressure} bar</text>
                           <path d="M30,90 H65" stroke="currentColor" strokeWidth="2" />
                           <g transform="translate(65, 50) scale(0.7)"><Icons.PRESSURE_REDUCING_VALVE/></g>
                           <path d="M135,90 H180" stroke="currentColor" strokeWidth="2" />
                           <g transform="translate(150, 0) scale(0.5)"><Icons.PRESSURE_GAUGE/></g>
                           
                           <text x="90" y="75" fontSize="8">{reducingSetting} bar</text>
                           <text x="180" y="30" fontSize="12" fill="hsl(var(--primary))" fontWeight="bold">{gaugePressure.toFixed(0)} bar</text>

                           {/* Flow Throttling Animation */}
                           {systemPressure > reducingSetting && (
                                <g transform="translate(100, 90)">
                                    <path d="M-5,-10 L0,0 L-5,10 M5,-10 L0,0 L5,10" stroke="hsl(var(--destructive))" strokeWidth="2" fill="none">
                                        <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.5s" repeatCount="indefinite" />
                                    </path>
                                </g>
                           )}
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PressureValvesExplained;
