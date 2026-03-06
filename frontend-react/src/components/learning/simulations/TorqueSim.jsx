/**
 * Torque Simulator
 * Demonstrate torque as force × distance
 */

import React, { useState, useMemo } from 'react';

const TorqueSim = ({ 
  initialForce = 50, 
  initialDistance = 5 
}) => {
  const [force, setForce] = useState(initialForce);
  const [distance, setDistance] = useState(initialDistance);

  const torque = useMemo(() => force * distance, [force, distance]);
  const rotation = useMemo(() => Math.min(torque * 0.05, 15), [torque]);

  return (
    <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl p-6 my-8">
      <h4 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-4">
        Torque (Moment) Simulator
      </h4>
      <p className="text-rose-700 dark:text-rose-300 mb-6 text-sm">
        Torque is the tendency of a force to rotate an object about an axis. 
        Adjust the force and distance to see how torque changes.
      </p>

      {/* Visualization */}
      <div className="relative h-40 bg-white dark:bg-slate-800 rounded-lg border border-rose-200 dark:border-rose-700 mb-6 flex items-center overflow-hidden">
        {/* Pivot Point */}
        <div className="absolute left-10 w-6 h-6 bg-gray-800 dark:bg-gray-200 rounded-full z-10 shadow-lg"></div>
        
        {/* Lever Arm */}
        <div 
          className="absolute left-12 h-3 bg-gradient-to-r from-gray-400 to-gray-300 dark:from-gray-600 dark:to-gray-500 origin-left rounded transition-transform duration-300"
          style={{ 
            width: '220px', 
            transform: `rotate(${rotation}deg)` 
          }}
        >
          {/* Force Arrow */}
          <div 
            className="absolute top-0 w-2 h-14 bg-rose-500 transition-all duration-300"
            style={{ left: `${distance * 20 - 4}px` }}
          >
            <div className="absolute -bottom-2 -left-1.5 w-4 h-4 border-b-4 border-r-4 border-rose-500 transform rotate-45"></div>
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
              F = {force}N
            </span>
          </div>
        </div>

        {/* Distance Marker */}
        <div 
          className="absolute bottom-4 flex flex-col items-center"
          style={{ left: `${52 + distance * 20}px` }}
        >
          <div className="w-px h-4 bg-gray-400"></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{distance}m</span>
        </div>

        {/* Rotation Indicator */}
        <div className="absolute right-4 top-4 text-sm text-gray-500 dark:text-gray-400">
          Rotation: {rotation.toFixed(1)}°
        </div>
      </div>
      
      {/* Controls */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm text-rose-700 dark:text-rose-300 mb-1">
            Force (N)
          </label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={force} 
            onChange={(e) => setForce(Number(e.target.value))} 
            className="w-full accent-rose-600" 
          />
          <div className="text-center font-mono text-rose-800 dark:text-rose-200">
            {force} N
          </div>
        </div>
        <div>
          <label className="block text-sm text-rose-700 dark:text-rose-300 mb-1">
            Distance (m)
          </label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={distance} 
            onChange={(e) => setDistance(Number(e.target.value))} 
            className="w-full accent-rose-600" 
          />
          <div className="text-center font-mono text-rose-800 dark:text-rose-200">
            {distance} m
          </div>
        </div>
      </div>
      
      {/* Result */}
      <div className="text-center bg-white dark:bg-slate-800 p-4 rounded-lg border border-rose-200 dark:border-rose-700">
        <span className="text-gray-500 dark:text-gray-400 mr-2">Torque (M = F × d):</span>
        <span className="text-3xl font-bold text-rose-600 dark:text-rose-400">{torque} N·m</span>
        <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          = {force} N × {distance} m
        </div>
      </div>

      {/* Formula */}
      <div className="mt-4 p-3 bg-rose-100 dark:bg-rose-900/50 rounded-lg text-sm text-rose-800 dark:text-rose-200">
        <strong>Formula:</strong> M = r × F = F × d × sin(θ)
        <br />
        <span className="text-xs">Where θ is the angle between force and lever arm (90° in this case, so sin(90°) = 1)</span>
      </div>
    </div>
  );
};

export default TorqueSim;
