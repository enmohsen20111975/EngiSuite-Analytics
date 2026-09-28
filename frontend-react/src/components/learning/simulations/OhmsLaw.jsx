/**
 * Ohm's Law Calculator Simulation
 * Interactive calculator for voltage, current, and resistance relationships
 * 
 * V = I × R
 */

import React, { useState } from 'react';

const OhmsLaw = ({ 
  initialVoltage = 12, 
  initialResistance = 100,
  showExplanation = true 
}) => {
  const [voltage, setVoltage] = useState(initialVoltage);
  const [resistance, setResistance] = useState(initialResistance);

  const current = resistance > 0 ? (voltage / resistance).toFixed(4) : '---';
  const power = resistance > 0 ? ((voltage * voltage) / resistance).toFixed(4) : '---';

  return (
    <div className="bg-accent/10 dark:bg-accent/20 border border-indigo-100 dark:border-accent/30 rounded-xl p-6 my-8">
      <h4 className="text-xl font-semibold text-accent-hover dark:text-accent mb-4">
        Interactive Ohm's Law Calculator
      </h4>
      <p className="text-accent-hover dark:text-accent/80 mb-6 text-sm">
        Adjust the voltage and resistance to see how current changes according to <strong>I = V / R</strong>
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Voltage Input */}
        <div>
          <label className="block text-sm font-medium text-accent-hover dark:text-accent mb-2">
            Voltage (V)
          </label>
          <input 
            type="number" 
            value={voltage} 
            onChange={(e) => setVoltage(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 rounded-lg border border-accent/20 dark:border-accent/30 
                       bg-white dark:bg-slate-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-accent outline-none transition-all"
          />
          <input 
            type="range" 
            min="0" 
            max="240" 
            value={voltage} 
            onChange={(e) => setVoltage(parseFloat(e.target.value))}
            className="w-full mt-2 accent-indigo-600"
          />
        </div>
        
        {/* Resistance Input */}
        <div>
          <label className="block text-sm font-medium text-accent-hover dark:text-accent mb-2">
            Resistance (Ω)
          </label>
          <input 
            type="number" 
            value={resistance} 
            onChange={(e) => setResistance(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 rounded-lg border border-accent/20 dark:border-accent/30 
                       bg-white dark:bg-slate-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-accent outline-none transition-all"
          />
          <input 
            type="range" 
            min="1" 
            max="1000" 
            value={resistance} 
            onChange={(e) => setResistance(parseFloat(e.target.value))}
            className="w-full mt-2 accent-indigo-600"
          />
        </div>
        
        {/* Results */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-accent/20 dark:border-accent/30 p-4 shadow-sm">
          <div className="text-center mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Current (I)
            </span>
            <div className="text-3xl font-bold text-accent dark:text-accent mt-1">
              {current} A
            </div>
          </div>
          <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Power (P)
            </span>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {power} W
            </div>
          </div>
        </div>
      </div>

      {/* Formula Display */}
      <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-accent/20 dark:border-accent/30">
        <div className="flex items-center justify-center space-x-4 text-lg">
          <span className="font-mono text-gray-600 dark:text-gray-300">V</span>
          <span className="text-gray-400">=</span>
          <span className="font-mono text-accent dark:text-accent font-bold">{voltage}</span>
          <span className="text-gray-400">=</span>
          <span className="font-mono text-green-600 dark:text-green-400 font-bold">{current}</span>
          <span className="text-gray-400">×</span>
          <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{resistance}</span>
        </div>
        <div className="flex items-center justify-center space-x-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Voltage</span>
          <span>=</span>
          <span>Current</span>
          <span>×</span>
          <span>Resistance</span>
        </div>
      </div>

      {showExplanation && (
        <div className="mt-4 text-sm text-accent dark:text-accent">
          <p>
            <strong>Ohm's Law:</strong> The current through a conductor between two points is directly 
            proportional to the voltage across the two points and inversely proportional to the resistance between them.
          </p>
        </div>
      )}
    </div>
  );
};

export default OhmsLaw;
