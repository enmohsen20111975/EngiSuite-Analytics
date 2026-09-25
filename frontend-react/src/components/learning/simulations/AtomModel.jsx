/**
 * Atomic Structure Animation
 * Animated visualization of atomic structure with electron orbits
 */

import React from 'react';

const AtomModel = ({ element = 'Copper', atomicNumber = 29 }) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 my-8">
      <h4 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Atomic Structure
      </h4>
      <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
        Visualization of atomic structure showing the nucleus (protons and neutrons) and orbiting electrons
      </p>
      
      {/* Atom Visualization */}
      <div className="relative w-full h-72 flex items-center justify-center overflow-hidden bg-slate-900 rounded-lg">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-radial from-blue-900/20 to-transparent"></div>
        
        {/* Nucleus */}
        <div className="relative z-10">
          {/* Protons (red) */}
          <div className="absolute w-4 h-4 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)] -top-1 -left-1"></div>
          <div className="absolute w-4 h-4 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)] top-0 left-2"></div>
          <div className="absolute w-4 h-4 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)] -bottom-1 left-0"></div>
          
          {/* Neutrons (gray) */}
          <div className="absolute w-4 h-4 bg-gray-400 rounded-full shadow-[0_0_10px_rgba(156,163,175,0.6)] top-0 left-0"></div>
          <div className="absolute w-4 h-4 bg-gray-400 rounded-full shadow-[0_0_10px_rgba(156,163,175,0.6)] top-1 left-1"></div>
          <div className="absolute w-4 h-4 bg-gray-400 rounded-full shadow-[0_0_10px_rgba(156,163,175,0.6)] -bottom-1 left-2"></div>
        </div>
        
        {/* Electron Orbits */}
        {/* First shell */}
        <div className="absolute w-24 h-24 border border-blue-500/30 rounded-full animate-[spin_3s_linear_infinite]">
          <div className="w-3 h-3 bg-blue-400 rounded-full absolute -top-1.5 left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
        </div>
        
        {/* Second shell */}
        <div className="absolute w-40 h-40 border border-blue-500/30 rounded-full animate-[spin_4s_linear_infinite_reverse]">
          <div className="w-3 h-3 bg-blue-400 rounded-full absolute -top-1.5 left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
          <div className="w-3 h-3 bg-blue-400 rounded-full absolute -bottom-1.5 left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
        </div>
        
        {/* Third shell */}
        <div className="absolute w-56 h-56 border border-blue-500/30 rounded-full animate-[spin_5s_linear_infinite]">
          <div className="w-3 h-3 bg-blue-400 rounded-full absolute top-1/2 -left-1.5 -translate-y-1/2 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
          <div className="w-3 h-3 bg-blue-400 rounded-full absolute top-1/2 -right-1.5 -translate-y-1/2 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
        </div>
        
        {/* Fourth shell (outermost for conductors) */}
        <div className="absolute w-72 h-72 border border-cyan-500/40 rounded-full animate-[spin_6s_linear_infinite_reverse]">
          <div className="w-3 h-3 bg-cyan-400 rounded-full absolute -top-1.5 left-1/2 -translate-x-1/2 shadow-[0_0_15px_rgba(34,211,238,0.9)] animate-pulse"></div>
          <div className="w-3 h-3 bg-cyan-400 rounded-full absolute top-1/2 -left-1.5 -translate-y-1/2 shadow-[0_0_15px_rgba(34,211,238,0.9)] animate-pulse"></div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
          <span className="text-sm text-slate-600 dark:text-slate-400">Protons (+)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
          <span className="text-sm text-slate-600 dark:text-slate-400">Neutrons (0)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)]"></div>
          <span className="text-sm text-slate-600 dark:text-slate-400">Electrons (-)</span>
        </div>
      </div>
      
      {/* Explanation */}
      <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <h5 className="font-medium text-slate-800 dark:text-white mb-2">Key Concepts:</h5>
        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Conductors:</strong> Materials like copper have 
            loosely bound outer electrons that can move freely, enabling electrical current.
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Insulators:</strong> Materials like rubber have 
            tightly bound electrons that cannot move freely.
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Free Electrons:</strong> The outermost electrons 
            (shown in cyan) are responsible for electrical conductivity.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AtomModel;
