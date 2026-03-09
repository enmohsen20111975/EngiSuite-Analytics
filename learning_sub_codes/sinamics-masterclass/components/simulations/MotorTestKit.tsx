
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Play, Square, RotateCw, Settings2, TrendingUp, Zap, Info, RefreshCw, Sliders } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MotorTestKit: React.FC = () => {
  // Controller Parameters
  const [kp, setKp] = useState(1.5); // Speed Controller Gain
  const [tn, setTn] = useState(0.2); // Speed Controller Integral Time (s)
  const [inertia, setInertia] = useState(0.05); // Motor + Load Inertia (kgm^2)
  const [loadTorque, setLoadTorque] = useState(5); // Constant load (Nm)
  const [setpoint, setSetpoint] = useState(1000); // Target RPM
  
  // Simulation State
  const [isRunning, setIsRunning] = useState(false);
  const [actualSpeed, setActualSpeed] = useState(0);
  const [actualTorque, setActualTorque] = useState(0);
  const [actualCurrent, setActualCurrent] = useState(0);
  const [integralError, setIntegralError] = useState(0);
  
  // Chart Data
  const [chartData, setChartData] = useState<{ time: number; setpoint: number; actual: number; torque: number; current: number }[]>([]);
  const timeRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

  const resetSimulation = () => {
    setActualSpeed(0);
    setActualTorque(0);
    setActualCurrent(0);
    setIntegralError(0);
    setChartData([]);
    timeRef.current = 0;
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTimeRef.current) / 1000; // Delta time in seconds
      lastTimeRef.current = now;

      if (dt <= 0) return;

      // --- PI SPEED CONTROLLER SIMULATION ---
      const error = setpoint - actualSpeed;
      
      // Integral part (with anti-windup)
      let newIntegral = integralError + error * dt;
      const maxIntegral = 50; // Simple anti-windup limit
      newIntegral = Math.max(-maxIntegral, Math.min(maxIntegral, newIntegral));
      setIntegralError(newIntegral);

      // PI Output (Torque Command)
      let torqueCmd = kp * error + (1 / Math.max(0.01, tn)) * newIntegral;
      
      // Torque Limit (p0640 / p1520)
      const torqueLimit = 30; // Nm
      torqueCmd = Math.max(-torqueLimit, Math.min(torqueLimit, torqueCmd));

      // --- MOTOR PHYSICS MODEL ---
      // T_acc = T_motor - T_load = J * d(omega)/dt
      // d(omega)/dt = (T_motor - T_load) / J
      // omega = 2 * PI * RPM / 60
      // d(RPM)/dt = (T_motor - T_load) * 60 / (2 * PI * J)
      
      const friction = actualSpeed * 0.005; // Simple friction proportional to speed
      const netTorque = torqueCmd - loadTorque - friction;
      const acceleration = (netTorque * 60) / (2 * Math.PI * Math.max(0.001, inertia));
      
      const newSpeed = Math.max(0, actualSpeed + acceleration * dt);
      
      // Current is roughly proportional to torque + magnetizing current
      const i_mag = 2.0;
      const i_torque = Math.abs(torqueCmd) * 0.4;
      const newCurrent = Math.sqrt(Math.pow(i_mag, 2) + Math.pow(i_torque, 2));

      setActualSpeed(newSpeed);
      setActualTorque(torqueCmd);
      setActualCurrent(newCurrent);

      // Update Chart
      timeRef.current += dt;
      setChartData(prev => {
        const newData = [...prev, {
          time: Number(timeRef.current.toFixed(2)),
          setpoint: setpoint,
          actual: Math.round(newSpeed),
          torque: Number(torqueCmd.toFixed(1)),
          current: Number(newCurrent.toFixed(1))
        }];
        if (newData.length > 100) newData.shift();
        return newData;
      });

    }, 50);

    return () => clearInterval(interval);
  }, [isRunning, setpoint, kp, tn, inertia, loadTorque, actualSpeed, integralError]);

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
             <Sliders className="text-cyan-600" /> Motor Simulation Test Kit
          </h2>
          <p className="text-sm text-slate-500">Experiment with PI tuning, inertia, and load response in real-time.</p>
        </div>
        
        <div className="flex items-center gap-3">
             <button 
                onClick={resetSimulation}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
             >
                <RefreshCw size={16} /> Reset
             </button>
             <div className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide border transition-colors ${isRunning ? 'bg-green-100 text-green-700 border-green-200 animate-pulse' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
                {isRunning ? 'SIMULATING' : 'PAUSED'}
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
        
        {/* Parameters Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 xl:col-span-1 space-y-6 h-fit">
          <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-4">
            <Settings2 size={14} /> Controller Tuning
          </h3>

          <div className="space-y-6">
            {/* Kp Slider */}
            <div className="space-y-2">
               <div className="flex justify-between">
                  <label className="text-xs font-bold text-slate-600">Gain (Kp)</label>
                  <span className="text-xs font-mono font-bold text-cyan-600">{kp.toFixed(2)}</span>
               </div>
               <input 
                  type="range" min="0.1" max="10" step="0.1" 
                  value={kp} 
                  onChange={(e) => setKp(Number(e.target.value))} 
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-cyan-600"
               />
               <p className="text-[10px] text-slate-400">Higher Kp = Faster response, but more overshoot.</p>
            </div>

            {/* Tn Slider */}
            <div className="space-y-2">
               <div className="flex justify-between">
                  <label className="text-xs font-bold text-slate-600">Integral Time (Tn)</label>
                  <span className="text-xs font-mono font-bold text-cyan-600">{tn.toFixed(2)} s</span>
               </div>
               <input 
                  type="range" min="0.01" max="2" step="0.01" 
                  value={tn} 
                  onChange={(e) => setTn(Number(e.target.value))} 
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-cyan-600"
               />
               <p className="text-[10px] text-slate-400">Lower Tn = Faster error correction, but can oscillate.</p>
            </div>

            <div className="h-px bg-slate-100 my-4"></div>

            <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-4">
              <Activity size={14} /> Physical Model
            </h3>

            {/* Inertia Slider */}
            <div className="space-y-2">
               <div className="flex justify-between">
                  <label className="text-xs font-bold text-slate-600">Total Inertia (J)</label>
                  <span className="text-xs font-mono font-bold text-orange-600">{inertia.toFixed(3)} kgm²</span>
               </div>
               <input 
                  type="range" min="0.001" max="0.5" step="0.001" 
                  value={inertia} 
                  onChange={(e) => setInertia(Number(e.target.value))} 
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
               />
            </div>

            {/* Load Slider */}
            <div className="space-y-2">
               <div className="flex justify-between">
                  <label className="text-xs font-bold text-slate-600">Static Load</label>
                  <span className="text-xs font-mono font-bold text-orange-600">{loadTorque} Nm</span>
               </div>
               <input 
                  type="range" min="0" max="25" step="1" 
                  value={loadTorque} 
                  onChange={(e) => setLoadTorque(Number(e.target.value))} 
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
               />
            </div>
          </div>

          <div className="pt-6">
            <button 
                onClick={() => {
                    setIsRunning(!isRunning);
                    lastTimeRef.current = Date.now();
                }}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all shadow-sm ${isRunning ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}
            >
                {isRunning ? <><Square size={18} fill="currentColor" /> PAUSE TEST</> : <><Play size={18} fill="currentColor" /> START TEST</>}
            </button>
          </div>
        </div>

        {/* Main Simulation Area */}
        <div className="xl:col-span-3 flex flex-col gap-6">
            
            {/* Top Row: Visualizer & Setpoint */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Speed Setpoint Control */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1 flex flex-col justify-center">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-4 block">Speed Setpoint (Step)</label>
                    <div className="flex items-center gap-4">
                        <input 
                            type="number" 
                            value={setpoint} 
                            onChange={(e) => setSetpoint(Number(e.target.value))}
                            className="flex-1 text-3xl font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3 focus:outline-cyan-500"
                        />
                        <span className="text-slate-400 font-bold">RPM</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {[0, 750, 1500].map(val => (
                            <button 
                                key={val}
                                onClick={() => setSetpoint(val)}
                                className="py-2 text-xs font-bold bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Live Gauges */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-lg lg:col-span-2 grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center justify-center border-r border-slate-800">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Actual Speed</div>
                        <div className="text-3xl font-mono font-bold text-cyan-400">{Math.round(actualSpeed)}</div>
                        <div className="text-[10px] text-cyan-600">RPM</div>
                    </div>
                    <div className="flex flex-col items-center justify-center border-r border-slate-800">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Torque</div>
                        <div className="text-3xl font-mono font-bold text-orange-400">{actualTorque.toFixed(1)}</div>
                        <div className="text-[10px] text-orange-600">Nm</div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Current</div>
                        <div className="text-3xl font-mono font-bold text-yellow-400">{actualCurrent.toFixed(1)}</div>
                        <div className="text-[10px] text-yellow-600">Amps</div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
                
                {/* Speed Step Response Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[350px]">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-6 flex items-center gap-2">
                        <TrendingUp size={14} /> Step Response (Speed)
                    </h3>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="time" hide />
                                <YAxis domain={[0, 1800]} tick={{fontSize: 10}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ display: 'none' }}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                <Line type="monotone" dataKey="setpoint" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={1} name="Setpoint" dot={false} isAnimationActive={false} />
                                <Line type="monotone" dataKey="actual" stroke="#0891b2" strokeWidth={3} name="Actual Speed" dot={false} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Torque & Current Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[350px]">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-6 flex items-center gap-2">
                        <Zap size={14} /> Dynamic Torque & Current
                    </h3>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="time" hide />
                                <YAxis yAxisId="left" domain={[-35, 35]} tick={{fontSize: 10}} />
                                <YAxis yAxisId="right" orientation="right" domain={[0, 15]} tick={{fontSize: 10}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ display: 'none' }}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                <Line yAxisId="left" type="monotone" dataKey="torque" stroke="#f97316" strokeWidth={2} name="Torque (Nm)" dot={false} isAnimationActive={false} />
                                <Line yAxisId="right" type="monotone" dataKey="current" stroke="#eab308" strokeWidth={2} name="Current (A)" dot={false} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Educational Footer */}
            <div className="bg-cyan-50 border border-cyan-100 p-4 rounded-xl flex gap-4 items-start">
                <div className="bg-cyan-600 p-2 rounded-lg text-white">
                    <Info size={20} />
                </div>
                <div className="text-sm text-cyan-900">
                    <h4 className="font-bold mb-1">Tuning Guide</h4>
                    <p className="opacity-80">
                        Try increasing <strong>Kp</strong> to see how the motor reacts faster but starts to overshoot. 
                        If you increase <strong>Inertia</strong>, you'll see the torque hit the limit (30Nm) for longer as it tries to accelerate the heavy mass.
                        This is exactly what happens during <strong>p1900</strong> auto-tuning!
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MotorTestKit;
