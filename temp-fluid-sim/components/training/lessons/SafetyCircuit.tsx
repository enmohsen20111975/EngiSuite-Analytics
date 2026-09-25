
import React, { useState } from 'react';
import * as Icons from '../../icons';
import { cn } from '../../../lib/utils';

const SafetyCircuit: React.FC = () => {
    const [motorRunning, setMotorRunning] = useState(false);
    const [eStopPressed, setEStopPressed] = useState(false);
    const [safetyRelayReset, setSafetyRelayReset] = useState(true);

    const handleStart = () => {
        if (!eStopPressed && safetyRelayReset) {
            setMotorRunning(true);
        }
    };

    const handleEStop = () => {
        setEStopPressed(true);
        setMotorRunning(false);
        setSafetyRelayReset(false);
    };

    const handleReset = () => {
        if (eStopPressed) { // In reality, you'd twist-to-release
            setEStopPressed(false);
        } else if (!safetyRelayReset) {
            setSafetyRelayReset(true);
        }
    };

    const canStart = !eStopPressed && safetyRelayReset && !motorRunning;
    const canReset = eStopPressed || (!safetyRelayReset && !eStopPressed);

    return (
        <div>
            <h3 className="text-3xl font-bold mb-3">E-Stop Safety Circuits</h3>
            <p className="text-muted-foreground mb-8 max-w-3xl leading-relaxed">
                Emergency Stop (E-Stop) circuits are a critical safety feature designed to quickly and reliably stop machinery in a hazardous situation. They typically use special components like dual-channel E-Stop buttons and monitored safety relays to ensure they work even if a single component fails.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                {/* Visualization */}
                <div className="lg:col-span-3 bg-card border border-border rounded-lg p-4 h-[500px]">
                    <svg viewBox="0 0 400 300" className="w-full h-full">
                        {/* Control Section */}
                        <g>
                            <text x="5" y="15" className="text-sm font-semibold fill-muted-foreground">CONTROLS</text>
                            <g transform="translate(20, 50) scale(0.6)"><Icons.ESTOP_BUTTON isPressed={eStopPressed} /></g>
                            <text x="5" y="125" className="text-xs fill-muted-foreground">E-Stop</text>
                            
                             <g transform="translate(20, 150) scale(0.6)"><Icons.PUSH_BUTTON className={cn(!canStart && 'text-muted-foreground/50')} /></g>
                            <text x="5" y="225" className="text-xs fill-muted-foreground">Start</text>
                        </g>
                        
                        {/* Safety Relay */}
                         <g>
                             <rect x="150" y="50" width="100" height="200" rx="5" className="fill-muted stroke-border" />
                             <text x="160" y="70" className="text-lg font-bold fill-primary">Safety Relay</text>
                             <circle cx="165" cy="100" r="5" className={cn("transition-colors", !eStopPressed ? 'fill-green-500' : 'fill-gray-600')} />
                             <text x="175" y="104" className="text-xs fill-muted-foreground">CH 1 OK</text>
                             <circle cx="165" cy="120" r="5" className={cn("transition-colors", !eStopPressed ? 'fill-green-500' : 'fill-gray-600')} />
                             <text x="175" y="124" className="text-xs fill-muted-foreground">CH 2 OK</text>
                             <circle cx="165" cy="150" r="5" className={cn("transition-colors", motorRunning ? 'fill-yellow-500' : 'fill-gray-600')} />
                             <text x="175" y="154" className="text-xs fill-muted-foreground">OUTPUT ON</text>
                        </g>

                        {/* Motor Circuit */}
                         <g>
                            <text x="300" y="15" className="text-sm font-semibold fill-muted-foreground">POWER</text>
                            <g transform="translate(300, 100) scale(0.8)"><Icons.MOTOR className={cn(motorRunning && 'text-green-400')} isPumpActive={motorRunning} /></g>
                            <g transform="translate(288, 55) scale(0.5)"><Icons.CONTACT_NO /></g>
                            <line x1="313" y1="80" x2="338" y2="80" strokeWidth="2" className={cn("transition-opacity", motorRunning ? 'opacity-100' : 'opacity-0')} stroke="currentColor" />
                            <text x="345" y="80" className="text-xs fill-muted-foreground">KM1</text>
                        </g>

                         {/* Signal Paths */}
                        <path d="M100 80 H 150" stroke={!eStopPressed ? 'hsl(120 70% 50%)' : 'hsl(var(--destructive))'} strokeWidth="1.5" className="transition-colors" />
                        <path d="M100 180 H 150" stroke={canStart ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))'} strokeWidth="1.5" strokeDasharray="3 3" />
                        <path d="M250 150 H 313 V 80" stroke={motorRunning ? 'hsl(50 90% 50%)' : 'hsl(var(--muted-foreground))'} strokeWidth="1.5" className="transition-colors" />
                    </svg>
                </div>
                {/* Controls and Explanation */}
                <div className="lg:col-span-2 bg-card/50 border border-border rounded-lg p-6 flex flex-col justify-center">
                    <div className="space-y-4">
                         <button onClick={handleStart} disabled={!canStart} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            Start Motor
                        </button>
                        <button onClick={handleEStop} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors">
                            Press E-Stop
                        </button>
                         <button onClick={handleReset} disabled={!canReset} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {eStopPressed ? "Release E-Stop" : "Reset Safety Relay"}
                        </button>
                    </div>
                    <div className="mt-6 text-sm text-muted-foreground space-y-2">
                        <p><span className="font-bold text-primary">Status:</span> 
                            {motorRunning && <span className="text-green-400"> Motor Running</span>}
                            {eStopPressed && <span className="text-red-400"> E-STOPPED</span>}
                            {!motorRunning && !eStopPressed && !safetyRelayReset && <span className="text-yellow-400"> Tripped, needs reset</span>}
                             {!motorRunning && !eStopPressed && safetyRelayReset && <span> Ready</span>}
                        </p>
                        <p className="text-xs">An E-Stop must be released before the safety relay can be reset. The system cannot start until the safety relay is reset.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SafetyCircuit;
