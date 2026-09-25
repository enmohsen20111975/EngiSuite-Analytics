/**
 * System Response Plotter
 * Configurable damped oscillation visualization
 */

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const DataPlotter = ({
  title = 'System Response',
  xLabel = 'Time',
  yLabel = 'Amplitude',
  dataPoints = 50,
  frequency = 1,
  damping = 0.1
}) => {
  const [freq, setFreq] = useState(frequency);
  const [damp, setDamp] = useState(damping);

  const plotData = useMemo(() => {
    return Array.from({ length: dataPoints }, (_, i) => {
      const t = i * 0.1;
      return {
        time: t.toFixed(1),
        value: Math.exp(-damp * t) * Math.sin(freq * t) * 100
      };
    });
  }, [freq, damp, dataPoints]);

  return (
    <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6 my-8">
      <h4 className="text-xl font-semibold text-indigo-900 dark:text-indigo-100 mb-4">
        {title}
      </h4>
      <p className="text-indigo-700 dark:text-indigo-300 mb-6 text-sm">
        Damped harmonic oscillation: y = 100 × e<sup>-ζt</sup> × sin(ωt)
      </p>

      {/* Chart */}
      <div className="h-64 w-full bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 border border-indigo-100 dark:border-indigo-700">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={plotData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              label={{ value: xLabel, position: 'insideBottom', offset: -5 }}
              stroke="#9ca3af"
            />
            <YAxis 
              label={{ value: yLabel, angle: -90, position: 'insideLeft' }}
              stroke="#9ca3af"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255,255,255,0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#4f46e5" 
              strokeWidth={2} 
              dot={false} 
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-indigo-700 dark:text-indigo-300 mb-1">
            Frequency (ω): {freq.toFixed(1)} rad/s
          </label>
          <input 
            type="range" 
            min="0.5" 
            max="5" 
            step="0.1" 
            value={freq} 
            onChange={(e) => setFreq(Number(e.target.value))} 
            className="w-full accent-indigo-600" 
          />
        </div>
        <div>
          <label className="block text-sm text-indigo-700 dark:text-indigo-300 mb-1">
            Damping (ζ): {damp.toFixed(2)}
          </label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            value={damp} 
            onChange={(e) => setDamp(Number(e.target.value))} 
            className="w-full accent-indigo-600" 
          />
        </div>
      </div>

      {/* System info */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
        <div className="bg-white dark:bg-slate-800 p-2 rounded-lg">
          <span className="text-gray-500 dark:text-gray-400">System Type:</span>
          <span className="ml-2 font-medium text-indigo-700 dark:text-indigo-300">
            {damp < 0.1 ? 'Underdamped' : damp < 0.9 ? 'Underdamped' : damp === 1 ? 'Critically Damped' : 'Overdamped'}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-800 p-2 rounded-lg">
          <span className="text-gray-500 dark:text-gray-400">Period:</span>
          <span className="ml-2 font-medium text-indigo-700 dark:text-indigo-300">
            {(2 * Math.PI / freq).toFixed(2)}s
          </span>
        </div>
        <div className="bg-white dark:bg-slate-800 p-2 rounded-lg">
          <span className="text-gray-500 dark:text-gray-400">Decay Rate:</span>
          <span className="ml-2 font-medium text-indigo-700 dark:text-indigo-300">
            {damp.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DataPlotter;
