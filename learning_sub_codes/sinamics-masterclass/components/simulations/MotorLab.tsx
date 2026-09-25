
import React, { useState, useEffect, useRef } from 'react';
import { SimulationState } from '../../types';
import { Play, Square, RotateCw, Zap, Thermometer, Weight, TrendingUp, Info, Fan, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MotorLab: React.FC = () => {
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
  
  // Advanced Parameters
  const [rampUpTime, setRampUpTime] = useState(5.0); // p1120 (s)
  const [rampDownTime, setRampDownTime] = useState(5.0); // p1121 (s)
  const [voltageBoost, setVoltageBoost] = useState(5); // p1310 (%)
  const [slipComp, setSlipComp] = useState(100); // p1333 (%)
  const [currentLimit, setCurrentLimit] = useState(8.0); // p0640 (A)
  const [minFreq, setMinFreq] = useState(0); // p1080 (Hz)
  const [maxFreq, setMaxFreq] = useState(60); // p1082 (Hz)
  
  // Chart Data
  const [chartData, setChartData] = useState<{ time: number; rpm: number; current: number; torque: number }[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSimState((prev) => {
        let newFreq = prev.frequency;
        let newTemp = prev.temperature;

        // Ramp Generator Logic (Simulating p1120/p1121)
        // dt is 0.1s (interval is 100ms)
        const dt = 0.1;
        const rampUpStep = (50 / Math.max(0.1, rampUpTime)) * dt;
        const rampDownStep = (50 / Math.max(0.1, rampDownTime)) * dt;
        
        if (prev.isRunning) {
          // Clamp setpoint by Min/Max Freq
          const clampedSetpoint = Math.max(minFreq, Math.min(maxFreq, prev.setpointHz));

          // Accelerate to setpoint
          if (prev.frequency < clampedSetpoint) {
            newFreq = Math.min(clampedSetpoint, prev.frequency + rampUpStep);
          } else if (prev.frequency > clampedSetpoint) {
            newFreq = Math.max(clampedSetpoint, prev.frequency - rampDownStep);
          }
          
          // Thermal Model (I2t)
          // Temp rises based on Load^2 + Base heating
          const heatRise = 0.05 + (Math.pow(loadTorque / 100, 2) * 0.2);
          // Cooling efficiency drops at low speed (Self-ventilated IC411)
          const coolingFactor = Math.max(0.2, newFreq / 50); 
          
          newTemp = Math.min(90, prev.temperature + (heatRise - (0.1 * coolingFactor))); 
        } else {
          // Decelerate / Coast
          newFreq = Math.max(0, prev.frequency - rampDownStep);
          // Cool down towards ambient
          newTemp = Math.max(25, prev.temperature - 0.2);
        }

        // V/f Characteristic Curve
        const vPerHz = 400 / 50; 
        let newVolts = Math.min(400, newFreq * vPerHz);
        
        // Voltage Boost (p1310) - only effective at low frequencies in V/f
        if (controlMode === 'VF' && newFreq < 25) {
            const boostVolts = (voltageBoost / 100) * 400 * (1 - newFreq / 25);
            newVolts += boostVolts;
        }
        
        // Physics Model: Slip Calculation
        const syncSpeed = (120 * newFreq) / 4; // 4 pole motor = 1500rpm @ 50Hz
        
        // Slip increases with Load
        // In V/f mode, slip is uncompensated (Motor slows down).
        // In SLVC mode, Drive increases frequency to compensate (Motor holds speed).
        const ratedSlip = 60; // 60 RPM rated slip
        const baseSlip = ratedSlip * (loadTorque / 100); 
        
        let slip = 0;
        if (controlMode === 'VF') {
            // Apply slip compensation (p1333)
            const compensation = baseSlip * (slipComp / 100);
            slip = baseSlip - compensation;
        } else {
            // SLVC eliminates 95% of slip
            slip = baseSlip * 0.05; 
        }
        
        const newRpm = Math.max(0, syncSpeed - slip);
        
        // Current Model (Id + Iq)
        const magnetizingCurrent = 2.0; // No-load current
        const torqueCurrent = (loadTorque / 100) * 4.5; // Load current
        let newCurrent = 0;
        let newTorque = 0;
        let newPower = 0;
        let newCosPhi = 0;
        
        if (newFreq > 0.1) {
             // In V/f, if load is too high, current spikes due to poor power factor (stall territory)
             const inefficiencyFactor = controlMode === 'VF' && loadTorque > 90 ? 1.3 : 1.0;
             newCurrent = Math.sqrt(Math.pow(magnetizingCurrent, 2) + Math.pow(torqueCurrent * inefficiencyFactor, 2));
             
             // Apply Current Limit (p0640)
             if (newCurrent > currentLimit) {
                // If current hits limit, frequency ramp is held or reduced (Imax controller)
                newCurrent = currentLimit;
                // In a real drive, this would trigger an alarm or reduce speed
             }

             // Torque calculation (Simplified)
             newTorque = (loadTorque / 100) * 25.5; // Rated torque ~25.5 Nm
             
             // Power Calculation (P = sqrt(3) * V * I * cosPhi)
             newCosPhi = 0.85 * (Math.min(1, loadTorque / 80));
             if (loadTorque < 20) newCosPhi = 0.3; // Magnetizing current dominates
             
             newPower = (Math.sqrt(3) * newVolts * newCurrent * newCosPhi) / 1000; // kW
        }

        return { 
            ...prev, 
            frequency: newFreq, 
            voltage: newVolts, 
            rpm: newRpm, 
            current: newCurrent, 
            temperature: newTemp,
            torque: newTorque,
            power: newPower,
            cosPhi: newCosPhi
        };
      });

      // Update Chart
      timeRef.current += 1;
      setChartData((prevData) => {
        const newData = [...prevData, { 
            time: timeRef.current, 
            rpm: Math.round(simState.rpm), 
            current: Number(simState.current.toFixed(1)),
            torque: Number((simState.torque || 0).toFixed(1)),
            power: Number((simState.power || 0).toFixed(2))
        }];
        // Keep last 100 points
        if (newData.length > 100) newData.shift();
        return newData;
      });

    }, 100);

    return () => clearInterval(interval);
  }, [simState.isRunning, simState.setpointHz, simState.frequency, loadTorque, controlMode, rampUpTime, rampDownTime, voltageBoost, slipComp, currentLimit, minFreq, maxFreq]);

  const handleStartStop = () => {
    setSimState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
             <RotateCw className="text-cyan-600" /> Motor Lab
          </h2>
          <p className="text-sm text-slate-500">Compare V/f and Vector Control performance under load.</p>
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
             <div className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide border transition-colors ${simState.isRunning ? 'bg-green-100 text-green-700 border-green-200 animate-pulse' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
                {simState.isRunning ? 'RUNNING' : 'STOPPED'}
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Control Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-1 space-y-8 h-fit">
          
          <div className="space-y-4">
            <button 
                onClick={handleStartStop}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all shadow-sm ${simState.isRunning ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'}`}
            >
                {simState.isRunning ? <><Square size={20} fill="currentColor" /> STOP DRIVE</> : <><Play size={20} fill="currentColor" /> START DRIVE</>}
            </button>
          </div>

          <div className="space-y-6">
              {/* Frequency Slider */}
              <div className="space-y-3">
                 <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">Frequency Setpoint</label>
                    <span className="font-mono font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded">{simState.setpointHz} Hz</span>
                 </div>
                 <input 
                    type="range" min="0" max="60" step="1" 
                    value={simState.setpointHz} 
                    onChange={(e) => setSimState(prev => ({...prev, setpointHz: Number(e.target.value)}))} 
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                 />
              </div>

              {/* Torque Slider */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                 <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">Mechanical Load</label>
                    <span className="font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{loadTorque}%</span>
                 </div>
                 <input 
                    type="range" min="0" max="120" step="5" 
                    value={loadTorque} 
                    onChange={(e) => setLoadTorque(Number(e.target.value))} 
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                 />
                 <div className="flex items-start gap-2 text-[10px] text-slate-400 mt-1">
                    <Info size={12} className="mt-0.5 flex-shrink-0" />
                    If using V/f, increasing load will cause speed to drop (slip). Vector control compensates for this.
                 </div>
              </div>

              {/* Advanced Parameters Section */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Advanced Parameters</h4>
                 
                 {/* Ramp Times */}
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 uppercase">Ramp Up (p1120)</label>
                       <div className="flex items-center gap-2">
                           <input 
                               type="range" min="0.1" max="30" step="0.1" 
                               value={rampUpTime} 
                               onChange={(e) => setRampUpTime(Number(e.target.value))} 
                               className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                           />
                           <span className="text-[10px] font-mono font-bold text-slate-600 w-8">{rampUpTime}s</span>
                       </div>
                   </div>
                   <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 uppercase">Ramp Down (p1121)</label>
                       <div className="flex items-center gap-2">
                           <input 
                               type="range" min="0.1" max="30" step="0.1" 
                               value={rampDownTime} 
                               onChange={(e) => setRampDownTime(Number(e.target.value))} 
                               className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                           />
                           <span className="text-[10px] font-mono font-bold text-slate-600 w-8">{rampDownTime}s</span>
                       </div>
                   </div>
                 </div>

                 {/* Frequency Limits */}
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 uppercase">Min Freq (p1080)</label>
                       <div className="flex items-center gap-2">
                           <input 
                               type="range" min="0" max="30" step="1" 
                               value={minFreq} 
                               onChange={(e) => setMinFreq(Number(e.target.value))} 
                               className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                           />
                           <span className="text-[10px] font-mono font-bold text-slate-600 w-8">{minFreq}Hz</span>
                       </div>
                   </div>
                   <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 uppercase">Max Freq (p1082)</label>
                       <div className="flex items-center gap-2">
                           <input 
                               type="range" min="30" max="120" step="1" 
                               value={maxFreq} 
                               onChange={(e) => setMaxFreq(Number(e.target.value))} 
                               className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                           />
                           <span className="text-[10px] font-mono font-bold text-slate-600 w-8">{maxFreq}Hz</span>
                       </div>
                   </div>
                 </div>

                 {/* Current Limit */}
                 <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-slate-500 uppercase">Current Limit (p0640)</label>
                     <div className="flex items-center gap-2">
                         <input 
                             type="range" min="1" max="20" step="0.5" 
                             value={currentLimit} 
                             onChange={(e) => setCurrentLimit(Number(e.target.value))} 
                             className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                         />
                         <span className="text-[10px] font-mono font-bold text-slate-600 w-8">{currentLimit}A</span>
                     </div>
                 </div>

                 {/* V/f Specifics */}
                 {controlMode === 'VF' && (
                   <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                       <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-500 uppercase">Voltage Boost (p1310)</label>
                           <div className="flex items-center gap-2">
                               <input 
                                   type="range" min="0" max="25" step="1" 
                                   value={voltageBoost} 
                                   onChange={(e) => setVoltageBoost(Number(e.target.value))} 
                                   className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                               />
                               <span className="text-[10px] font-mono font-bold text-slate-600 w-8">{voltageBoost}%</span>
                           </div>
                       </div>
                       <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-500 uppercase">Slip Comp (p1333)</label>
                           <div className="flex items-center gap-2">
                               <input 
                                   type="range" min="0" max="150" step="10" 
                                   value={slipComp} 
                                   onChange={(e) => setSlipComp(Number(e.target.value))} 
                                   className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                               />
                               <span className="text-[10px] font-mono font-bold text-slate-600 w-8">{slipComp}%</span>
                           </div>
                       </div>
                   </div>
                 )}
              </div>
          </div>

          {/* Telemetry Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
             <DataCard label="Voltage" value={(simState.voltage).toFixed(0)} unit="V" icon={<Zap size={14} className="text-yellow-500"/>} />
             <DataCard label="Current" value={simState.current.toFixed(1)} unit="A" icon={<TrendingUp size={14} className="text-blue-500"/>} />
             <DataCard label="Torque" value={(simState.torque || 0).toFixed(1)} unit="Nm" icon={<Weight size={14} className="text-orange-500"/>} />
             <DataCard label="Power" value={(simState.power || 0).toFixed(2)} unit="kW" icon={<Zap size={14} className="text-cyan-500"/>} />
             <DataCard label="Temp" value={simState.temperature.toFixed(1)} unit="°C" icon={<Thermometer size={14} className="text-red-500"/>} />
             <DataCard label="cos φ" value={(simState.cosPhi || 0).toFixed(2)} unit="" icon={<Activity size={14} className="text-indigo-500"/>} />
          </div>
        </div>

        {/* Visualizer & Charts */}
        <div className="flex flex-col gap-6 lg:col-span-2 h-full">
            
            {/* 3D-ish Motor Visualizer */}
            <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden flex flex-col h-64">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                
                {/* Overlay Stats */}
                <div className="absolute top-4 right-4 z-10 text-right">
                    <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Actual Speed</div>
                    <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-lg tracking-tighter">
                        {Math.round(simState.rpm)} <span className="text-lg text-cyan-600 font-normal">RPM</span>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center relative">
                     {/* Motor Body */}
                     <div className="relative w-40 h-40 rounded-full border-[8px] border-slate-600 bg-slate-800 flex items-center justify-center shadow-2xl z-10">
                        <div className="absolute w-full h-full rounded-full border-4 border-slate-700 opacity-50"></div>
                        
                        {/* Rotor Animation */}
                        <div 
                            className="w-28 h-28 rounded-full border-4 border-dashed border-slate-400/50 flex items-center justify-center"
                            style={{ 
                                transform: `rotate(${timeRef.current * (simState.rpm / 60) * 6}deg)`, 
                                transition: 'transform 0.1s linear' 
                            }} 
                        >
                            {/* Keyway */}
                            <div className="w-3 h-3 bg-cyan-500 rounded-full absolute top-2 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                            {/* Shaft Texture */}
                            <div className="w-full h-full rounded-full border-[20px] border-slate-700/30"></div>
                        </div>

                        {/* Central Shaft */}
                        <div className="absolute w-12 h-12 bg-slate-300 rounded-full border-4 border-slate-400 shadow-inner flex items-center justify-center">
                            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                        </div>
                     </div>

                     {/* Fan Animation (Rear) */}
                     <div className="absolute opacity-20 scale-150">
                        <Fan 
                            size={200} 
                            className="text-white" 
                            style={{ 
                                transform: `rotate(${timeRef.current * (simState.rpm / 60) * 6}deg)`, 
                                transition: 'transform 0.1s linear' 
                            }} 
                        />
                     </div>
                </div>
            </div>

            {/* Live Chart */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 shadow-sm min-h-[300px] flex flex-col">
                 <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                    <Activity size={14} /> Real-time Trend
                 </h3>
                 <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="time" hide />
                            <YAxis yAxisId="left" domain={[0, 1800]} label={{ value: 'RPM', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} tick={{fontSize: 10}} />
                            <YAxis yAxisId="right" orientation="right" domain={[0, 10]} label={{ value: 'Amps', angle: 90, position: 'insideRight', fontSize: 10, fill: '#64748b' }} tick={{fontSize: 10}} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                                labelStyle={{ display: 'none' }} 
                            />
                            <Legend verticalAlign="top" height={36}/>
                            <Line yAxisId="left" type="monotone" dataKey="rpm" stroke="#0891b2" strokeWidth={2} name="Speed (RPM)" dot={false} isAnimationActive={false} />
                            <Line yAxisId="right" type="monotone" dataKey="current" stroke="#f59e0b" strokeWidth={2} name="Current (A)" dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Data Cards
const DataCard = ({ label, value, unit, icon }: { label: string, value: string, unit: string, icon: React.ReactNode }) => (
    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-center hover:border-slate-200 transition-colors">
        <div className="flex items-center gap-1.5 mb-1 opacity-80">
            {icon}
            <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
        </div>
        <div className="text-xl font-mono font-bold text-slate-700 tracking-tight">
            {value}<span className="text-xs text-slate-400 ml-1 font-sans font-normal">{unit}</span>
        </div>
    </div>
);

export default MotorLab;
