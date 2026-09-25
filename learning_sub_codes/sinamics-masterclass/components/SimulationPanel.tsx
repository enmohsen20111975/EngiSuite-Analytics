
import React, { useState, useEffect, useRef } from 'react';
import { SimulationState } from '../types';
import { Play, Square, RotateCw, Gauge, Zap, Thermometer, Weight, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const SimulationPanel: React.FC = () => {
  const [simState, setSimState] = useState<SimulationState>({
    isRunning: false,
    frequency: 0,
    voltage: 0,
    current: 0,
    rpm: 0,
    setpointHz: 50,
    temperature: 25,
  });

  const [loadTorque, setLoadTorque] = useState(20); // % Load
  const [controlMode, setControlMode] = useState<'VF' | 'SLVC'>('VF'); // V/f vs Vector

  // Data for the live chart
  const [chartData, setChartData] = useState<{ time: number; rpm: number; current: number; torque: number }[]>([]);
  const timeRef = useRef(0);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setSimState((prev) => {
        let newFreq = prev.frequency;
        let newTemp = prev.temperature;

        // Ramp logic
        const rampRate = controlMode === 'SLVC' ? 4.0 : 2.0; // Vector is faster
        
        if (prev.isRunning) {
          if (prev.frequency < prev.setpointHz) {
            newFreq = Math.min(prev.setpointHz, prev.frequency + rampRate);
          } else if (prev.frequency > prev.setpointHz) {
            newFreq = Math.max(prev.setpointHz, prev.frequency - rampRate);
          }
          // Temp rises when running + load effect
          const heatRise = 0.05 + (loadTorque / 100) * 0.1;
          newTemp = Math.min(85, prev.temperature + heatRise); 
        } else {
          // Coast to stop
          newFreq = Math.max(0, prev.frequency - 1.0);
          // Cool down
          newTemp = Math.max(25, prev.temperature - 0.2);
        }

        // Physics approximate calculations
        const vPerHz = 400 / 50; 
        const newVolts = Math.min(400, newFreq * vPerHz);
        
        // Slip Calculation
        const syncSpeed = (120 * newFreq) / 4; // 4 pole motor
        // Base slip is 50RPM at full load (approx 3%)
        // V/f has linear slip error. SLVC compensates for slip.
        const baseSlip = 50 * (loadTorque / 100); 
        const slip = controlMode === 'VF' ? baseSlip : (baseSlip * 0.1); // SLVC compensates 90%
        
        const newRpm = Math.max(0, syncSpeed - slip);
        
        // Current Calculation
        const magnetizingCurrent = 2.0;
        const torqueCurrent = (loadTorque / 100) * 4.0;
        let newCurrent = 0;
        if (newFreq > 1) {
             // In V/f, current can spike if slip is high (stalling)
             const slipFactor = controlMode === 'VF' && loadTorque > 90 ? 1.5 : 1.0;
             newCurrent = Math.sqrt(Math.pow(magnetizingCurrent, 2) + Math.pow(torqueCurrent * slipFactor, 2));
        }

        return {
          ...prev,
          frequency: newFreq,
          voltage: newVolts,
          rpm: newRpm,
          current: newCurrent,
          temperature: newTemp
        };
      });

      // Update Chart Data
      timeRef.current += 1;
      setChartData((prevData) => {
        const newData = [...prevData, { 
            time: timeRef.current, 
            rpm: Math.round(simState.rpm), 
            current: Number(simState.current.toFixed(1)),
            torque: loadTorque
        }];
        if (newData.length > 60) newData.shift();
        return newData;
      });

    }, 100);

    return () => clearInterval(interval);
  }, [simState.isRunning, simState.setpointHz, simState.frequency, loadTorque, controlMode]);


  const handleStartStop = () => {
    setSimState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ActivityIcon className="text-cyan-600" /> Dynamic Drive Lab
          </h2>
          <p className="text-sm text-slate-500">Test G120 behaviour under load in different control modes.</p>
        </div>
        <div className="flex items-center gap-3">
             <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                <button 
                    onClick={() => setControlMode('VF')}
                    className={`px-3 py-1 text-xs font-bold rounded transition-colors ${controlMode === 'VF' ? 'bg-cyan-100 text-cyan-800' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    V/f Control
                </button>
                <button 
                    onClick={() => setControlMode('SLVC')}
                    className={`px-3 py-1 text-xs font-bold rounded transition-colors ${controlMode === 'SLVC' ? 'bg-cyan-100 text-cyan-800' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    SLVC (Vector)
                </button>
             </div>
             <div className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide border ${simState.isRunning ? 'bg-green-100 text-green-700 border-green-200 animate-pulse' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
                {simState.isRunning ? 'RUNNING' : 'STOPPED'}
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Control Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-1 space-y-8">
          
          {/* Main Controls */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Drive Command</label>
            <button 
                onClick={handleStartStop}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all shadow-sm ${
                    simState.isRunning 
                    ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:shadow-md' 
                    : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 hover:shadow-md'
                }`}
            >
                {simState.isRunning ? <><Square size={20} fill="currentColor" /> STOP DRIVE</> : <><Play size={20} fill="currentColor" /> START DRIVE</>}
            </button>
          </div>

          {/* Sliders */}
          <div className="space-y-6">
              <div className="space-y-3">
                 <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <RotateCw size={14} /> Frequency Setpoint
                    </label>
                    <span className="font-mono font-bold text-cyan-600">{simState.setpointHz} Hz</span>
                 </div>
                 <input 
                    type="range" 
                    min="0" 
                    max="60" 
                    step="1" 
                    value={simState.setpointHz} 
                    onChange={(e) => setSimState(prev => ({...prev, setpointHz: Number(e.target.value)}))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                 />
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                 <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <Weight size={14} /> Mechanical Load
                    </label>
                    <span className="font-mono font-bold text-orange-600">{loadTorque}%</span>
                 </div>
                 <input 
                    type="range" 
                    min="0" 
                    max="120" 
                    step="5" 
                    value={loadTorque} 
                    onChange={(e) => setLoadTorque(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                 />
                 <p className="text-[10px] text-slate-400">Higher load increases slip (in V/f) and current consumption.</p>
              </div>
          </div>

          {/* Digital Output */}
          <div className="grid grid-cols-2 gap-3 pt-2">
             <DataCard label="DC Link" value={(simState.voltage * 1.35).toFixed(0)} unit="V" icon={<Zap size={14} className="text-yellow-500"/>} />
             <DataCard label="Current" value={simState.current.toFixed(1)} unit="A" icon={<ActivityIcon size={14} className="text-blue-500"/>} />
             <DataCard label="Motor Temp" value={simState.temperature.toFixed(1)} unit="°C" icon={<Thermometer size={14} className="text-red-500"/>} />
             <DataCard label="Act. Freq" value={simState.frequency.toFixed(1)} unit="Hz" icon={<TrendingUp size={14} className="text-slate-500"/>} />
          </div>
        </div>

        {/* Visualizer & Charts */}
        <div className="flex flex-col gap-6 lg:col-span-2 h-full">
            
            {/* Visualizer */}
            <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden flex flex-col h-64">
                <div className="absolute top-4 right-4 z-10 text-right">
                    <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Actual Speed</div>
                    <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-lg tracking-tighter">
                        {Math.round(simState.rpm)} <span className="text-lg text-cyan-600 font-normal">RPM</span>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                    {/* Motor Housing */}
                     <div className="relative w-40 h-40 rounded-full border-[6px] border-slate-600 bg-slate-800 flex items-center justify-center shadow-2xl">
                        {/* Cooling Fins */}
                        <div className="absolute w-full h-full rounded-full border-4 border-slate-700 opacity-50"></div>
                        
                        {/* Rotor */}
                        <div 
                            className="w-28 h-28 rounded-full border-4 border-dashed border-slate-400/50 flex items-center justify-center"
                            style={{ 
                                transform: `rotate(${timeRef.current * (simState.rpm / 60) * 6}deg)`, 
                                transition: 'transform 0.1s linear' // Smoother visual update
                            }} 
                        >
                            <div className="w-2 h-2 bg-cyan-500 rounded-full absolute top-2"></div>
                            <div className="w-24 h-2 bg-slate-600/50 rounded-full"></div>
                            <div className="w-2 h-24 bg-slate-600/50 rounded-full"></div>
                        </div>

                        {/* Shaft */}
                        <div className="absolute w-8 h-8 bg-slate-300 rounded-full border-2 border-slate-400 shadow-inner z-10 flex items-center justify-center">
                            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                        </div>
                     </div>
                </div>
            </div>
            
            {/* Live Chart */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 shadow-sm min-h-[300px]">
                 <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Real-time Telemetry</h3>
                 <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="time" hide />
                        <YAxis yAxisId="left" label={{ value: 'RPM', angle: -90, position: 'insideLeft' }} domain={[0, 1800]} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: 'Amps', angle: 90, position: 'insideRight' }} domain={[0, 10]} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ display: 'none' }}
                        />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="rpm" stroke="#0891b2" strokeWidth={2} name="Speed (RPM)" dot={false} isAnimationActive={false} />
                        <Line yAxisId="right" type="monotone" dataKey="current" stroke="#f59e0b" strokeWidth={2} name="Current (A)" dot={false} isAnimationActive={false} />
                    </LineChart>
                 </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

const DataCard = ({ label, value, unit, icon }: { label: string, value: string, unit: string, icon: React.ReactNode }) => (
    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-center">
        <div className="flex items-center gap-1.5 mb-1 opacity-80">
            {icon}
            <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
        </div>
        <div className="text-xl font-mono font-bold text-slate-700 tracking-tight">
            {value}<span className="text-xs text-slate-400 ml-1 font-sans font-normal">{unit}</span>
        </div>
    </div>
);

const ActivityIcon = ({ size, className }: { size?: number, className?: string }) => (
    <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);

export default SimulationPanel;
