
import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import * as Icons from '../../icons';

const Pneumatics101: React.FC = () => {
    const [load, setLoad] = useState(50); // in kg

    const hydraulicPosition = 1 - Math.min(load / 200, 1); // Stiff response
    const pneumaticPosition = 1 - Math.min(load / 150, 1) * (1 - Math.exp(-load / 100)); // Spongy response

    return (
        <div>
            <h3 className="text-3xl font-bold mb-3">Pneumatics vs. Hydraulics</h3>
            <p className="text-muted-foreground mb-8 max-w-3xl leading-relaxed">
                Both pneumatics (using compressed gas, usually air) and hydraulics (using incompressible liquid, usually oil) are fluid power technologies. However, their properties make them suitable for very different applications. Use the slider to apply a load and see how each system responds.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visualization */}
                <div className="bg-card/50 p-6 rounded-lg border border-border">
                    <h4 className="text-xl font-bold mb-2 text-center text-cyan-400">Hydraulic System</h4>
                     <div className="h-64 w-full relative flex flex-col items-center justify-end">
                        <div className="text-sm font-bold">{load} kg</div>
                        <div className="text-3xl font-bold text-yellow-400">↓</div>
                        <div className="w-40 h-4 bg-foreground border-2 border-border relative" style={{ bottom: `${hydraulicPosition * 80}%` }}></div>
                        <div className="w-40 h-20 bg-cyan-800/50 border-2 border-border border-t-0"></div>
                     </div>
                     <p className="text-xs text-center text-muted-foreground mt-2">Incompressible fluid provides a stiff, precise response.</p>
                </div>

                <div className="bg-card/50 p-6 rounded-lg border border-border">
                    <h4 className="text-xl font-bold mb-2 text-center text-gray-400">Pneumatic System</h4>
                     <div className="h-64 w-full relative flex flex-col items-center justify-end">
                        <div className="text-sm font-bold">{load} kg</div>
                        <div className="text-3xl font-bold text-yellow-400">↓</div>
                        <div className="w-40 h-4 bg-foreground border-2 border-border relative transition-all duration-100" style={{ bottom: `${pneumaticPosition * 80}%` }}></div>
                        <div className="w-40 h-20 bg-gray-600/50 border-2 border-border border-t-0 flex items-end">
                            <div className="w-full bg-gray-500/50 transition-all duration-100" style={{ height: `${pneumaticPosition * 100}%` }}></div>
                        </div>
                     </div>
                     <p className="text-xs text-center text-muted-foreground mt-2">Compressible gas results in a "spongy" response under load.</p>
                </div>
            </div>
             <div className="w-full bg-card p-6 rounded-lg border border-border mt-8">
                 <label className="block text-sm font-medium mb-2">External Load: <span className="font-bold text-primary">{load.toFixed(0)} kg</span></label>
                 <input type="range" min="0" max="100" value={load} onChange={e => setLoad(Number(e.target.value))} className="w-full accent-blue-500" />
            </div>
        </div>
    );
};

export default Pneumatics101;
