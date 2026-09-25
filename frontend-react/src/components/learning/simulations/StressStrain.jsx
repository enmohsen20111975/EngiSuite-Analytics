/**
 * Stress-Strain Curve Infographic
 * Material behavior visualization
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const StressStrain = () => {
  // Typical stress-strain data for ductile material (steel)
  const data = [
    { strain: 0, stress: 0, region: 'Origin' },
    { strain: 0.5, stress: 100, region: 'Elastic' },
    { strain: 1, stress: 200, region: 'Elastic' },
    { strain: 1.5, stress: 220, region: 'Yield' },
    { strain: 2, stress: 230, region: 'Plastic' },
    { strain: 3, stress: 280, region: 'Strain Hardening' },
    { strain: 4, stress: 320, region: 'Ultimate' },
    { strain: 5, stress: 300, region: 'Necking' },
    { strain: 6, stress: 250, region: 'Fracture' }
  ];

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-700 rounded-xl p-6 my-8">
      <h4 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
        Stress-Strain Curve
      </h4>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
        A typical stress-strain curve for ductile materials (like steel), showing the 
        elastic and plastic deformation regions.
      </p>

      {/* Chart */}
      <div className="h-72 w-full bg-white dark:bg-slate-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="strain" 
              label={{ value: 'Strain (ε)', position: 'insideBottom', offset: -10 }}
              stroke="#9ca3af"
            />
            <YAxis 
              label={{ value: 'Stress (σ) MPa', angle: -90, position: 'insideLeft' }}
              stroke="#9ca3af"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255,255,255,0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value, name, props) => [
                `${value} MPa`, 
                `Stress (${props.payload.region})`
              ]}
            />
            <ReferenceLine x={1.5} stroke="#ef4444" strokeDasharray="5 5" />
            <ReferenceLine x={4} stroke="#f59e0b" strokeDasharray="5 5" />
            <Line 
              type="monotone" 
              dataKey="stress" 
              stroke="#52525b" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#52525b' }}
              activeDot={{ r: 6, fill: '#18181b' }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Region Labels */}
        <div className="absolute top-8 left-16 text-xs font-bold text-blue-600 dark:text-blue-400 bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded">
          Elastic Region
        </div>
        <div className="absolute top-16 right-24 text-xs font-bold text-red-600 dark:text-red-400 bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded">
          Plastic Region
        </div>
      </div>

      {/* Key Points */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">Yield Point</div>
          <div className="font-bold text-zinc-700 dark:text-zinc-300">~220 MPa</div>
          <div className="text-xs text-gray-400">End of elastic behavior</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">Ultimate Strength</div>
          <div className="font-bold text-zinc-700 dark:text-zinc-300">~320 MPa</div>
          <div className="text-xs text-gray-400">Maximum stress</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">Fracture Point</div>
          <div className="font-bold text-zinc-700 dark:text-zinc-300">~250 MPa</div>
          <div className="text-xs text-gray-400">Material failure</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">Young's Modulus</div>
          <div className="font-bold text-zinc-700 dark:text-zinc-300">~200 GPa</div>
          <div className="text-xs text-gray-400">E = σ/ε (slope)</div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm text-zinc-700 dark:text-zinc-300">
        <strong>Key Concepts:</strong>
        <ul className="mt-2 space-y-1 text-xs">
          <li>• <strong>Elastic Region:</strong> Material returns to original shape when load is removed</li>
          <li>• <strong>Yield Point:</strong> Transition from elastic to plastic deformation</li>
          <li>• <strong>Plastic Region:</strong> Permanent deformation occurs</li>
          <li>• <strong>Strain Hardening:</strong> Material becomes stronger with deformation</li>
          <li>• <strong>Necking:</strong> Localized reduction in cross-section before fracture</li>
        </ul>
      </div>
    </div>
  );
};

export default StressStrain;
