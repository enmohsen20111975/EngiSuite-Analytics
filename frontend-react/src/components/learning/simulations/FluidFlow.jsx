/**
 * Fluid Flow Simulator
 * Continuity equation demonstration
 */

import React, { useState, useMemo } from 'react';

const FluidFlow = ({ initialDiameter = 10 }) => {
  const [diameter, setDiameter] = useState(initialDiameter);

  const velocity = useMemo(() => (100 / (diameter * diameter)).toFixed(2), [diameter]);
  const area = useMemo(() => (Math.PI * diameter * diameter / 4).toFixed(2), [diameter]);

  return (
    <div className="bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-800 rounded-xl p-6 my-8">
      <h4 className="text-xl font-semibold text-cyan-900 dark:text-cyan-100 mb-4">
        Continuity Equation Simulator
      </h4>
      <p className="text-cyan-700 dark:text-cyan-300 mb-6 text-sm">
        The continuity equation states that mass flow rate is constant: A₁V₁ = A₂V₂.
        Adjust the pipe diameter to see how velocity changes.
      </p>

      {/* Pipe Visualization */}
      <div className="w-full h-32 bg-white dark:bg-slate-800 border-y-4 border-gray-800 dark:border-gray-600 relative flex items-center justify-center overflow-hidden mb-6">
        {/* Fluid */}
        <div 
          className="bg-cyan-400/50 dark:bg-cyan-500/30 absolute left-0 right-0 transition-all duration-300 flex items-center overflow-hidden"
          style={{ height: `${diameter * 10}%` }}
        >
          {/* Flow particles */}
          <div className="w-full h-full flex items-center justify-around opacity-60">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className="w-2 h-2 bg-white rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Pipe walls */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gray-800 dark:bg-gray-600"></div>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-800 dark:bg-gray-600"></div>
        
        {/* Diameter indicator */}
        <div className="absolute right-4 flex flex-col items-center">
          <div className="h-px w-6 bg-cyan-600 dark:bg-cyan-400"></div>
          <span className="text-xs text-cyan-600 dark:text-cyan-400">{diameter}cm</span>
          <div className="h-px w-6 bg-cyan-600 dark:bg-cyan-400"></div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-md mx-auto space-y-4 mb-6">
        <div className="flex justify-between text-sm font-medium text-cyan-700 dark:text-cyan-300">
          <span>Pipe Diameter: {diameter} cm</span>
          <span>Cross-section Area: {area} cm²</span>
        </div>
        <input 
          type="range" 
          min="2" 
          max="10" 
          value={diameter} 
          onChange={(e) => setDiameter(Number(e.target.value))}
          className="w-full h-2 bg-cyan-200 dark:bg-cyan-800 rounded-lg appearance-none cursor-pointer accent-cyan-600"
        />
      </div>

      {/* Results */}
      <div className="text-center bg-white dark:bg-slate-800 p-4 rounded-lg border border-cyan-200 dark:border-cyan-700">
        <span className="text-gray-500 dark:text-gray-400 mr-2">Fluid Velocity:</span>
        <span className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{velocity} m/s</span>
        <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Assuming constant flow rate of 100 cm³/s
        </div>
      </div>

      {/* Formula */}
      <div className="mt-4 p-3 bg-cyan-100 dark:bg-cyan-900/50 rounded-lg text-sm text-cyan-800 dark:text-cyan-200">
        <strong>Continuity Equation:</strong> A₁V₁ = A₂V₂ = Q (constant)
        <br />
        <span className="text-xs">As diameter decreases, velocity must increase to maintain constant flow rate.</span>
      </div>
    </div>
  );
};

export default FluidFlow;
