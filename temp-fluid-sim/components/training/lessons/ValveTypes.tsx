
import React, { useState } from 'react';
import { cn } from '../../../lib/utils';

type SpoolPosition = 'left' | 'center' | 'right';

const ValveCutaway = ({ position }: { position: SpoolPosition }) => {
    const spoolOffset = {
        left: '-translate-x-[25%]',
        center: 'translate-x-0',
        right: 'translate-x-[25%]',
    };

    return (
        <svg viewBox="0 0 200 100" className="w-full h-full">
            {/* Valve Body */}
            <rect x="5" y="20" width="190" height="60" rx="5" fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth="1"/>

            {/* Ports Labels */}
            <text x="30" y="15" fontSize="8" fill="hsl(var(--muted-foreground))">A</text>
            <text x="70" y="15" fontSize="8" fill="hsl(var(--muted-foreground))">P</text>
            <text x="125" y="15" fontSize="8" fill="hsl(var(--muted-foreground))">T</text>
            <text x="165" y="15" fontSize="8" fill="hsl(var(--muted-foreground))">B</text>
            
            {/* Ports */}
            <g fill="hsl(var(--background))" stroke="hsl(var(--foreground))">
                <rect x="25" y="10" width="10" height="10"/>
                <rect x="70" y="10" width="10" height="10"/>
                <rect x="120" y="10" width="10" height="10"/>
                <rect x="165" y="10" width="10" height="10"/>

                <rect x="25" y="80" width="10" height="10"/>
                <rect x="70" y="80" width="10" height="10"/>
                <rect x="120" y="80" width="10" height="10"/>
                <rect x="165" y="80" width="10" height="10"/>
            </g>

            {/* Fluid Flow Paths */}
            <g className="transition-opacity duration-300" opacity={position === 'center' ? 0.3 : 1}>
                {/* P to A (Left) */}
                <path d="M75,20 V30 H30 V20" className={cn("transition-all duration-300", position === 'left' ? 'opacity-100' : 'opacity-0')} stroke="hsl(260 90% 60%)" strokeWidth="4" fill="none" />
                {/* B to T (Left) */}
                <path d="M170,80 V70 H125 V80" className={cn("transition-all duration-300", position === 'left' ? 'opacity-100' : 'opacity-0')} stroke="hsl(190 90% 60%)" strokeWidth="4" fill="none" />
                
                {/* P to B (Right) */}
                 <path d="M75,20 V30 H170 V20" className={cn("transition-all duration-300", position === 'right' ? 'opacity-100' : 'opacity-0')} stroke="hsl(260 90% 60%)" strokeWidth="4" fill="none" />
                {/* A to T (Right) */}
                <path d="M30,80 V70 H125 V80" className={cn("transition-all duration-300", position === 'right' ? 'opacity-100' : 'opacity-0')} stroke="hsl(190 90% 60%)" strokeWidth="4" fill="none" />

                 {/* P/T Blocked (Center) */}
                <path d="M75,20 V45 M125,80 V55" className={cn("transition-all duration-300", position === 'center' ? 'opacity-100' : 'opacity-0')} stroke="hsl(var(--destructive))" strokeWidth="3" fill="none" strokeDasharray="2 2" />
            </g>


            {/* Spool */}
            <g className={`transform transition-transform duration-300 ease-in-out ${spoolOffset[position]}`}>
                <rect x="10" y="40" width="180" height="20" rx="2" fill="hsl(var(--primary))" />
                {/* Lands */}
                <g fill="hsl(var(--foreground))" stroke="hsl(var(--border))">
                    <rect x="40" y="35" width="20" height="30" rx="2" />
                    <rect x="85" y="35" width="20" height="30" rx="2" />
                    <rect x="140" y="35" width="20" height="30" rx="2" />
                </g>
            </g>

            {/* Solenoids */}
            <rect x="-10" y="35" width="20" height="30" fill={position === 'left' ? 'hsl(140 80% 60%)' : 'hsl(var(--muted))'} stroke="hsl(var(--foreground))" />
            <rect x="190" y="35" width="20" height="30" fill={position === 'right' ? 'hsl(140 80% 60%)' : 'hsl(var(--muted))'} stroke="hsl(var(--foreground))" />
        </svg>
    )
}

const ValveTypes: React.FC = () => {
    const [spoolPosition, setSpoolPosition] = useState<SpoolPosition>('center');

    return (
        <div>
            <h3 className="text-3xl font-bold mb-3">Directional Control Valves</h3>
            <p className="text-muted-foreground mb-8 max-w-3xl leading-relaxed">
                Directional control valves (DCVs) are the "traffic cops" of a hydraulic system. They start, stop, and change the direction of fluid flow. Below is an animated cutaway of a 4-port, 3-position (4/3) solenoid-operated valve. Click the buttons to shift the spool and see how the flow paths change.
            </p>

            <div className="bg-card border border-border rounded-lg p-6">
                <div className="h-64 mb-6">
                    <ValveCutaway position={spoolPosition} />
                </div>
                <div className="flex justify-center items-center gap-4 p-4 rounded-md bg-muted">
                    <button onClick={() => setSpoolPosition('left')} className={cn("font-semibold py-2 px-6 rounded-md transition-colors", spoolPosition === 'left' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-accent')}>Energize Solenoid A</button>
                    <button onClick={() => setSpoolPosition('center')} className={cn("font-semibold py-2 px-6 rounded-md transition-colors", spoolPosition === 'center' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-accent')}>De-energize (Center)</button>
                    <button onClick={() => setSpoolPosition('right')} className={cn("font-semibold py-2 px-6 rounded-md transition-colors", spoolPosition === 'right' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-accent')}>Energize Solenoid B</button>
                </div>
                <div className="mt-6 p-4 bg-muted/50 rounded-md">
                     <h4 className="font-bold text-lg mb-2">Current Flow Path:</h4>
                     {spoolPosition === 'left' && <p className="text-primary"><span className="font-bold text-purple-400">Pressure (P)</span> is connected to Port A. Port B is connected to <span className="font-bold text-cyan-400">Tank (T)</span>. The cylinder would extend.</p>}
                     {spoolPosition === 'center' && <p className="text-primary">All ports are blocked (Closed Center). The cylinder is held in position.</p>}
                     {spoolPosition === 'right' && <p className="text-primary"><span className="font-bold text-purple-400">Pressure (P)</span> is connected to Port B. Port A is connected to <span className="font-bold text-cyan-400">Tank (T)</span>. The cylinder would retract.</p>}
                </div>
            </div>
        </div>
    );
};

export default ValveTypes;
