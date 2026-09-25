
import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import { Play, Pause } from 'lucide-react';

type PumpType = 'gear' | 'vane' | 'piston';

const PumpAnimation = ({ type, isPlaying }: { type: PumpType, isPlaying: boolean }) => {
    const animationClass = isPlaying ? 'animate-spin' : '';
    const slowAnimationClass = isPlaying ? 'animate-spin-slow' : '';

    switch(type) {
        case 'gear':
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <defs>
                        <path id="gear-path" d="M0,-30 a5,5 0 0,1 5,-5 h10 a5,5 0 0,1 5,5 v10 l-10,5 l-10,-5 v-10z" />
                    </defs>
                    <circle cx="50" cy="50" r="45" stroke="hsl(var(--foreground))" strokeWidth="2" fill="none"/>
                    {/* Fluid Path */}
                    <path d="M50,5 A45,45 0 1 1 50,95" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="15" strokeDasharray="1 14"/>

                    {/* Inlet/Outlet */}
                    <path d="M0 45 h 10 v 10 h-10z M 90 45 h 10 v 10 h-10z" fill="hsl(var(--foreground))" />
                    <text x="5" y="40" fontSize="8" fill="hsl(var(--primary))">IN</text>
                    <text x="88" y="40" fontSize="8" fill="hsl(var(--primary))">OUT</text>

                    {/* Gears */}
                    <g transform="translate(48, 50)" className={animationClass} style={{ animationDuration: '4s', transformOrigin: '2px 0px' }}>
                        <g transform="rotate(22.5)">
                            {[...Array(8)].map((_, i) => (
                                <use key={i} href="#gear-path" transform={`rotate(${i * 45})`} fill="hsl(var(--primary))" />
                            ))}
                        </g>
                    </g>
                     <g transform="translate(72, 50) rotate(180)" className={animationClass} style={{ animationDuration: '4s', animationDirection: 'reverse', transformOrigin: '-22px 0px' }}>
                        <g transform="rotate(22.5)">
                            {[...Array(8)].map((_, i) => (
                                <use key={i} href="#gear-path" transform={`rotate(${i * 45})`} fill="hsl(var(--primary))" />
                            ))}
                        </g>
                    </g>
                </svg>
            );
        case 'vane':
             return (
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="45" stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" />
                    {/* Rotor */}
                    <g transform="translate(58, 50)" className={slowAnimationClass} style={{ transformOrigin: '-8px 0px', animationDuration: '6s'}}>
                        <circle cx="0" cy="0" r="30" fill="hsl(var(--primary))" />
                        {[...Array(8)].map((_, i) => (
                             <rect key={i} x="-2.5" y="-42" width="5" height="84" fill="hsl(var(--muted))" transform={`rotate(${i * 45})`} />
                        ))}
                    </g>
                    {/* Inlet/Outlet */}
                    <path d="M5,20 a40,40 0 0,0 40,0 z M55,100 a40,40 0 0,0 40,0 z" fill="hsl(var(--foreground))" />
                </svg>
            );
        case 'piston':
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <g transform="translate(50,55)">
                         <g className={slowAnimationClass} style={{ transformOrigin: '0px -5px', animationDuration: '5s'}}>
                            <circle cx="0" cy="-5" r="35" stroke="hsl(var(--foreground))" strokeWidth="2" fill="none"/>
                            {[...Array(7)].map((_, i) => (
                                <g key={i} transform={`rotate(${i * (360/7)}) translate(0 -25)`}>
                                    <rect x="-4" y="0" width="8" height="15" fill="hsl(var(--primary))"/>
                                </g>
                            ))}
                        </g>
                        <circle cx="0" cy="-5" r="10" fill="hsl(var(--muted))" />
                    </g>
                </svg>
            )
    }
}


const HydraulicPumpPrinciples: React.FC = () => {
    const [activeTab, setActiveTab] = useState<PumpType>('gear');
    const [isPlaying, setIsPlaying] = useState(true);

    const pumpInfo = {
        gear: { title: 'Gear Pump', description: 'Two meshing gears trap fluid and carry it from the inlet to the outlet. Simple, robust, and cost-effective, but can be noisy.' },
        vane: { title: 'Vane Pump', description: 'A slotted rotor with vanes spins inside a cam ring. As the space between vanes increases, a vacuum is created, drawing in fluid. As it decreases, fluid is forced out.' },
        piston: { title: 'Axial Piston Pump', description: 'Pistons move back and forth in a rotating cylinder block, driven by a swashplate. This design allows for variable displacement and high pressures.' },
    };

    return (
        <div>
            <h3 className="text-3xl font-bold mb-3">Hydraulic Pump Principles</h3>
            <p className="text-muted-foreground mb-8 max-w-3xl leading-relaxed">
                The hydraulic pump is the heart of the system, converting mechanical energy into hydraulic energy. It creates flow, not pressure. Pressure is caused by resistance to flow. Explore the three most common types of positive displacement pumps below.
            </p>

            <div className="flex items-center border-b-2 border-border mb-4">
                {(['gear', 'vane', 'piston'] as PumpType[]).map(type => (
                    <button
                        key={type}
                        onClick={() => setActiveTab(type)}
                        className={cn("flex-1 py-3 text-sm font-semibold transition-colors",
                            activeTab === type ? 'border-b-2 border-blue-500 text-primary' : 'text-muted-foreground hover:bg-accent'
                        )}
                    >
                        {pumpInfo[type].title}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="col-span-1 lg:col-span-2 h-96 bg-card border border-border rounded-lg p-4 relative">
                    <PumpAnimation type={activeTab} isPlaying={isPlaying} />
                    <button onClick={() => setIsPlaying(!isPlaying)} className="absolute bottom-4 right-4 bg-secondary p-2 rounded-full text-primary hover:bg-accent">
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                </div>
                <div className="bg-card/50 p-6 rounded-lg border border-border">
                    <h4 className="text-2xl font-bold mb-2 text-primary">{pumpInfo[activeTab].title}</h4>
                    <p className="text-muted-foreground leading-relaxed">{pumpInfo[activeTab].description}</p>
                </div>
            </div>
        </div>
    );
};

export default HydraulicPumpPrinciples;
