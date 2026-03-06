/**
 * Series/Parallel Resistance Calculator
 * Calculate equivalent resistance for series and parallel circuits
 */

import React, { useState, useMemo } from 'react';

const SeriesParallel = ({ 
  initialR1 = 10, 
  initialR2 = 10,
  showFormulas = true 
}) => {
  const [r1, setR1] = useState(initialR1);
  const [r2, setR2] = useState(initialR2);

  const series = useMemo(() => r1 + r2, [r1, r2]);
  const parallel = useMemo(() => ((r1 * r2) / (r1 + r2)).toFixed(2), [r1, r2]);

  return (
    <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-6 my-8">
      <h4 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-4">
        Equivalent Resistance Calculator
      </h4>
      <p className="text-amber-700 dark:text-amber-300 mb-6 text-sm">
        Adjust the resistors to see how they combine in series and parallel configurations.
      </p>

      {/* Circuit Visualization */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        {/* Series Circuit */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-amber-200 dark:border-amber-700">
          <h5 className="text-center text-sm font-medium text-amber-800 dark:text-amber-200 mb-3">Series Circuit</h5>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-16 h-8 border-2 border-amber-500 rounded flex items-center justify-center text-amber-700 dark:text-amber-300 text-sm font-medium">
              R1
            </div>
            <div className="w-16 h-8 border-2 border-amber-500 rounded flex items-center justify-center text-amber-700 dark:text-amber-300 text-sm font-medium">
              R2
            </div>
          </div>
          <div className="text-center mt-2 text-xs text-amber-600 dark:text-amber-400">
            Same current through both
          </div>
        </div>

        {/* Parallel Circuit */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-amber-200 dark:border-amber-700">
          <h5 className="text-center text-sm font-medium text-amber-800 dark:text-amber-200 mb-3">Parallel Circuit</h5>
          <div className="flex flex-col items-center space-y-1">
            <div className="w-16 h-6 border-2 border-amber-500 rounded flex items-center justify-center text-amber-700 dark:text-amber-300 text-xs font-medium">
              R1
            </div>
            <div className="w-16 h-6 border-2 border-amber-500 rounded flex items-center justify-center text-amber-700 dark:text-amber-300 text-xs font-medium">
              R2
            </div>
          </div>
          <div className="text-center mt-2 text-xs text-amber-600 dark:text-amber-400">
            Same voltage across both
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm text-amber-700 dark:text-amber-300 mb-1">
            R1 (Ω)
          </label>
          <input 
            type="range" 
            min="1" 
            max="100" 
            value={r1} 
            onChange={(e) => setR1(Number(e.target.value))} 
            className="w-full accent-amber-600" 
          />
          <div className="text-center font-mono text-amber-800 dark:text-amber-200 text-lg">
            {r1} Ω
          </div>
        </div>
        <div>
          <label className="block text-sm text-amber-700 dark:text-amber-300 mb-1">
            R2 (Ω)
          </label>
          <input 
            type="range" 
            min="1" 
            max="100" 
            value={r2} 
            onChange={(e) => setR2(Number(e.target.value))} 
            className="w-full accent-amber-600" 
          />
          <div className="text-center font-mono text-amber-800 dark:text-amber-200 text-lg">
            {r2} Ω
          </div>
        </div>
      </div>
      
      {/* Results */}
      <div className="flex justify-around bg-white dark:bg-slate-800 p-6 rounded-lg border border-amber-200 dark:border-amber-700">
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Series (R₁ + R₂)</div>
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{series} Ω</div>
          {showFormulas && (
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              = {r1} + {r2}
            </div>
          )}
        </div>
        <div className="w-px bg-amber-200 dark:bg-amber-700"></div>
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Parallel (R₁×R₂)/(R₁+R₂)</div>
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{parallel} Ω</div>
          {showFormulas && (
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              = ({r1}×{r2})/({r1}+{r2})
            </div>
          )}
        </div>
      </div>

      {/* Key Insight */}
      <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-sm text-amber-800 dark:text-amber-200">
        <strong>Key Insight:</strong> Parallel resistance is always less than the smallest individual resistor,
        while series resistance is the sum of all resistors.
      </div>
    </div>
  );
};

export default SeriesParallel;
