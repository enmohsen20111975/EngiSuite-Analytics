/**
 * Digital Logic Gates Simulation
 * Interactive truth table for AND, OR, XOR gates
 */

import React, { useState, useMemo } from 'react';

const LogicGates = ({ initialGate = 'AND' }) => {
  const [inputA, setInputA] = useState(false);
  const [inputB, setInputB] = useState(false);
  const [gate, setGate] = useState(initialGate);

  // Calculate output based on gate type
  const output = useMemo(() => {
    switch (gate) {
      case 'AND':
        return inputA && inputB;
      case 'OR':
        return inputA || inputB;
      case 'XOR':
        return inputA !== inputB;
      case 'NAND':
        return !(inputA && inputB);
      case 'NOR':
        return !(inputA || inputB);
      case 'XNOR':
        return inputA === inputB;
      default:
        return false;
    }
  }, [gate, inputA, inputB]);

  // Truth table data
  const truthTable = useMemo(() => {
    const inputs = [
      [false, false],
      [false, true],
      [true, false],
      [true, true]
    ];
    
    return inputs.map(([a, b]) => {
      let result;
      switch (gate) {
        case 'AND': result = a && b; break;
        case 'OR': result = a || b; break;
        case 'XOR': result = a !== b; break;
        case 'NAND': result = !(a && b); break;
        case 'NOR': result = !(a || b); break;
        case 'XNOR': result = a === b; break;
        default: result = false;
      }
      return { a, b, result };
    });
  }, [gate]);

  const gateSymbols = {
    'AND': '∧',
    'OR': '∨',
    'XOR': '⊕',
    'NAND': '⊼',
    'NOR': '⊽',
    'XNOR': '⊙'
  };

  return (
    <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl p-6 my-8">
      <h4 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-4">
        Digital Logic Gates
      </h4>
      <p className="text-purple-700 dark:text-purple-300 mb-6 text-sm">
        Toggle the inputs and select a gate to see the truth table in action.
      </p>
      
      <div className="flex flex-col items-center space-y-8">
        {/* Interactive Circuit */}
        <div className="flex items-center space-x-8">
          {/* Inputs */}
          <div className="flex flex-col space-y-4">
            <button 
              onClick={() => setInputA(!inputA)}
              className={`w-14 h-14 rounded-full font-bold text-xl text-white transition-all duration-200 
                ${inputA 
                  ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' 
                  : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                }`}
            >
              {inputA ? '1' : '0'}
            </button>
            <span className="text-center text-sm text-purple-600 dark:text-purple-400">Input A</span>
            
            <button 
              onClick={() => setInputB(!inputB)}
              className={`w-14 h-14 rounded-full font-bold text-xl text-white transition-all duration-200 
                ${inputB 
                  ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' 
                  : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                }`}
            >
              {inputB ? '1' : '0'}
            </button>
            <span className="text-center text-sm text-purple-600 dark:text-purple-400">Input B</span>
          </div>
          
          {/* Connection Lines */}
          <div className="flex flex-col space-y-8">
            <div className={`w-8 h-1 ${inputA ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div className={`w-8 h-1 ${inputB ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          
          {/* Gate */}
          <div className="relative">
            <div className="w-24 h-28 bg-gray-800 dark:bg-gray-900 rounded-lg flex flex-col items-center justify-center text-white shadow-lg">
              <span className="text-3xl font-bold">{gateSymbols[gate]}</span>
              <span className="text-sm mt-1">{gate}</span>
            </div>
            <select 
              value={gate}
              onChange={(e) => setGate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            >
              <option value="AND">AND</option>
              <option value="OR">OR</option>
              <option value="XOR">XOR</option>
              <option value="NAND">NAND</option>
              <option value="NOR">NOR</option>
              <option value="XNOR">XNOR</option>
            </select>
          </div>
          
          {/* Output Line */}
          <div className={`w-8 h-1 ${output ? 'bg-green-500' : 'bg-red-500'}`}></div>
          
          {/* Output */}
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-2xl transition-all duration-200 
              ${output 
                ? 'bg-green-100 dark:bg-green-900/50 border-green-500 text-green-600 dark:text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                : 'bg-red-100 dark:bg-red-900/50 border-red-500 text-red-600 dark:text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              }`}
            >
              {output ? '1' : '0'}
            </div>
            <span className="mt-2 text-sm text-purple-600 dark:text-purple-400">Output</span>
          </div>
        </div>

        {/* Truth Table */}
        <div className="w-full max-w-md">
          <h5 className="text-lg font-medium text-purple-800 dark:text-purple-200 mb-3 text-center">
            Truth Table - {gate} Gate
          </h5>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-purple-200 dark:bg-purple-800">
                <th className="p-2 border border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-200">A</th>
                <th className="p-2 border border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-200">B</th>
                <th className="p-2 border border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-200">Output</th>
              </tr>
            </thead>
            <tbody>
              {truthTable.map((row, idx) => (
                <tr 
                  key={idx}
                  className={`${
                    row.a === inputA && row.b === inputB 
                      ? 'bg-purple-100 dark:bg-purple-900/50' 
                      : 'bg-white dark:bg-slate-800'
                  }`}
                >
                  <td className={`p-2 border border-purple-200 dark:border-purple-700 text-center font-mono
                    ${row.a ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {row.a ? '1' : '0'}
                  </td>
                  <td className={`p-2 border border-purple-200 dark:border-purple-700 text-center font-mono
                    ${row.b ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {row.b ? '1' : '0'}
                  </td>
                  <td className={`p-2 border border-purple-200 dark:border-purple-700 text-center font-mono font-bold
                    ${row.result ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {row.result ? '1' : '0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Gate Explanations */}
        <div className="w-full max-w-md p-4 bg-white dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-purple-700">
          <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Gate Definitions:</h5>
          <div className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
            <p><strong>AND:</strong> Output is 1 only when both inputs are 1</p>
            <p><strong>OR:</strong> Output is 1 when at least one input is 1</p>
            <p><strong>XOR:</strong> Output is 1 when inputs are different</p>
            <p><strong>NAND:</strong> Output is 0 only when both inputs are 1</p>
            <p><strong>NOR:</strong> Output is 1 only when both inputs are 0</p>
            <p><strong>XNOR:</strong> Output is 1 when inputs are the same</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogicGates;
