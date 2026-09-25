
import React, { useState } from 'react';
import * as Icons from '../../icons';
import { cn } from '../../../lib/utils';

const CylinderAnimation: React.FC = () => {
    const [position, setPosition] = useState<'retracted' | 'extending' | 'extended' | 'retracting'>('retracted');

    const rodPosition = (pos: typeof position) => {
        switch (pos) {
            case 'extended':
            case 'extending':
                return '80%';
            case 'retracted':
            case 'retracting':
            default:
                return '0%';
        }
    }
    
    const handleExtend = () => {
        setPosition('extending');
        setTimeout(() => setPosition('extended'), 500); // match transition duration
    }

    const handleRetract = () => {
        setPosition('retracting');
        setTimeout(() => setPosition('retracted'), 500);
    }

    return (
        <div>
            <h3 className="text-3xl font-bold mb-3">How a Double-Acting Cylinder Works</h3>
            <p className="text-muted-foreground mb-8 max-w-3xl leading-relaxed">
                A double-acting cylinder uses fluid pressure to move a piston in both directions (extension and retraction). Pressure applied to Port A extends the rod, forcing fluid out of Port B. Pressure on Port B retracts the rod, forcing fluid out of Port A.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                 {/* Interactive Controls */}
                <div className="space-y-4 bg-card p-6 rounded-lg flex flex-col justify-center border border-border">
                    <button onClick={handleExtend} disabled={position === 'extending' || position === 'extended'} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        Pressurize Port A (Extend)
                    </button>
                    <button onClick={handleRetract} disabled={position === 'retracting' || position === 'retracted'} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        Pressurize Port B (Retract)
                    </button>
                </div>
                
                {/* Visualization */}
                <div className="col-span-2 h-80 flex justify-center items-center bg-card/50 p-4 rounded-lg border border-border relative overflow-hidden">
                    <div className="w-[32rem] h-48 relative">
                        {/* Static Barrel */}
                        <Icons.DOUBLE_ACTING_CYLINDER className="w-full h-full text-foreground/80" />
                        
                        {/* Animated Rod/Piston part */}
                        <div 
                            className="absolute top-0 left-0 w-full h-full transition-transform duration-500 ease-in-out" 
                            style={{ transform: `translateX(${rodPosition(position)})` }}
                        >
                            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" stroke="hsl(var(--primary))">
                                {/* Piston */}
                                <path d="M30 35 v 30" fill="none" strokeWidth="3" strokeLinecap="round" />
                                {/* Rod */}
                                <path d="M30 50 h 60" strokeWidth="2" />
                            </svg>
                        </div>

                        {/* Fluid animation */}
                        <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
                            {/* Extend Fluid */}
                            <div className={cn("absolute top-[38%] h-[24%] bg-blue-500/50 transition-all duration-500 ease-in-out",
                                position === 'extending' || position === 'extended' ? 'left-[10%] w-[20%]' : 'left-[10%] w-0'
                            )} style={{width: (position === 'extending' || position === 'extended') ? `${20 + parseFloat(rodPosition(position)) * 0.7}%` : '0%' }}></div>
                            {/* Retract Fluid */}
                            <div className={cn("absolute top-[38%] right-[30%] h-[24%] bg-red-500/50 transition-all duration-500 ease-in-out",
                                position === 'retracting' || position === 'retracted' ? 'w-[40%]' : 'w-0'
                            )} style={{width: (position === 'retracting' || position === 'retracted') ? `${40 - parseFloat(rodPosition(position)) * 0.5}%` : '0%' }}></div>
                        </div>
                        
                        {/* Port A Highlight */}
                        <div className={cn("absolute top-[16%] left-[13%] w-4 h-4 rounded-full bg-blue-500 transition-all duration-300 animate-pulse", 
                            (position === 'extending') ? 'opacity-100 scale-125' : 'opacity-0 scale-0'
                        )}></div>
                         <p className={cn("absolute top-[8%] left-[12%] text-blue-400 font-bold transition-opacity", (position === 'extending') ? 'opacity-100' : 'opacity-0')}>P ➔</p>

                        {/* Port B Highlight */}
                         <div className={cn("absolute top-[16%] left-[63%] w-4 h-4 rounded-full bg-red-500 transition-all duration-300 animate-pulse",
                            (position === 'retracting') ? 'opacity-100 scale-125' : 'opacity-0 scale-0'
                        )}></div>
                         <p className={cn("absolute top-[8%] left-[62%] text-red-400 font-bold transition-opacity", (position === 'retracting') ? 'opacity-100' : 'opacity-0')}>➔ P</p>

                    </div>
                </div>
            </div>
        </div>
    );
};
export default CylinderAnimation;
