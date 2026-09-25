/**
 * Gear Ratio Simulator
 * Animated gear ratio demonstration
 */

import React, { useState, useMemo } from 'react';

const GearRatio = ({
  initialT1 = 20,
  initialT2 = 40
}) => {
  const [t1, setT1] = useState(initialT1);
  const [t2, setT2] = useState(initialT2);

  const ratio = useMemo(() => (t2 / t1).toFixed(2), [t1, t2]);
  const speed1 = 2;
  const speed2 = speed1 * (t2 / t1);

  return (
    <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl p-6 my-8">
      <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Gear Ratio Simulator
      </h4>
      <p className="text-slate-700 dark:text-slate-300 mb-6 text-sm">
        Adjust the number of teeth on each gear to see how it affects the gear ratio and speed.
      </p>

      {/* Gear Visualization */}
      <div className="flex justify-center items-center h-48 mb-6 overflow-hidden">
        {/* Driver Gear */}
        <div 
          className="border-8 border-dashed border-slate-600 dark:border-slate-400 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-700"
          style={{ 
            width: t1 * 3, 
            height: t1 * 3, 
            animation: `spin ${speed1}s linear infinite` 
          }}
        >
          <span className="font-bold text-slate-700 dark:text-slate-200">{t1}T</span>
        </div>
        
        {/* Driven Gear */}
        <div 
          className="border-8 border-dashed border-slate-500 dark:border-slate-400 rounded-full flex items-center justify-center bg-slate-300 dark:bg-slate-600 -ml-2"
          style={{ 
            width: t2 * 3, 
            height: t2 * 3, 
            animation: `spin ${speed2}s linear infinite reverse` 
          }}
        >
          <span className="font-bold text-slate-700 dark:text-slate-200">{t2}T</span>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1">
            Driver Gear Teeth (T1)
          </label>
          <input 
            type="range" 
            min="10" 
            max="40" 
            value={t1} 
            onChange={(e) => setT1(Number(e.target.value))} 
            className="w-full accent-slate-600" 
          />
          <div className="text-center font-mono text-slate-800 dark:text-slate-200">{t1} teeth</div>
        </div>
        <div>
          <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1">
            Driven Gear Teeth (T2)
          </label>
          <input 
            type="range" 
            min="10" 
            max="60" 
            value={t2} 
            onChange={(e) => setT2(Number(e.target.value))} 
            className="w-full accent-slate-600" 
          />
          <div className="text-center font-mono text-slate-800 dark:text-slate-200">{t2} teeth</div>
        </div>
      </div>

      {/* Results */}
      <div className="text-center bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-300 dark:border-slate-600">
        <span className="text-gray-500 dark:text-gray-400 mr-2">Gear Ratio (T2/T1):</span>
        <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">{ratio}:1</span>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {t2 > t1 ? (
            <span>Speed reduction - Driven gear rotates slower but with more torque</span>
          ) : t2 < t1 ? (
            <span>Speed increase - Driven gear rotates faster but with less torque</span>
          ) : (
            <span>1:1 ratio - Both gears rotate at the same speed</span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default GearRatio;
