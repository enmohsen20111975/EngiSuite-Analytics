import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Settings, Play, Square, Activity, Info, RotateCcw, Gauge } from 'lucide-react';

const SinamicsPIDLab = () => {
  const [kp, setKp] = useState(1.5);
  const [tn, setTn] = useState(500);
  const [setpoint, setSetpoint] = useState(1000);
  const [isRunning, setIsRunning] = useState(false);
  const [loadDisturbance, setLoadDisturbance] = useState(0);
  
  // Simulation State
  const [data, setData] = useState([]);
  const stateRef = useRef({
    actual: 0,
    integralError: 0,
    time: 0,
    lastError: 0
  });

  useEffect(() => {
    let interval;
    
    if (isRunning) {
      interval = setInterval(() => {
        const dt = 0.05;
        const current = stateRef.current;
        
        // PID Calculation
        const error = setpoint - current.actual;
        
        // Integral term accumulation
        const integralFactor = (tn > 0) ? (dt / (tn / 1000)) : 0;
        current.integralError += ((error + current.lastError) / 2) * integralFactor;
        
        // Anti-windup
        const maxTorque = 2000;
        current.integralError = Math.max(-maxTorque/kp, Math.min(maxTorque/kp, current.integralError));

        const pTerm = kp * error;
        const iTerm = kp * current.integralError;
        
        let outputTorque = pTerm + iTerm;
        
        // Limit output torque
        outputTorque = Math.max(-maxTorque, Math.min(maxTorque, outputTorque));
        
        // Physics Simulation (Motor Inertia)
        const inertia = 0.8;
        const frictionCoeff = 0.15;
        const friction = current.actual * frictionCoeff;
        
        const totalLoadTorque = friction + loadDisturbance;
        
        const acceleration = (outputTorque - totalLoadTorque) / inertia;
        
        current.actual += acceleration * dt;
        current.actual = Math.max(0, current.actual);
        current.time += dt;
        current.lastError = error;

        setData(prev => {
          const newData = [...prev, { 
              time: Number(current.time.toFixed(2)), 
              actual: Math.round(current.actual), 
              setpoint: setpoint,
              torque: Math.round(outputTorque)
          }];
          if (newData.length > 150) newData.shift();
          return newData;
        });

      }, 50);
    }

    return () => clearInterval(interval);
  }, [isRunning, kp, tn, setpoint, loadDisturbance]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    stateRef.current = { actual: 0, integralError: 0, time: 0, lastError: 0 };
    setData([]);
    setLoadDisturbance(0);
  };

  const toggleDisturbance = () => {
     setLoadDisturbance(prev => prev === 0 ? 400 : 0);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-full flex flex-col">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="text-purple-600" /> SINAMICS Speed Controller Lab
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Fine-tune the PI loop (p1460/p1462) and observe response to load changes.</p>
          </div>
          <div className="flex gap-2">
             <button onClick={handleReset} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                <RotateCcw size={16} /> Reset
             </button>
             {!isRunning ? (
                <button onClick={handleStart} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-sm transition-colors">
                    <Play size={16} /> Enable Drive
                </button>
             ) : (
                <button onClick={handleStop} className="px-4 py-2 bg-rose-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-rose-700 shadow-sm transition-colors">
                    <Square size={16} /> OFF1 (Stop)
                </button>
             )}
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Parameters Panel */}
            <div className="lg:col-span-1 space-y-6 bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">Setpoint</label>
                        <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{setpoint} RPM</span>
                    </div>
                    <input type="range" min="0" max="2000" step="50" value={setpoint} onChange={e => setSetpoint(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600" />
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center">
                        <label className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">p1460 (Kp)</label>
                        <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{kp.toFixed(2)}</span>
                    </div>
                    <input type="range" min="0.1" max="15.0" step="0.1" value={kp} onChange={e => setKp(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600" />
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">Proportional Gain: Higher values increase stiffness but can cause "ringing".</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center">
                        <label className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">p1462 (Tn)</label>
                        <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{tn} ms</span>
                    </div>
                    <input type="range" min="10" max="2000" step="10" value={tn} onChange={e => setTn(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600" />
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">Integral Time: Lower values eliminate error faster but can lead to instability.</p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button 
                        onClick={toggleDisturbance}
                        disabled={!isRunning}
                        className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                            loadDisturbance > 0 
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 shadow-inner' 
                            : 'bg-slate-800 dark:bg-slate-600 text-white hover:bg-slate-700 dark:hover:bg-slate-500 disabled:opacity-50'
                        }`}
                    >
                        <Activity size={16} /> {loadDisturbance > 0 ? 'Release Load' : 'Apply Load Shock'}
                    </button>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center">Simulates a sudden mechanical resistance change.</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">Live Status</div>
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Actual</div>
                            <div className="text-xl font-mono font-bold text-slate-800 dark:text-white">{data.length > 0 ? data[data.length-1].actual : 0}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-slate-500 dark:text-slate-400">Torque</div>
                            <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{data.length > 0 ? data[data.length-1].torque : 0} <span className="text-[10px] text-slate-400 dark:text-slate-500">Nm</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="lg:col-span-3 flex flex-col gap-4">
                <div className="h-[450px] bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-800 dark:border-slate-900 p-6 relative overflow-hidden">
                    <div className="absolute top-4 left-6 z-10">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                            <Gauge size={14} /> Real-time Speed Scope
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="time" hide />
                            <YAxis 
                                domain={[0, 2200]} 
                                stroke="#475569" 
                                fontSize={10} 
                                tickFormatter={(val) => `${val}`}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }}
                                itemStyle={{ fontSize: '12px' }}
                            />
                            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', paddingBottom: '20px' }} />
                            <Line 
                                name="Setpoint (RPM)"
                                type="stepAfter" 
                                dataKey="setpoint" 
                                stroke="#0ea5e9" 
                                strokeWidth={2} 
                                dot={false} 
                                isAnimationActive={false} 
                            />
                            <Line 
                                name="Actual Speed"
                                type="monotone" 
                                dataKey="actual" 
                                stroke="#a855f7" 
                                strokeWidth={3} 
                                dot={false} 
                                isAnimationActive={false} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-4 flex gap-3">
                    <Info className="text-amber-600 dark:text-amber-400 flex-shrink-0" size={20} />
                    <div className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                        <strong>Tuning Guide:</strong> 
                        <ol className="list-decimal ml-4 mt-1 space-y-1">
                            <li>Set <strong>Kp</strong> to 1.0 and <strong>Tn</strong> to 2000ms (effectively P-only).</li>
                            <li>Increase <strong>Kp</strong> until the system responds quickly to setpoint changes without excessive overshoot.</li>
                            <li>Decrease <strong>Tn</strong> (e.g., to 200ms) to eliminate the "droop" caused by friction or load.</li>
                            <li>Apply a <strong>Load Shock</strong>. If the speed drops and doesn't recover quickly, decrease Tn further. If it oscillates wildly, increase Tn or decrease Kp.</li>
                        </ol>
                    </div>
                </div>
            </div>
       </div>
    </div>
  );
};

export default SinamicsPIDLab;
