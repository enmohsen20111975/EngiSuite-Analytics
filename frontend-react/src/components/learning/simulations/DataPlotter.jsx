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
import { getThemeColor } from '../../../lib/utils';

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
    <div className="bg-accent/10 dark:bg-accent/20 border border-accent/20 dark:border-accent/30 rounded-xl p-6 my-8">
      <h4 className="text-xl font-semibold text-accent-hover dark:text-accent mb-4">
        {title}
      </h4>
      <p className="text-accent-hover dark:text-accent/80 mb-6 text-sm">
        Damped harmonic oscillation: y = 100 × e<sup>-ζt</sup> × sin(ωt)
      </p>

      {/* Chart */}
      <div className="h-64 w-full bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 border border-indigo-100 dark:border-accent/30">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={plotData}>
            <CartesianGrid strokeDasharray="3 3" stroke={getThemeColor('--color-border', '#e5e7eb')} />
            <XAxis 
              dataKey="time" 
              label={{ value: xLabel, position: 'insideBottom', offset: -5, fill: getThemeColor('--color-text-secondary', '#6b7280') }}
              stroke={getThemeColor('--color-text-muted', '#9ca3af')}
            />
            <YAxis 
              label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: getThemeColor('--color-text-secondary', '#6b7280') }}
              stroke={getThemeColor('--color-text-muted', '#9ca3af')}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: getThemeColor('--color-bg-primary', 'rgba(255,255,255,0.95)'),
                border: `1px solid ${getThemeColor('--color-border', '#e5e7eb')}`,
                borderRadius: '8px',
                color: getThemeColor('--color-text-primary', '#111827')
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={getThemeColor('--color-accent', '#0891b2')} 
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
          <label className="block text-sm text-accent-hover dark:text-accent/80 mb-1">
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
          <label className="block text-sm text-accent-hover dark:text-accent/80 mb-1">
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
          <span className="ml-2 font-medium text-accent-hover dark:text-accent/80">
            {damp < 0.1 ? 'Underdamped' : damp < 0.9 ? 'Underdamped' : damp === 1 ? 'Critically Damped' : 'Overdamped'}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-800 p-2 rounded-lg">
          <span className="text-gray-500 dark:text-gray-400">Period:</span>
          <span className="ml-2 font-medium text-accent-hover dark:text-accent/80">
            {(2 * Math.PI / freq).toFixed(2)}s
          </span>
        </div>
        <div className="bg-white dark:bg-slate-800 p-2 rounded-lg">
          <span className="text-gray-500 dark:text-gray-400">Decay Rate:</span>
          <span className="ml-2 font-medium text-accent-hover dark:text-accent/80">
            {damp.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DataPlotter;
