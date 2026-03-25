
import React, { useState } from 'react';
import * as Icons from '../../icons';
import { cn } from '../../../lib/utils';

const PlcIntegration: React.FC = () => {
    const [isButtonPressed, setIsButtonPressed] = useState(false);

    return (
        <div>
            <h3 className="text-3xl font-bold mb-3">PLC Control of Hydraulics</h3>
            <p className="text-muted-foreground mb-8 max-w-3xl leading-relaxed">
                A Programmable Logic Controller (PLC) is the brain of most automated systems. It reads inputs (like buttons or sensors), executes a user-programmed logic, and controls outputs (like motors or solenoids). This interactive diagram shows how a simple PLC program controls a hydraulic cylinder.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                {/* Visualization */}
                <div className="lg:col-span-3 bg-card border border-border rounded-lg p-4 h-[500px]">
                    <svg viewBox="0 0 500 350" className="w-full h-full">
                        {/* Labels */}
                        <text x="5" y="15" className="text-sm font-semibold fill-muted-foreground">INPUTS</text>
                        <text x="175" y="15" className="text-sm font-semibold fill-muted-foreground">PLC</text>
                        <text x="420" y="15" className="text-sm font-semibold fill-muted-foreground">OUTPUTS</text>
                        
                        {/* Push Button Input */}
                        <g transform="translate(10, 50) scale(0.6)">
                            <Icons.PUSH_BUTTON className={cn(isButtonPressed && 'text-green-400')} />
                        </g>
                        <text x="5" y="120" className="text-xs fill-muted-foreground">DI_StartCycle</text>
                        <path d="M90 75 H 150" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />

                        {/* PLC Body */}
                        <rect x="150" y="25" width="200" height="300" rx="5" className="fill-muted stroke-border" />
                        <text x="230" y="50" className="text-lg font-bold fill-primary">PLC</text>
                        
                        {/* PLC IO Lights */}
                        <circle cx="165" cy="75" r="5" className={cn("transition-colors", isButtonPressed ? 'fill-green-500' : 'fill-gray-600')} />
                        <text x="175" y="80" className="text-xs fill-muted-foreground">I:0/0</text>
                        <circle cx="335" cy="75" r="5" className={cn("transition-colors", isButtonPressed ? 'fill-yellow-500' : 'fill-gray-600')} />
                        <text x="305" y="80" className="text-xs fill-muted-foreground">O:0/0</text>
                        
                        {/* Ladder Logic Display */}
                        <g transform="translate(170, 140)">
                            <text y="-10" className="text-xs font-mono fill-muted-foreground">RUNG 001</text>
                            <path d="M0,0 v50 M160,0 v50" className="stroke-foreground" strokeWidth="2" />
                            <g transform="translate(20, 10) scale(0.3)">
                                <Icons.CONTACT_NO className={cn("transition-colors", isButtonPressed ? 'text-green-400' : 'text-foreground')} />
                            </g>
                            <line x1="50" y1="25" x2="110" y2="25" className="stroke-foreground" strokeWidth="2" />
                            {isButtonPressed && <line x1="20" y1="25" x2="50" y2="25" className="stroke-green-400 transition-all" strokeWidth="2" />}
                            <text x="20" y="50" className="text-xs font-mono fill-muted-foreground">DI_StartCycle</text>
                            <g transform="translate(110, 10) scale(0.3)">
                                <Icons.RELAY_COIL className={cn("transition-colors", isButtonPressed ? 'text-yellow-400' : 'text-foreground')} />
                            </g>
                             <text x="110" y="50" className="text-xs font-mono fill-muted-foreground">DQ_SolenoidA</text>
                        </g>

                        {/* Output Solenoid */}
                        <path d="M350 75 H 400" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                        <g transform="translate(420, 50) scale(0.5)">
                           <rect x="0" y="0" width="80" height="50" rx="5" className={cn("transition-colors", isButtonPressed ? 'fill-yellow-500/30' : 'fill-secondary')} />
                           <text x="40" y="30" textAnchor="middle" className="fill-foreground text-lg">SOL A</text>
                        </g>

                        {/* Hydraulic Circuit */}
                        <g transform="translate(380, 150)">
                            <g transform="scale(0.8)">
                                <Icons.DIRECTIONAL_CONTROL_VALVE />
                                <rect x="5" y="30" width="30" height="40" className={cn("transition-colors", isButtonPressed ? 'stroke-yellow-400 stroke-2 fill-yellow-500/20' : 'fill-none')} />
                            </g>
                            <g transform="translate(100, 0) scale(0.8)">
                                <Icons.DOUBLE_ACTING_CYLINDER />
                                <g className="transition-transform duration-500 ease-in-out" style={{ transform: isButtonPressed ? `translateX(40px)` : `translateX(0px)` }}>
                                    <path d="M30 35 v 30 M30 50 h 60" stroke="currentColor" fill="none" strokeWidth="3" strokeLinecap="round" />
                                </g>
                            </g>
                        </g>
                    </svg>
                </div>
                {/* Controls and Explanation */}
                <div className="lg:col-span-2 bg-card/50 border border-border rounded-lg p-6 flex flex-col justify-center">
                    <h4 className="font-bold text-xl mb-4">Execution Sequence:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                        <li>The user presses the 'Start Cycle' push button.</li>
                        <li>The PLC reads a 'true' state on its physical input terminal I:0/0.</li>
                        <li>The ladder logic is scanned. The condition (NO contact) is now true.</li>
                        <li>The logic energizes the output coil 'DQ_SolenoidA'.</li>
                        <li>The PLC sets its physical output terminal O:0/0 to 'true' (24V).</li>
                        <li>The solenoid on the directional valve is energized, shifting the spool.</li>
                        <li>Hydraulic fluid is directed to the cylinder, causing it to extend.</li>
                    </ol>
                    <button 
                        onMouseDown={() => setIsButtonPressed(true)}
                        onMouseUp={() => setIsButtonPressed(false)}
                        onMouseLeave={() => setIsButtonPressed(false)}
                        className="mt-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-4 rounded transition-colors w-full select-none"
                    >
                        Press and Hold Button
                    </button>
                </div>
            </div>
        </div>
    );
};
export default PlcIntegration;
