/**
 * Chemical Reaction Rate Simulator
 * Arrhenius equation demonstration
 */

import React, { useState, useMemo } from 'react';

const ReactionRate = ({ initialTemp = 300 }) => {
  const [temp, setTemp] = useState(initialTemp);

  // Simplified Arrhenius: k = A * exp(-Ea / RT)
  const rate = useMemo(() => (Math.exp(-2000 / temp) * 1000).toFixed(4), [temp]);
  const tempC = useMemo(() => (temp - 273.15).toFixed(1), [temp]);

  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 my-8">
      <h4 className="text-xl font-semibold text-emerald-900 dark:text-emerald-100 mb-4">
        Chemical Reaction Rate
      </h4>
      <p className="text-emerald-700 dark:text-emerald-300 mb-6 text-sm">
        Observe how temperature affects the reaction rate constant using the Arrhenius Equation.
      </p>

      {/* Reaction Visualization */}
      <div className="w-full h-32 bg-white dark:bg-slate-800 rounded-lg border border-emerald-200 dark:border-emerald-700 relative flex items-end justify-center overflow-hidden p-4 mb-6">
        {/* Reaction vessel */}
        <div className="w-32 h-full border-b-4 border-x-4 border-gray-300 dark:border-gray-600 rounded-b-xl relative flex items-end justify-center overflow-hidden">
          {/* Liquid level */}
          <div 
            className="w-full bg-emerald-400/50 dark:bg-emerald-500/30 transition-all duration-300 relative"
            style={{ height: `${Math.min(Number(rate) * 50, 100)}%` }}
          >
            {/* Bubbles */}
            <div className="absolute inset-0 flex justify-around items-end opacity-60">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-2 h-2 bg-white rounded-full"
                  style={{ 
                    animation: `bounce ${1 / Number(rate)}s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Heat source */}
        <div 
          className="absolute bottom-0 w-32 h-2 bg-gradient-to-r from-red-500 to-orange-500 transition-opacity duration-300"
          style={{ opacity: (temp - 273) / 127 }}
        ></div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-md mx-auto space-y-4 mb-6">
        <div className="flex justify-between text-sm font-medium text-emerald-700 dark:text-emerald-300">
          <span>Temperature: {temp} K ({tempC} °C)</span>
          <span>Rate (k): {rate} s⁻¹</span>
        </div>
        <input 
          type="range" 
          min="273" 
          max="400" 
          value={temp} 
          onChange={(e) => setTemp(Number(e.target.value))}
          className="w-full h-2 bg-emerald-200 dark:bg-emerald-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>0°C</span>
          <span>50°C</span>
          <span>100°C</span>
          <span>127°C</span>
        </div>
      </div>

      {/* Results */}
      <div className="text-center bg-white dark:bg-slate-800 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Rate Constant (k)</div>
        <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{rate} s⁻¹</div>
        <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          k = A × e<sup>-Ea/RT</sup>
        </div>
      </div>

      <div className="mt-4 p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-sm text-emerald-800 dark:text-emerald-200">
        <strong>Arrhenius Equation:</strong> Higher temperature means molecules have more kinetic energy,
        leading to more frequent and energetic collisions, thus faster reaction rates.
      </div>
    </div>
  );
};

export default ReactionRate;
