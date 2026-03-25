
import React, { useState } from 'react';
import * as Icons from '../../icons';
import { cn } from '../../../lib/utils';

const RelayLogic: React.FC = () => {
    const [isSwitchClosed, setIsSwitchClosed] = useState(false);

    return (
        <div>
            <h3 className="text-3xl font-bold mb-3">Understanding Relay Logic</h3>
            <p className="text-muted-foreground mb-8 max-w-3xl leading-relaxed">
                A relay is an electrically operated switch. It uses a small current in an electromagnet (the coil) to open or close a separate, often higher-power, circuit (the contacts). This allows a low-power signal to control a high-power device safely. Click the switch below to see it in action.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Visualization */}
                <div className="bg-card border border-border rounded-lg p-6 h-[400px] relative">
                    <svg className="w-full h-full" viewBox="0 0 400 300">
                        {/* Control Circuit */}
                        <g>
                            <text x="10" y="20" fontSize="14" fill="hsl(var(--muted-foreground))">Control Circuit (24V)</text>
                            <path d="M50,50 v200" stroke="hsl(var(--foreground))" strokeWidth="2" />
                            <path d="M150,50 v200" stroke="hsl(var(--foreground))" strokeWidth="2" />
                            <text x="55" y="45" fontSize="14" fill="hsl(var(--primary))">+24V</text>
                            <text x="125" y="45" fontSize="14" fill="hsl(var(--primary))">0V</text>

                            {/* Switch */}
                            <g transform="translate(50, 80) scale(0.5)">
                                <Icons.SWITCH />
                            </g>
                            {/* Animated part of switch */}
                            <line x1="75" y1="105" x2="125" y2={isSwitchClosed ? "105" : "95"} className="transition-all duration-200" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

                            {/* Relay Coil */}
                            <g transform="translate(75, 180) scale(0.5)">
                                <Icons.RELAY_COIL className={cn("transition-colors", isSwitchClosed ? 'text-green-400' : 'text-foreground')} />
                            </g>
                            <text x="105" y="240" fontSize="12" fill="hsl(var(--muted-foreground))">K1</text>
                        </g>
                        
                        {/* Power Circuit */}
                        <g>
                            <text x="210" y="20" fontSize="14" fill="hsl(var(--muted-foreground))">Power Circuit (120V)</text>
                            <path d="M250,50 v200" stroke="hsl(var(--foreground))" strokeWidth="2" />
                            <path d="M350,50 v200" stroke="hsl(var(--foreground))" strokeWidth="2" />

                            {/* Contact */}
                             <g transform="translate(250, 80) scale(0.5)">
                                <Icons.CONTACT_NO />
                            </g>
                            <line x1="275" y1="105" x2="325" y2="105" className={cn("transition-opacity", isSwitchClosed ? 'opacity-100' : 'opacity-0')} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <text x="330" y="105" fontSize="12" fill="hsl(var(--muted-foreground))">K1</text>

                            {/* Lamp */}
                            <g transform="translate(275, 180) scale(0.5)">
                                <Icons.LAMP className={cn("transition-colors", isSwitchClosed ? 'text-yellow-400' : 'text-foreground')} />
                            </g>
                        </g>
                        
                        {/* Flow Animations */}
                        {isSwitchClosed && (
                            <g strokeWidth="3" fill="none" strokeLinecap="round">
                                <path d="M50,50 v35 h25" stroke="hsl(120 70% 50% / 0.7)" className="flow-animation" />
                                <path d="M125,105 h-25 v75" stroke="hsl(120 70% 50% / 0.7)" className="flow-animation" />
                                <path d="M100,230 v20 H150" stroke="hsl(120 70% 50% / 0.7)" className="flow-animation" />

                                <path d="M250,50 v35 h25" stroke="hsl(50 90% 50% / 0.7)" className="flow-animation" />
                                <path d="M325,105 h-25 v75" stroke="hsl(50 90% 50% / 0.7)" className="flow-animation" />
                                <path d="M300,230 v20 H350" stroke="hsl(50 90% 50% / 0.7)" className="flow-animation" />
                            </g>
                        )}
                    </svg>
                </div>
                {/* Controls and Explanation */}
                <div className="bg-card/50 p-6 rounded-lg border border-border flex flex-col justify-center">
                    <h4 className="text-xl font-bold mb-4">How it Works:</h4>
                    <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                        <li>Closing the switch completes the <span className="font-semibold text-green-400">Control Circuit</span>.</li>
                        <li>Current flows through the coil of relay <span className="font-semibold text-primary">K1</span>, creating a magnetic field.</li>
                        <li>This magnetic field pulls the Normally Open (NO) contact <span className="font-semibold text-primary">K1</span> closed.</li>
                        <li>The closed contact completes the <span className="font-semibold text-yellow-400">Power Circuit</span>.</li>
                        <li>Current flows to the lamp, causing it to light up.</li>
                    </ol>
                     <button onClick={() => setIsSwitchClosed(!isSwitchClosed)} className="mt-8 bg-secondary hover:bg-accent font-bold py-3 px-4 rounded transition-colors w-full">
                        {isSwitchClosed ? 'Open Switch' : 'Close Switch'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RelayLogic;
