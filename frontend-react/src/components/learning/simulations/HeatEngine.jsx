/**
 * Carnot Heat Engine Simulator
 * Maximum efficiency visualization for heat engines
 */

import React, { useState, useMemo } from 'react';

const HeatEngine = ({
  initialTh = 800,
  initialTc = 300
}) => {
  const [th, setTh] = useState(initialTh);
  const [tc, setTc] = useState(initialTc);

  const efficiency = useMemo(() => {
    if (th <= tc) return 0;
    return ((1 - (tc / th)) * 100).toFixed(1);
  }, [th, tc]);

  return (
    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6 my-8">
      <h4 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-4">
        Carnot Heat Engine
      </h4>
      <p className="text-red-700 dark:text-red-300 mb-6 text-sm">
        The Carnot efficiency represents the maximum possible efficiency for a heat engine 
        operating between two temperatures.
      </p>

      {/* Engine Visualization */}
      <div className="flex flex-col items-center mb-6">
        {/* Hot Reservoir */}
        <div className="w-48 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-center font-bold rounded-t-lg shadow-md">
          Hot Reservoir (Th = {th}K)
        </div>
        
        {/* Engine */}
        <div className="flex items-center justify-center w-48 py-6 bg-gray-200 dark:bg-gray-700 border-x-4 border-gray-400 dark:border-gray-500 relative">
          {/* Heat flow in */}
          <div className="absolute w-2 h-8 bg-red-400 top-0 animate-pulse"></div>
          
          {/* Engine circle */}
          <div className="w-16 h-16 bg-gray-800 dark:bg-gray-900 rounded-full flex items-center justify-center text-white font-bold z-10 shadow-lg">
            <span className="text-xs">Engine</span>
          </div>
          
          {/* Heat flow out */}
          <div className="absolute w-2 h-8 bg-blue-400 bottom-0 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          {/* Work output */}
          <div className="absolute right-[-50px] flex items-center">
            <div className="w-10 h-2 bg-green-500"></div>
            <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-green-500"></div>
            <span className="ml-1 text-xs font-bold text-green-700 dark:text-green-400">Work</span>
          </div>
        </div>
        
        {/* Cold Reservoir */}
        <div className="w-48 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-center font-bold rounded-b-lg shadow-md">
          Cold Reservoir (Tc = {tc}K)
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm text-red-700 dark:text-red-300 mb-1">
            Hot Reservoir Th (K): {th}
          </label>
          <input 
            type="range" 
            min="400" 
            max="1200" 
            value={th} 
            onChange={(e) => setTh(Number(e.target.value))} 
            className="w-full accent-red-600" 
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>400K</span>
            <span>1200K</span>
          </div>
        </div>
        <div>
          <label className="block text-sm text-blue-700 dark:text-blue-300 mb-1">
            Cold Reservoir Tc (K): {tc}
          </label>
          <input 
            type="range" 
            min="100" 
            max="390" 
            value={tc} 
            onChange={(e) => setTc(Number(e.target.value))} 
            className="w-full accent-blue-600" 
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>100K</span>
            <span>390K</span>
          </div>
        </div>
      </div>

      {/* Efficiency Result */}
      <div className="text-center bg-white dark:bg-slate-800 p-4 rounded-lg border border-red-200 dark:border-red-700">
        <span className="text-gray-500 dark:text-gray-400 mr-2">Maximum (Carnot) Efficiency:</span>
        <span className="text-3xl font-bold text-red-600 dark:text-red-400">{efficiency}%</span>
        <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          η = 1 - (Tc / Th) = 1 - ({tc} / {th}) = {efficiency}%
        </div>
      </div>

      {/* Warning */}
      {th <= tc && (
        <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
          ⚠️ Hot reservoir must be hotter than cold reservoir for the engine to work!
        </div>
      )}
    </div>
  );
};

export default HeatEngine;
