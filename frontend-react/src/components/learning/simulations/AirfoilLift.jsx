/**
 * Airfoil Lift & Drag Simulator
 * Adjust angle of attack to see lift and drag coefficients
 */

import React, { useState, useMemo } from 'react';

const AirfoilLift = ({ initialAoA = 0 }) => {
  const [aoa, setAoa] = useState(initialAoA);

  const lift = useMemo(() => (aoa * 0.11).toFixed(2), [aoa]);
  const drag = useMemo(() => (0.02 + Math.pow(aoa, 2) * 0.001).toFixed(3), [aoa]);
  const stall = aoa > 15;

  return (
    <div className="bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 rounded-xl p-6 my-8">
      <h4 className="text-xl font-semibold text-sky-900 dark:text-sky-100 mb-4">
        Airfoil Lift & Drag
      </h4>
      <p className="text-sky-700 dark:text-sky-300 mb-6 text-sm">
        Adjust the Angle of Attack (AoA) to see how it affects lift and drag coefficients.
      </p>

      {/* Airfoil Visualization */}
      <div className="w-full h-48 bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-sky-700 relative flex items-center justify-center overflow-hidden mb-6">
        {/* Wind lines */}
        <div className="absolute inset-0 opacity-20 flex flex-col justify-around pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="w-full h-0.5 bg-sky-500"
              style={{ animation: `pulse ${1 + i * 0.2}s ease-in-out infinite` }}
            ></div>
          ))}
        </div>
        
        {/* Airfoil Shape */}
        <div 
          className="w-48 h-12 bg-gray-800 dark:bg-gray-200 transition-transform duration-300 ease-out flex items-center justify-center relative"
          style={{ 
            clipPath: 'polygon(0% 50%, 20% 0%, 100% 50%, 20% 100%)',
            transform: `rotate(${-aoa}deg)`
          }}
        >
          <div className="w-2 h-2 bg-red-500 rounded-full absolute left-1/4"></div>
        </div>
        
        {/* Lift arrow */}
        <div className="absolute top-4 right-1/3 flex flex-col items-center">
          <div className="h-8 w-1 bg-green-500"></div>
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">Lift</span>
        </div>
        
        {/* Drag arrow */}
        <div className="absolute right-4 top-1/2 flex items-center">
          <span className="text-xs text-red-600 dark:text-red-400 font-medium mr-1">Drag</span>
          <div className="w-8 h-1 bg-red-500"></div>
          <div className="w-0 h-0 border-y-4 border-y-transparent border-l-6 border-l-red-500"></div>
        </div>
        
        {/* Stall warning */}
        {stall && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
            ⚠️ STALL
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full max-w-md mx-auto space-y-4 mb-6">
        <div className="flex justify-between text-sm font-medium text-sky-700 dark:text-sky-300">
          <span>Angle of Attack: {aoa}°</span>
          <div className="flex space-x-4">
            <span className="text-emerald-600 dark:text-emerald-400">Cl: {lift}</span>
            <span className="text-red-600 dark:text-red-400">Cd: {drag}</span>
          </div>
        </div>
        <input 
          type="range" 
          min="-5" 
          max="20" 
          value={aoa} 
          onChange={(e) => setAoa(Number(e.target.value))}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
            stall ? 'bg-red-200 dark:bg-red-900' : 'bg-sky-200 dark:bg-sky-800'
          }`}
          style={{ accentColor: stall ? '#ef4444' : '#0ea5e9' }}
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>-5°</span>
          <span className="text-sky-600 dark:text-sky-400">Optimal: 4-8°</span>
          <span className="text-red-400">Stall: {'>'}15°</span>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-sky-200 dark:border-sky-700 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Lift Coefficient (Cl)</div>
          <div className={`text-2xl font-bold ${parseFloat(lift) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {lift}
          </div>
          <div className="text-xs text-gray-400 mt-1">Cl ≈ 0.11 × α</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-sky-200 dark:border-sky-700 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Drag Coefficient (Cd)</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{drag}</div>
          <div className="text-xs text-gray-400 mt-1">Cd ≈ 0.02 + 0.001α²</div>
        </div>
      </div>

      <div className="mt-4 text-sm text-sky-600 dark:text-sky-400 text-center">
        {stall 
          ? '⚠️ Stall condition: Lift decreases dramatically, drag increases sharply'
          : 'Higher angle of attack increases lift but also increases drag'}
      </div>
    </div>
  );
};

export default AirfoilLift;
