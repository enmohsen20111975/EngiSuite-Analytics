
import React, { useState, useMemo } from 'react';

const PascalsLaw: React.FC = () => {
    const [force1, setForce1] = useState(10); // in Newtons
    const [area1, setArea1] = useState(1); // in cm^2
    const [area2, setArea2] = useState(10); // in cm^2

    const pressure = useMemo(() => force1 / area1, [force1, area1]); // N/cm^2
    const force2 = useMemo(() => pressure * area2, [pressure, area2]);

    const pistonHeight1 = 50 - Math.min(force1 / 2, 40);
    const pistonHeight2 = 50 - Math.min(force2 / 20, 40);

    return (
        <div>
            <h3 className="text-3xl font-bold mb-3">Pascal's Law: Force Multiplication</h3>
            <p className="text-muted-foreground mb-8 max-w-3xl leading-relaxed">
                Pascal's principle states that a pressure change at any point in a confined incompressible fluid is transmitted throughout the fluid such that the same change occurs everywhere. In a hydraulic system, this allows for the multiplication of force. Adjust the sliders below to see how it works.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                {/* Interactive Controls */}
                <div className="space-y-6 bg-card p-6 rounded-lg border border-border">
                    <div>
                        <label className="block text-sm font-medium mb-2">Input Force (F1): <span className="font-bold text-primary">{force1.toFixed(1)} N</span></label>
                        <input type="range" min="1" max="100" value={force1} onChange={e => setForce1(Number(e.target.value))} className="w-full accent-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Input Area (A1): <span className="font-bold text-primary">{area1.toFixed(1)} cm²</span></label>
                        <input type="range" min="1" max="10" step="0.5" value={area1} onChange={e => setArea1(Number(e.target.value))} className="w-full accent-blue-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-2">Output Area (A2): <span className="font-bold text-primary">{area2.toFixed(1)} cm²</span></label>
                        <input type="range" min="1" max="50" value={area2} onChange={e => setArea2(Number(e.target.value))} className="w-full accent-blue-500" />
                    </div>
                </div>

                {/* Visualization */}
                <div className="col-span-2 h-80 flex justify-around items-end bg-card/50 p-4 rounded-lg border border-border relative overflow-hidden">
                    {/* Fluid */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-blue-800/40"></div>
                    
                    {/* Piston 1 */}
                    <div className="flex flex-col items-center z-10">
                        <div className="mb-2 text-center">
                           <p className="font-mono text-sm">F1 = {force1.toFixed(1)} N</p>
                           <div className="text-3xl font-bold text-yellow-400">↓</div>
                        </div>
                        <div className="w-16 bg-muted rounded-t-md" style={{ height: `${pistonHeight1}%` }}></div>
                        <div className="h-4 bg-foreground/80 border-x-2 border-b-2 border-border" style={{ width: `${area1 * 10 + 20}px` }}></div>
                         <p className="mt-2 font-mono text-xs">A1 = {area1.toFixed(1)} cm²</p>
                    </div>

                    {/* Connecting Pipe */}
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-muted border-t-2 border-border"></div>
                    
                    {/* Piston 2 */}
                     <div className="flex flex-col items-center z-10">
                         <div className="mb-2 text-center">
                           <p className="font-mono text-sm">F2 = {force2.toFixed(1)} N</p>
                           <div className="text-3xl font-bold text-green-400">↑</div>
                        </div>
                        <div className="w-16 bg-muted rounded-t-md" style={{ height: `${pistonHeight2}%` }}></div>
                        <div className="h-4 bg-foreground/80 border-x-2 border-b-2 border-border" style={{ width: `${area2 * 5 + 20}px` }}></div>
                        <p className="mt-2 font-mono text-xs">A2 = {area2.toFixed(1)} cm²</p>
                    </div>

                    {/* Pressure Display */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card p-3 rounded-md shadow-lg border border-border z-20">
                        <p className="text-sm font-bold font-mono text-center text-muted-foreground">System Pressure (P)</p>
                        <p className="text-3xl font-bold font-mono text-cyan-400 text-center">{(pressure).toFixed(2)}</p>
                         <p className="text-xs text-center text-muted-foreground font-mono">N/cm²</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default PascalsLaw;
