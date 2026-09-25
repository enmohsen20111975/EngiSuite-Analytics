/**
 * Concrete Mix Design Simulator
 * Interactive concrete proportioning calculator
 */

import React, { useState, useMemo } from 'react';

const ConcreteMix = ({
  initialWater = 20,
  initialCement = 15,
  initialAggregate = 65
}) => {
  const [water, setWater] = useState(initialWater);
  const [cement, setCement] = useState(initialCement);
  const [aggregate, setAggregate] = useState(initialAggregate);

  const total = water + cement + aggregate;
  
  const ratios = useMemo(() => ({
    water: ((water / total) * 100).toFixed(1),
    cement: ((cement / total) * 100).toFixed(1),
    aggregate: ((aggregate / total) * 100).toFixed(1)
  }), [water, cement, aggregate, total]);

  const waterCementRatio = useMemo(() => (water / cement).toFixed(2), [water, cement]);
  
  const estimatedStrength = useMemo(() => {
    // Simplified strength estimation based on water-cement ratio
    const wc = water / cement;
    if (wc < 0.4) return { value: 45, grade: 'High' };
    if (wc < 0.5) return { value: 35, grade: 'Medium-High' };
    if (wc < 0.6) return { value: 25, grade: 'Medium' };
    return { value: 15, grade: 'Low' };
  }, [water, cement]);

  return (
    <div className="bg-stone-50 dark:bg-stone-900/30 border border-stone-200 dark:border-stone-700 rounded-xl p-6 my-8">
      <h4 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
        Concrete Mix Design
      </h4>
      <p className="text-stone-700 dark:text-stone-300 mb-6 text-sm">
        Adjust the proportions of water, cement, and aggregate to design your concrete mix.
      </p>

      {/* Visual Mix Proportions */}
      <div className="h-14 rounded-lg overflow-hidden mb-6 flex shadow-inner">
        <div 
          className="bg-blue-400 flex items-center justify-center text-xs text-white font-bold transition-all duration-300"
          style={{ width: `${ratios.water}%` }}
        >
          {ratios.water > 10 && `Water ${ratios.water}%`}
        </div>
        <div 
          className="bg-gray-400 flex items-center justify-center text-xs text-white font-bold transition-all duration-300"
          style={{ width: `${ratios.cement}%` }}
        >
          {ratios.cement > 10 && `Cement ${ratios.cement}%`}
        </div>
        <div 
          className="bg-stone-500 flex items-center justify-center text-xs text-white font-bold transition-all duration-300"
          style={{ width: `${ratios.aggregate}%` }}
        >
          {ratios.aggregate > 10 && `Aggregate ${ratios.aggregate}%`}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs text-stone-600 dark:text-stone-400 mb-1">
            Water (parts)
          </label>
          <input 
            type="range" 
            min="5" 
            max="50" 
            value={water} 
            onChange={(e) => setWater(Number(e.target.value))} 
            className="w-full accent-blue-500" 
          />
          <div className="text-center font-mono text-sm text-stone-700 dark:text-stone-300">{water}</div>
        </div>
        <div>
          <label className="block text-xs text-stone-600 dark:text-stone-400 mb-1">
            Cement (parts)
          </label>
          <input 
            type="range" 
            min="5" 
            max="50" 
            value={cement} 
            onChange={(e) => setCement(Number(e.target.value))} 
            className="w-full accent-gray-500" 
          />
          <div className="text-center font-mono text-sm text-stone-700 dark:text-stone-300">{cement}</div>
        </div>
        <div>
          <label className="block text-xs text-stone-600 dark:text-stone-400 mb-1">
            Aggregate (parts)
          </label>
          <input 
            type="range" 
            min="20" 
            max="80" 
            value={aggregate} 
            onChange={(e) => setAggregate(Number(e.target.value))} 
            className="w-full accent-stone-600" 
          />
          <div className="text-center font-mono text-sm text-stone-700 dark:text-stone-300">{aggregate}</div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-stone-200 dark:border-stone-700 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Water-Cement Ratio</div>
          <div className={`text-2xl font-bold ${
            waterCementRatio < 0.5 ? 'text-green-600 dark:text-green-400' :
            waterCementRatio < 0.6 ? 'text-yellow-600 dark:text-yellow-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            {waterCementRatio}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {waterCementRatio < 0.5 ? '✓ Good for strength' :
             waterCementRatio < 0.6 ? '⚠ Acceptable' :
             '⚠ May reduce strength'}
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-stone-200 dark:border-stone-700 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Est. Strength</div>
          <div className={`text-2xl font-bold ${
            estimatedStrength.grade === 'High' ? 'text-green-600 dark:text-green-400' :
            estimatedStrength.grade === 'Medium-High' ? 'text-blue-600 dark:text-blue-400' :
            estimatedStrength.grade === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            ~{estimatedStrength.value} MPa
          </div>
          <div className="text-xs text-gray-400 mt-1">{estimatedStrength.grade} strength</div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-stone-100 dark:bg-stone-800 rounded-lg text-sm text-stone-700 dark:text-stone-300">
        <strong>Tip:</strong> Lower water-cement ratio generally yields stronger, more durable concrete, 
        but requires proper compaction. Typical ratios range from 0.4 to 0.6.
      </div>
    </div>
  );
};

export default ConcreteMix;
