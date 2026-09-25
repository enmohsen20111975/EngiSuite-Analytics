
import React, { useState, useEffect } from 'react';
import * as Icons from '../../icons';
import { Play } from 'lucide-react';

const BasicCircuit: React.FC = () => {
    const [step, setStep] = useState(0);

    const descriptions = [
        "Click 'Start Animation' to see how a simple hydraulic circuit works.",
        "1. The pump draws oil from the reservoir (tank).",
        "2. The pump pushes the oil under pressure towards the directional control valve (DCV).",
        "3. The solenoid on the DCV is energized, shifting the spool to direct flow.",
        "4. Oil flows from port P to port A on the valve.",
        "5. Oil enters port A of the cylinder, pushing the piston and extending the rod.",
        "6. Oil on the other side of the piston is pushed out of port B.",
        "7. This return oil flows from port B to port T (Tank) on the valve.",
        "8. Finally, the oil returns to the reservoir, completing the circuit."
    ];

    const handleNext = () => {
        setStep(s => (s + 1) % descriptions.length);
    };

    useEffect(() => {
        if (step > 0 && step < descriptions.length - 1) {
            const timer = setTimeout(handleNext, 2000);
            return () => clearTimeout(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step]);
    
    const FlowLine = ({ d, activeSteps }: {d: string; activeSteps: number[]}) => (
        <path d={d} strokeWidth="15" stroke="transparent" strokeLinecap="round">
            {activeSteps.includes(step) && (
                <animate attributeName="stroke-dashoffset" from="1000" to="0" dur="2s" fill="freeze" />
            )}
        </path>
    );

    return (
        <div>
            <h3 className="text-3xl font-bold mb-3">Building a Basic Circuit</h3>
            <p className="text-muted-foreground mb-8 max-w-3xl leading-relaxed">
                Let's trace the path of hydraulic fluid in a simple circuit designed to extend a cylinder. This animation shows the sequence of events from the pump to the actuator.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-card border border-border rounded-lg p-4 relative h-[500px]">
                    <svg className="w-full h-full">
                        {/* Components */}
                        <g transform="translate(50, 400) scale(0.8)"><Icons.RESERVOIR /></g>
                        <g transform="translate(50, 250) scale(0.8)"><Icons.HYDRAULIC_PUMP /></g>
                        <g transform="translate(250, 100) scale(1.2)"><Icons.DIRECTIONAL_CONTROL_VALVE /></g>
                        <g transform="translate(500, 100) scale(1.2)"><Icons.DOUBLE_ACTING_CYLINDER /></g>

                        {/* Connection Lines (static) */}
                        <path d="M115,400 V290" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" />
                        <path d="M115,250 H290 V185" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" />
                        <path d="M302,125 H500" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" />
                        <path d="M358,125 H565" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" />
                        <path d="M330,185 V300 H140 V400" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" />

                        {/* Animated Flow */}
                        <g stroke="hsl(var(--blue-500))" fill="none" strokeDasharray="1000" strokeDashoffset="1000">
                             <FlowLine d="M115,400 V290" activeSteps={[1]} />
                             <FlowLine d="M115,250 H290 V185" activeSteps={[2,3]} />
                             <FlowLine d="M302,125 H500" activeSteps={[4,5]} />
                        </g>
                         <g stroke="hsl(var(--red-500))" fill="none" strokeDasharray="1000" strokeDashoffset="1000">
                             <FlowLine d="M565,125 H358" activeSteps={[6]} />
                             <FlowLine d="M330,185 V300 H140 V400" activeSteps={[7,8]} />
                        </g>

                    </svg>
                    {step === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                            <button onClick={handleNext} className="bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg flex items-center gap-2 text-lg hover:bg-primary/90 transition-colors">
                                <Play /> Start Animation
                            </button>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2 bg-card/50 border border-border rounded-lg p-6 flex flex-col justify-center">
                    <h4 className="font-bold text-xl mb-4">Explanation:</h4>
                    <div className="h-48">
                        {descriptions.map((desc, index) => (
                             <p key={index} className={`text-lg transition-opacity duration-500 ${step === index ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                {desc}
                            </p>
                        ))}
                    </div>
                     <button onClick={() => setStep(0)} className="mt-4 bg-secondary hover:bg-accent font-semibold py-2 px-4 rounded transition-colors w-full">
                        Reset Animation
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BasicCircuit;
