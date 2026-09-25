/**
 * AC Sine Wave Simulation
 * Visualization of alternating current voltage waveform
 */

import React, { useState, useMemo } from 'react';
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

const SineWave = ({
  peakVoltage = 170,
  frequency = 60,
  showRMS = true
}) => {
  const [freq, setFreq] = useState(frequency);
  const [peak, setPeak] = useState(peakVoltage);

  // Calculate RMS value
  const rmsVoltage = useMemo(() => (peak / Math.sqrt(2)).toFixed(1), [peak]);
  
  // Calculate period
  const period = useMemo(() => (1000 / freq).toFixed(2), [freq]);

  // Generate wave data for 2 complete cycles
  const waveData = useMemo(() => {
    const points = 200;
    const cycles = 2;
    return Array.from({ length: points }, (_, i) => {
      const t = (i / points) * cycles * (1000 / freq); // time in ms
      const voltage = peak * Math.sin((i / points) * cycles * 2 * Math.PI);
      return {
        time: t.toFixed(2),
        voltage: voltage.toFixed(1),
        rms: parseFloat(rmsVoltage)
      };
    });
  }, [freq, peak, rmsVoltage]);

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 my-8 shadow-sm">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
        AC Voltage Sine Wave
      </h4>
      <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
        Visualization of alternating current waveform with adjustable frequency and amplitude
      </p>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            Peak Voltage (Vp): {peak}V
          </label>
          <input
            type="range"
            min="50"
            max="340"
            value={peak}
            onChange={(e) => setPeak(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            Frequency (f): {freq}Hz
          </label>
          <input
            type="range"
            min="1"
            max="120"
            value={freq}
            onChange={(e) => setFreq(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={waveData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              label={{ value: 'Time (ms)', position: 'insideBottom', offset: -10 }}
              stroke="#9ca3af"
            />
            <YAxis 
              domain={[-peak * 1.2, peak * 1.2]}
              label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft' }}
              stroke="#9ca3af"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255,255,255,0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value, name) => [`${value}V`, name === 'voltage' ? 'Instantaneous' : 'RMS']}
            />
            {showRMS && (
              <>
                <ReferenceLine y={parseFloat(rmsVoltage)} stroke="#10b981" strokeDasharray="5 5" />
                <ReferenceLine y={-parseFloat(rmsVoltage)} stroke="#10b981" strokeDasharray="5 5" />
              </>
            )}
            <Line 
              type="monotone" 
              dataKey="voltage" 
              stroke="#3b82f6" 
              strokeWidth={2} 
              dot={false} 
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Info Panel */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg text-center">
          <div className="text-xs text-blue-600 dark:text-blue-400 uppercase">Peak Voltage</div>
          <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{peak}V</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg text-center">
          <div className="text-xs text-green-600 dark:text-green-400 uppercase">RMS Voltage</div>
          <div className="text-xl font-bold text-green-700 dark:text-green-300">{rmsVoltage}V</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg text-center">
          <div className="text-xs text-purple-600 dark:text-purple-400 uppercase">Frequency</div>
          <div className="text-xl font-bold text-purple-700 dark:text-purple-300">{freq}Hz</div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg text-center">
          <div className="text-xs text-amber-600 dark:text-amber-400 uppercase">Period</div>
          <div className="text-xl font-bold text-amber-700 dark:text-amber-300">{period}ms</div>
        </div>
      </div>

      {/* Formula */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg text-center text-sm">
        <span className="text-gray-600 dark:text-gray-300">
          <strong>V(t) = Vp × sin(2πft)</strong> where Vp = {peak}V, f = {freq}Hz
        </span>
        {showRMS && (
          <span className="ml-4 text-green-600 dark:text-green-400">
            <strong>Vrms = Vp / √2 = {rmsVoltage}V</strong>
          </span>
        )}
      </div>
    </div>
  );
};

export default SineWave;
