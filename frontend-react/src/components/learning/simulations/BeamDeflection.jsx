/**
 * Beam Deflection Simulator
 * Visualize how a simply supported beam deflects under a point load
 */

import React from 'react';

const BeamDeflection = () => {
  return (
    <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-xl p-6 my-8">
      <h4 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-4">
        Interactive Beam Deflection
      </h4>
      <p className="text-orange-700 dark:text-orange-300 mb-6 text-sm">
        Visualize how a simply supported beam deflects under a point load.
      </p>
      
      <div className="h-48 w-full bg-white dark:bg-slate-800 rounded-lg border border-orange-200 dark:border-orange-700 relative flex items-center justify-center overflow-hidden">
        {/* Left Support (Triangle) */}
        <div className="absolute bottom-4 left-10">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[24px] border-l-transparent border-r-transparent border-b-gray-800 dark:border-b-gray-300"></div>
        </div>
        
        {/* Right Support (Triangle) */}
        <div className="absolute bottom-4 right-10">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[24px] border-l-transparent border-r-transparent border-b-gray-800 dark:border-b-gray-300"></div>
        </div>
        
        {/* Beam */}
        <div className="absolute top-1/2 left-10 right-10 h-3 bg-gray-400 dark:bg-gray-500 rounded-full flex justify-center items-center">
          {/* Load Arrow */}
          <div className="absolute -top-16 flex flex-col items-center animate-bounce">
            <span className="text-red-600 dark:text-red-400 font-bold text-sm mb-1">LOAD</span>
            <div className="w-1 h-12 bg-red-500"></div>
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-red-500"></div>
          </div>
        </div>
        
        {/* Deflection Curve */}
        <svg className="absolute top-1/2 left-10 right-10 h-16 w-[calc(100%-5rem)] overflow-visible pointer-events-none">
          <path 
            d="M 0 2 Q 50% 40 100% 2" 
            fill="none" 
            stroke="#f97316" 
            strokeWidth="3" 
            strokeDasharray="8,4"
          />
          <text x="50%" y="35" textAnchor="middle" className="fill-orange-500 text-xs font-medium">
            Deflection (δ)
          </text>
        </svg>
      </div>

      {/* Formula */}
      <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-orange-200 dark:border-orange-700">
        <h5 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Maximum Deflection Formula:</h5>
        <div className="text-center text-lg font-mono text-orange-700 dark:text-orange-300">
          δ<sub>max</sub> = (P × L³) / (48 × E × I)
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-2">
          <div><strong>P</strong> = Point load</div>
          <div><strong>L</strong> = Beam length</div>
          <div><strong>E</strong> = Modulus of elasticity</div>
          <div><strong>I</strong> = Moment of inertia</div>
        </div>
      </div>
    </div>
  );
};

export default BeamDeflection;
