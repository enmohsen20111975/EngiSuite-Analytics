/**
 * Projectile Motion Simulator
 * Trajectory visualization with adjustable parameters
 */

import React, { useState, useMemo } from 'react';

const ProjectileMotion = ({
  initialVelocity = 20,
  initialAngle = 45
}) => {
  const [v, setV] = useState(initialVelocity);
  const [angle, setAngle] = useState(initialAngle);
  const g = 9.81;

  const trajectory = useMemo(() => {
    const rad = angle * (Math.PI / 180);
    const tMax = (2 * v * Math.sin(rad)) / g;
    const points = [];
    
    for (let t = 0; t <= tMax; t += tMax / 30) {
      const x = v * Math.cos(rad) * t;
      const y = (v * Math.sin(rad) * t) - (0.5 * g * t * t);
      if (y >= 0) {
        points.push({ x: x * 4, y: y * 4 });
      }
    }
    return points;
  }, [v, angle]);

  const maxDistance = useMemo(() => {
    const rad = angle * (Math.PI / 180);
    return ((v * v * Math.sin(2 * rad)) / g).toFixed(1);
  }, [v, angle]);

  const maxHeight = useMemo(() => {
    const rad = angle * (Math.PI / 180);
    return ((v * v * Math.sin(rad) * Math.sin(rad)) / (2 * g)).toFixed(1);
  }, [v, angle]);

  const svgPath = useMemo(() => {
    if (trajectory.length === 0) return '';
    return trajectory.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${150 - p.y}`).join(' ');
  }, [trajectory]);

  return (
    <div className="bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 rounded-xl p-6 my-8">
      <h4 className="text-xl font-semibold text-sky-900 dark:text-sky-100 mb-4">
        Projectile Motion
      </h4>
      <p className="text-sky-700 dark:text-sky-300 mb-6 text-sm">
        Adjust the initial velocity and launch angle to see how they affect the trajectory.
      </p>

      {/* Trajectory Visualization */}
      <div className="relative w-full h-48 bg-white dark:bg-slate-800 border-b-4 border-l-4 border-gray-800 dark:border-gray-600 rounded-bl-lg mb-6 overflow-hidden">
        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        
        {/* Trajectory Path */}
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          <path 
            d={svgPath} 
            fill="none" 
            stroke="#0ea5e9" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
          {/* Landing point */}
          {trajectory.length > 0 && (
            <circle 
              cx={trajectory[trajectory.length - 1].x} 
              cy={150 - trajectory[trajectory.length - 1].y} 
              r="5" 
              fill="#0284c7" 
            />
          )}
          {/* Launch point */}
          <circle cx="0" cy="150" r="4" fill="#0284c7" />
        </svg>
        
        {/* Angle indicator */}
        <div className="absolute bottom-4 left-4 text-xs text-gray-500 dark:text-gray-400">
          θ = {angle}°
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm text-sky-700 dark:text-sky-300 mb-1">
            Initial Velocity: {v} m/s
          </label>
          <input 
            type="range" 
            min="10" 
            max="40" 
            value={v} 
            onChange={(e) => setV(Number(e.target.value))} 
            className="w-full accent-sky-600" 
          />
        </div>
        <div>
          <label className="block text-sm text-sky-700 dark:text-sky-300 mb-1">
            Launch Angle: {angle}°
          </label>
          <input 
            type="range" 
            min="15" 
            max="85" 
            value={angle} 
            onChange={(e) => setAngle(Number(e.target.value))} 
            className="w-full accent-sky-600" 
          />
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center bg-white dark:bg-slate-800 p-4 rounded-lg border border-sky-200 dark:border-sky-700">
          <span className="text-gray-500 dark:text-gray-400 text-sm">Max Distance (Range)</span>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">{maxDistance} m</div>
          <div className="text-xs text-gray-400">R = v²sin(2θ) / g</div>
        </div>
        <div className="text-center bg-white dark:bg-slate-800 p-4 rounded-lg border border-sky-200 dark:border-sky-700">
          <span className="text-gray-500 dark:text-gray-400 text-sm">Max Height</span>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">{maxHeight} m</div>
          <div className="text-xs text-gray-400">H = v²sin²(θ) / 2g</div>
        </div>
      </div>

      <div className="mt-4 text-sm text-sky-600 dark:text-sky-400 text-center">
        Maximum range is achieved at 45° launch angle
      </div>
    </div>
  );
};

export default ProjectileMotion;
