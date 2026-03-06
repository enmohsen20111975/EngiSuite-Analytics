/**
 * Thermodynamic Piston Simulator
 * Visualize piston movement with heat input
 */

import React, { useState } from 'react';

const PistonSim = ({ initialHeat = 0 }) => {
  const [heat, setHeat] = useState(initialHeat);

  return (
    <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-xl p-6 my-8">
      <h4 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-4">
        Thermodynamic Piston
      </h4>
      <p className="text-orange-700 dark:text-orange-300 mb-6 text-sm">
        Visualize how heat input causes gas expansion and piston movement.
        ΔU = Q - W (First Law of Thermodynamics)
      </p>

      {/* Piston Visualization */}
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-52 border-x-4 border-b-4 border-gray-800 dark:border-gray-600 rounded-b-lg bg-orange-100/50 dark:bg-orange-900/30 flex items-end justify-center overflow-hidden">
          {/* Heat source */}
          <div 
            className="absolute bottom-0 w-full bg-gradient-to-t from-red-500 to-transparent transition-opacity duration-300"
            style={{ height: '10px', opacity: heat / 100 }}
          ></div>
          
          {/* Piston head */}
          <div 
            className="w-full bg-gray-400 dark:bg-gray-500 absolute transition-all duration-300"
            style={{ height: '20px', bottom: `${20 + heat * 0.8}px` }}
          ></div>
          
          {/* Piston rod */}
          <div 
            className="w-4 bg-gray-300 dark:bg-gray-400 absolute transition-all duration-300"
            style={{ height: '100px', bottom: `${40 + heat * 0.8}px` }}
          ></div>
          
          {/* Gas particles */}
          <div className="absolute inset-0 bottom-10 overflow-hidden opacity-50">
            {[...Array(15)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-1.5 h-1.5 bg-orange-600 rounded-full"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  bottom: `${Math.random() * (20 + heat * 0.5)}%`,
                  animation: `bounce ${0.5 + Math.random() * (1 - heat/150)}s ease-in-out infinite`,
                  animationDelay: `${Math.random()}s`
                }}
              ></div>
            ))}
          </div>
          
          {/* Volume indicator */}
          <div className="absolute left-1 bottom-16 text-xs text-orange-600 dark:text-orange-400 font-mono">
            V
          </div>
          <div 
            className="absolute left-1 transition-all duration-300"
            style={{ bottom: `${25 + heat * 0.4}px` }}
          >
            <div className="w-2 h-px bg-orange-600 dark:bg-orange-400"></div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-md mx-auto space-y-4">
        <div className="flex justify-between text-sm font-medium text-orange-700 dark:text-orange-300">
          <span>Heat Input (Q)</span>
          <span>{heat}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={heat} 
          onChange={(e) => setHeat(Number(e.target.value))}
          className="w-full h-2 bg-orange-200 dark:bg-orange-800 rounded-lg appearance-none cursor-pointer accent-orange-600"
        />
      </div>

      {/* Info */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-orange-200 dark:border-orange-700">
          <div className="text-gray-500 dark:text-gray-400">Heat (Q)</div>
          <div className="text-lg font-bold text-red-600 dark:text-red-400">{heat} J</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-orange-200 dark:border-orange-700">
          <div className="text-gray-500 dark:text-gray-400">Work (W)</div>
          <div className="text-lg font-bold text-green-600 dark:text-green-400">{(heat * 0.4).toFixed(0)} J</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-orange-200 dark:border-orange-700">
          <div className="text-gray-500 dark:text-gray-400">ΔU</div>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{(heat * 0.6).toFixed(0)} J</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/50 rounded-lg text-sm text-orange-800 dark:text-orange-200">
        <strong>First Law:</strong> ΔU = Q - W
        <br />
        <span className="text-xs">Adding heat increases internal energy and does work by expanding the gas.</span>
      </div>
    </div>
  );
};

export default PistonSim;
