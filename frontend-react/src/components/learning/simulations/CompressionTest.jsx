/**
 * Concrete Compression Test Simulator
 * Simulate concrete cylinder compression testing
 */

import React, { useState, useMemo } from 'react';

const CompressionTest = ({ maxLoad = 100 }) => {
  const [load, setLoad] = useState(0);
  const [crushed, setCrushed] = useState(false);

  const isCrushed = useMemo(() => load >= maxLoad || crushed, [load, maxLoad, crushed]);

  const handleLoadChange = (value) => {
    if (!isCrushed) {
      setLoad(value);
      if (value >= maxLoad) {
        setCrushed(true);
      }
    }
  };

  const reset = () => {
    setLoad(0);
    setCrushed(false);
  };

  return (
    <div className="bg-stone-50 dark:bg-stone-900/30 border border-stone-200 dark:border-stone-700 rounded-xl p-6 my-8">
      <h4 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
        Concrete Compression Test Simulator
      </h4>
      <p className="text-stone-700 dark:text-stone-300 mb-6 text-sm">
        Apply load to the concrete cylinder to test its compressive strength. 
        The cylinder will fail when the load exceeds its capacity ({maxLoad} kN).
      </p>

      <div className="flex flex-col items-center space-y-6">
        {/* Testing Machine Visualization */}
        <div className="relative w-48 h-72 border-4 border-gray-800 dark:border-gray-600 rounded-lg flex flex-col items-center justify-end p-4 bg-white dark:bg-slate-800">
          {/* Upper Platen */}
          <div 
            className="w-40 h-8 bg-gray-600 dark:bg-gray-700 absolute top-0 transition-all duration-200 ease-out"
            style={{ transform: `translateY(${Math.min(load * 0.15, 20)}px)` }}
          ></div>
          
          {/* Load Indicator */}
          <div className="absolute top-12 left-2 text-xs font-mono text-gray-500 dark:text-gray-400">
            {load} kN
          </div>
          
          {/* Concrete Cylinder */}
          <div 
            className={`w-24 h-40 bg-gradient-to-b from-stone-300 to-stone-400 dark:from-stone-600 dark:to-stone-700 
              rounded-sm transition-all duration-200 relative ${isCrushed ? 'opacity-60 scale-x-110 scale-y-90' : ''}`}
          >
            {/* Cracks when crushed */}
            {isCrushed && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-px h-full bg-stone-800/50 left-1/4 top-0 transform -rotate-12"></div>
                <div className="absolute w-px h-3/4 bg-stone-800/50 left-1/2 top-1/4 transform rotate-6"></div>
                <div className="absolute w-px h-2/3 bg-stone-800/50 left-3/4 top-1/3 transform -rotate-3"></div>
              </div>
            )}
            
            {/* Cylinder label */}
            {!isCrushed && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-stone-600 dark:text-stone-300 text-xs font-medium">CYLINDER</span>
              </div>
            )}
          </div>
          
          {/* Lower Platen */}
          <div className="w-40 h-8 bg-gray-600 dark:bg-gray-700 absolute bottom-0"></div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-md space-y-4">
          <div className="flex justify-between text-sm font-medium text-stone-700 dark:text-stone-300">
            <span>Applied Load: {load} kN</span>
            <span className={isCrushed ? 'text-red-600 dark:text-red-400 font-bold animate-pulse' : 'text-gray-400'}>
              {isCrushed ? '⚠ FAILURE!' : `Max: ${maxLoad} kN`}
            </span>
          </div>
          
          <input 
            type="range" 
            min="0" 
            max="120" 
            value={load} 
            onChange={(e) => handleLoadChange(Number(e.target.value))}
            disabled={isCrushed}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
              isCrushed ? 'bg-red-200 dark:bg-red-900' : 'bg-stone-200 dark:bg-stone-700'
            }`}
            style={{ accentColor: isCrushed ? '#ef4444' : '#78716c' }}
          />
          
          {isCrushed && (
            <button 
              onClick={reset}
              className="w-full py-2 bg-stone-600 hover:bg-stone-700 text-white rounded-lg transition-colors"
            >
              Reset Test
            </button>
          )}
        </div>
      </div>

      {/* Results Panel */}
      <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-stone-200 dark:border-stone-700">
        <h5 className="font-medium text-stone-800 dark:text-stone-200 mb-2">Test Results:</h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Failure Load:</span>
            <span className="ml-2 font-bold text-stone-700 dark:text-stone-300">{maxLoad} kN</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Status:</span>
            <span className={`ml-2 font-bold ${isCrushed ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {isCrushed ? 'Failed' : 'Intact'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompressionTest;
