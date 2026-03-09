import { useState, useEffect, useRef } from 'react';
import { Play, Square, RotateCw, Zap, Thermometer, Weight, TrendingUp, Info, Fan, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const SinamicsMotorLab = () => {
  const [simState, setSimState] = useState({
    isRunning: false,
    frequency: 0,
    voltage: 0,
    current: 0,
    rpm: 0,
    setpointHz: 50,
    temperature: 25,
    torque: 0,
    power: 0,
    cosPhi: 0
  });

  const [loadTorque, setLoadTorque] = useState(20);
  const [controlMode, setControlMode] = useState('VF');
  
  // Advanced Parameters
  const [rampUpTime, setRampUpTime] = useState(5.0);
  const [rampDownTime, setRampDownTime] = useState(5.0);
  const [voltageBoost, setVoltageBoost] = useState(5);
  const [slipComp, setSlipComp] = useState(100);
  const [currentLimit, setCurrentLimit] = useState(8.0);
  const [minFreq, setMinFreq] = useState(0);
  const [maxFreq, setMaxFreq] = useState(60);
  
  // Chart Data
  const [chartData, setChartData] = useState([]);
  const timeRef = useRef(0);
  const simStateRef = useRef(simState);

  // Keep ref in sync
  useEffect(() => {
    simStateRef.current = simState;
  }, [simState]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSimState((prev) => {
        let newFreq = prev.frequency;
        let newTemp = prev.temperature;

        const dt = 0.1;
        const rampUpStep = (50 / Math.max(0.1, rampUpTime)) * dt;
        const rampDownStep = (50 / Math.max(0.1, rampDownTime)) * dt;
        
        if (prev.isRunning) {
          const clampedSetpoint = Math.max(minFreq, Math.min(maxFreq, prev.setpointHz));

          if (prev.frequency < clampedSetpoint) {
            newFreq = Math.min(clampedSetpoint, prev.frequency + rampUpStep);
          } else if (prev.frequency > clampedSetpoint) {
            newFreq = Math.max(clampedSetpoint, prev.frequency - rampDownStep);
          }
          
          const heatRise = 0.05 + (Math.pow(loadTorque / 100, 2) * 0.2);
          const coolingFactor = Math.max(0.2, newFreq / 50); 
          
          newTemp = Math.min(90, prev.temperature + (heatRise - (0.1 * coolingFactor))); 
        } else {
          newFreq = Math.max(0, prev.frequency - rampDownStep);
          newTemp = Math.max(25, prev.temperature - 0.2);
        }

        const vPerHz = 400 / 50; 
        let newVolts = Math.min(400, newFreq * vPerHz);
        
        if (controlMode === 'VF' && newFreq < 25) {
            const boostVolts = (voltageBoost / 100) * 400 * (1 - newFreq / 25);
            newVolts += boostVolts;
        }
        
        const syncSpeed = (120 * newFreq) / 4;
        
        const ratedSlip = 60;
        const baseSlip = ratedSlip * (loadTorque / 100); 
        
        let slip = 0;
        if (controlMode === 'VF') {
            const compensation = baseSlip * (slipComp / 100);
            slip = baseSlip - compensation;
        } else {
            slip = baseSlip * 0.05; 
        }
        
        const newRpm = Math.max(0, syncSpeed - slip);
        
        const magnetizingCurrent = 2.0;
        const torqueCurrent = (loadTorque / 100) * 4.5;
        let newCurrent = 0;
        let newTorque = 0;
        let newPower = 0;
        let newCosPhi = 0;
        
        if (newFreq > 0.1) {
             const inefficiencyFactor = controlMode === 'VF' && loadTorque > 90 ? 1.3 : 1.0;
             newCurrent = Math.sqrt(Math.pow(magnetizingCurrent, 2) + Math.pow(torqueCurrent * inefficiencyFactor, 2));
             
             if (newCurrent > currentLimit) {
                newCurrent = currentLimit;
             }

             newTorque = (loadTorque / 100) * 25.5;
             
             newCosPhi = 0.85 * (Math.min(1, loadTorque / 80));
             if (loadTorque < 20) newCosPhi = 0.3;
             
             newPower = (Math.sqrt(3) * newVolts * newCurrent * newCosPhi) / 1000;
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

      timeRef.current += 1;
      setChartData((prevData) => {
        const current = simStateRef.current;
        const newData = [...prevData, { 
            time: timeRef.current, 
            rpm: Math.round(current.rpm), 
            current: Number(current.current.toFixed(1)),
            torque: Number((current.torque || 0).toFixed(1)),
            power: Number((current.power || 0).toFixed(2))
        }];
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
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
             <RotateCw className="text-cyan-600" /> SINAMICS Motor Lab
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Compare V/f and Vector Control performance under load.</p>
        </div>
        
        <div className="flex items-center gap-3">
             <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                <button 
                    onClick={() => setControlMode('VF')} 
                    className={`px-3 py-1 text-xs font-bold rounded transition-colors ${controlMode === 'VF' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    V/f Control
                </button>
                <button 
                    onClick={() => setControlMode('SLVC')} 
                    className={`px-3 py-1 text-xs font-bold rounded transition-colors ${controlMode === 'SLVC' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    SLVC (Vector)
                </button>
             </div>
             <div className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide border transition-colors ${simState.isRunning ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 animate-pulse' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'}`}>
                {simState.isRunning ? 'RUNNING' : 'STOPPED'}
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Control Panel */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 lg:col-span-1 space-y-8 h-fit">
          
          <div className="space-y-4">
            <button 
                onClick={handleStartStop}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all shadow-sm ${simState.isRunning ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30'}`}
            >
                {simState.isRunning ? <><Square size={20} fill="currentColor" /> STOP DRIVE</> : <><Play size={20} fill="currentColor" /> START DRIVE</>}
            </button>
          </div>

          <div className="space-y-6">
              {/* Frequency Slider */}
              <div className="space-y-3">
                 <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">Frequency Setpoint</label>
                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-2 py-0.5 rounded">{simState.setpointHz} Hz</span>
                 </div>
                 <input 
                    type="range" min="0" max="60" step="1" 
                    value={simState.setpointHz} 
                    onChange={(e) => setSimState(prev => ({...prev, setpointHz: Number(e.target.value)}))} 
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                 />
              </div>

              {/* Torque Slider */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                 <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">Mechanical Load</label>
                    <span className="font-mono font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded">{loadTorque}%</span>
                 </div>
                 <input 
                    type="range" min="0" max="120" step="5" 
                    value={loadTorque} 
                    onChange={(e) => setLoadTorque(Number(e.target.value))} 
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                 />
                 <div className="flex items-start gap-2 text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    <Info size={12} className="mt-0.5 flex-shrink-0" />
                    If using V/f, increasing load will cause speed to drop (slip). Vector control compensates for this.
                 </div>
              </div>

              {/* Advanced Parameters Section */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
                 <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Advanced Parameters</h4>
                 
                 {/* Ramp Times */}
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Ramp Up (p1120)</label>
                       <div className="flex items-center gap-2">
                           <input 
                               type="range" min="0.1" max="30" step="0.1" 
                               value={rampUpTime} 
                               onChange={(e) => setRampUpTime(Number(e.target.value))} 
                               className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                           />
                           <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 w-8">{rampUpTime}s</span>
                       </div>
                   </div>
                   <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Ramp Down (p1121)</label>
                       <div className="flex items-center gap-2">
                           <input 
                               type="range" min="0.1" max="30" step="0.1" 
                               value={rampDownTime} 
                               onChange={(e) => setRampDownTime(Number(e.target.value))} 
                               className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                           />
                           <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 w-8">{rampDownTime}s</span>
                       </div>
                   </div>
                 </div>

                 {/* Frequency Limits */}
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Min Freq (p1080)</label>
                       <div className="flex items-center gap-2">
                           <input 
                               type="range" min="0" max="30" step="1" 
                               value={minFreq} 
                               onChange={(e) => setMinFreq(Number(e.target.value))} 
                               className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                           />
                           <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 w-8">{minFreq}Hz</span>
                       </div>
                   </div>
                   <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Max Freq (p1082)</label>
                       <div className="flex items-center gap-2">
                           <input 
                               type="range" min="30" max="120" step="1" 
                               value={maxFreq} 
                               onChange={(e) => setMaxFreq(Number(e.target.value))} 
                               className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                           />
                           <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 w-8">{maxFreq}Hz</span>
                       </div>
                   </div>
                 </div>

                 {/* Current Limit */}
                 <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Current Limit (p0640)</label>
                     <div className="flex items-center gap-2">
                         <input 
                             type="range" min="1" max="20" step="0.5" 
                             value={currentLimit} 
                             onChange={(e) => setCurrentLimit(Number(e.target.value))} 
                             className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                         />
                         <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 w-8">{currentLimit}A</span>
                     </div>
                 </div>

                 {/* V/f Specifics */}
                 {controlMode === 'VF' && (
                   <div className="space-y-4">
                       <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Voltage Boost (p1310)</label>
                           <div className="flex items-center gap-2">
                               <input 
                                   type="range" min="0" max="25" step="1" 
                                   value={voltageBoost} 
                                   onChange={(e) => setVoltageBoost(Number(e.target.value))} 
                                   className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                               />
                               <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 w-8">{voltageBoost}%</span>
                           </div>
                       </div>
                       <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Slip Comp (p1333)</label>
                           <div className="flex items-center gap-2">
                               <input 
                                   type="range" min="0" max="150" step="10" 
                                   value={slipComp} 
                                   onChange={(e) => setSlipComp(Number(e.target.value))} 
                                   className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                               />
                               <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 w-8">{slipComp}%</span>
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
            
            {/* Motor Visualizer */}
            <div className="bg-slate-900 dark:bg-slate-950 rounded-xl shadow-lg border border-slate-700 dark:border-slate-800 relative overflow-hidden flex flex-col h-64">
                <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                
                <div className="absolute top-4 right-4 z-10 text-right">
                    <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Actual Speed</div>
                    <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-lg tracking-tighter">
                        {Math.round(simState.rpm)} <span className="text-lg text-cyan-600 font-normal">RPM</span>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center relative">
                     <div className="relative w-40 h-40 rounded-full border-[8px] border-slate-600 bg-slate-800 flex items-center justify-center shadow-2xl z-10">
                        <div className="absolute w-full h-full rounded-full border-4 border-slate-700 opacity-50"></div>
                        
                        <div 
                            className="w-28 h-28 rounded-full border-4 border-dashed border-slate-400/50 flex items-center justify-center"
                            style={{ 
                                transform: `rotate(${timeRef.current * (simState.rpm / 60) * 6}deg)`, 
                                transition: 'transform 0.1s linear' 
                            }} 
                        >
                            <div className="w-3 h-3 bg-cyan-500 rounded-full absolute top-2 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                            <div className="w-full h-full rounded-full border-[20px] border-slate-700/30"></div>
                        </div>

                        <div className="absolute w-12 h-12 bg-slate-300 rounded-full border-4 border-slate-400 shadow-inner flex items-center justify-center">
                            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                        </div>
                     </div>

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
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm min-h-[300px] flex flex-col">
                 <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-4 flex items-center gap-2">
                    <Activity size={14} /> Real-time Trend
                 </h3>
                 <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                            <XAxis dataKey="time" hide />
                            <YAxis yAxisId="left" domain={[0, 1800]} tick={{fontSize: 10}} className="dark:text-slate-400" />
                            <YAxis yAxisId="right" orientation="right" domain={[0, 10]} tick={{fontSize: 10}} className="dark:text-slate-400" />
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
const DataCard = ({ label, value, unit, icon }) => (
    <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-100 dark:border-slate-600 flex flex-col justify-center hover:border-slate-200 dark:hover:border-slate-500 transition-colors">
        <div className="flex items-center gap-1.5 mb-1 opacity-80">
            {icon}
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{label}</span>
        </div>
        <div className="text-xl font-mono font-bold text-slate-700 dark:text-slate-200 tracking-tight">
            {value}<span className="text-xs text-slate-400 dark:text-slate-500 ml-1 font-sans font-normal">{unit}</span>
        </div>
    </div>
);

export default SinamicsMotorLab;
