
import React, { useState, useEffect } from 'react';
import { Settings, Play, RefreshCw, Zap, Activity, Info, CheckCircle2, AlertCircle } from 'lucide-react';

const ParameterLab: React.FC = () => {
  const [tuningStep, setTuningStep] = useState<number>(0);
  const [isTuning, setIsTuning] = useState(false);
  const [tuningProgress, setTuningProgress] = useState(0);
  const [tuningLog, setTuningLog] = useState<string[]>([]);
  
  const [params, setParams] = useState({
    p0300: 'Asynchronous Motor',
    p0340: 1, // Calculate motor data
    p1900: 0, // Identification
    p1300: 20, // Control mode (Vector)
    p0640: 150, // Current limit %
    p0346: 0.5, // Magnetization time
  });

  const startAutoTuning = () => {
    setIsTuning(true);
    setTuningStep(1);
    setTuningProgress(0);
    setTuningLog(['Starting Motor Identification (p1900=2)...']);
  };

  useEffect(() => {
    if (isTuning) {
      const interval = setInterval(() => {
        setTuningProgress(prev => {
          if (prev >= 100) {
            if (tuningStep < 4) {
              setTuningStep(s => s + 1);
              return 0;
            } else {
              setIsTuning(false);
              setTuningLog(prevLog => [...prevLog, 'Optimization Complete. Drive Ready.']);
              return 100;
            }
          }
          return prev + 2;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isTuning, tuningStep]);

  useEffect(() => {
    if (tuningStep === 1 && tuningProgress === 10) setTuningLog(prev => [...prev, 'Measuring Stator Resistance (Rs)...']);
    if (tuningStep === 2 && tuningProgress === 10) setTuningLog(prev => [...prev, 'Measuring Leakage Inductances...']);
    if (tuningStep === 3 && tuningProgress === 10) setTuningLog(prev => [...prev, 'Calculating Magnetizing Current...']);
    if (tuningStep === 4 && tuningProgress === 10) setTuningLog(prev => [...prev, 'Determining Speed Controller Gains (Kp/Tn)...']);
  }, [tuningStep, tuningProgress]);

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="text-cyan-600" /> Advanced Parameter Lab
        </h2>
        <p className="text-slate-500 text-sm">Master the critical SINAMICS parameters: Auto-tuning, Magnetization, and Field Control.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Parameter Editor */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase mb-4 flex items-center gap-2">
              <Activity size={16} className="text-orange-500" /> Expert Parameters
            </h3>
            
            <div className="space-y-4">
              <ParameterRow 
                p="p0300" 
                label="Motor Type" 
                value={params.p0300} 
                desc="Defines the physical motor technology."
              />
              <ParameterRow 
                p="p1300" 
                label="Control Mode" 
                value={params.p1300 === 20 ? 'Vector Control (Encoderless)' : 'V/f Control'} 
                desc="Determines how the inverter calculates the output pulses."
              />
              <ParameterRow 
                p="p0346" 
                label="Magnetization Time" 
                value={`${params.p0346} s`} 
                desc="Time required to build up the magnetic field before starting."
              />
              <ParameterRow 
                p="p0640" 
                label="Current Limit" 
                value={`${params.p0640} %`} 
                desc="Maximum current allowed relative to motor rated current."
              />
            </div>
          </div>

          <div className="bg-cyan-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap size={120} />
            </div>
            <h3 className="text-lg font-bold mb-2">Magnetization & Field</h3>
            <p className="text-cyan-100 text-sm leading-relaxed mb-4">
              In SINAMICS, <strong>p0346</strong> controls the pre-excitation. If you start a motor too fast without proper magnetization, you'll get a torque dip or an overcurrent fault.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono bg-cyan-800/50 p-2 rounded border border-cyan-700">
              <Info size={14} />
              <span>Tip: For high-inertia loads, increase p0346.</span>
            </div>
          </div>
        </div>

        {/* Right: Auto-Tuning Simulation */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
            <h3 className="text-sm font-bold text-slate-800 uppercase mb-4 flex justify-between items-center">
              <span>Motor Identification (p1900)</span>
              {isTuning && <RefreshCw size={16} className="text-cyan-600 animate-spin" />}
            </h3>

            <div className="flex-1 space-y-6">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 mb-4">
                  Auto-tuning measures the electrical characteristics of the motor to optimize the internal mathematical model.
                </p>
                
                <button 
                  onClick={startAutoTuning}
                  disabled={isTuning}
                  className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${isTuning ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-md'}`}
                >
                  <Play size={18} fill="currentColor" /> {isTuning ? 'TUNING IN PROGRESS...' : 'START AUTO-TUNING'}
                </button>
              </div>

              {/* Progress Steps */}
              <div className="space-y-3">
                <TuningStep 
                  label="Stationary Measurement" 
                  active={tuningStep === 1 || tuningStep === 2} 
                  done={tuningStep > 2} 
                  progress={tuningStep === 1 || tuningStep === 2 ? tuningProgress : (tuningStep > 2 ? 100 : 0)} 
                />
                <TuningStep 
                  label="Magnetizing Current Calc" 
                  active={tuningStep === 3} 
                  done={tuningStep > 3} 
                  progress={tuningStep === 3 ? tuningProgress : (tuningStep > 3 ? 100 : 0)} 
                />
                <TuningStep 
                  label="Speed Controller Optimization" 
                  active={tuningStep === 4} 
                  done={tuningStep > 4} 
                  progress={tuningStep === 4 ? tuningProgress : (tuningStep > 4 ? 100 : 0)} 
                />
              </div>

              {/* Log Window */}
              <div className="bg-slate-900 rounded-lg p-4 font-mono text-[10px] h-32 overflow-y-auto border border-slate-800">
                {tuningLog.map((log, i) => (
                  <div key={i} className="text-cyan-400 mb-1">
                    <span className="text-slate-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                    {log}
                  </div>
                ))}
                {isTuning && <div className="text-white animate-pulse">_</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ParameterRow = ({ p, label, value, desc }: { p: string, label: string, value: string, desc: string }) => (
  <div className="group border-b border-slate-100 pb-4 last:border-0">
    <div className="flex justify-between items-start mb-1">
      <div>
        <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded mr-2">{p}</span>
        <span className="text-sm font-bold text-slate-700">{label}</span>
      </div>
      <span className="text-sm font-mono font-bold text-slate-900">{value}</span>
    </div>
    <p className="text-[11px] text-slate-400 group-hover:text-slate-500 transition-colors">{desc}</p>
  </div>
);

const TuningStep = ({ label, active, done, progress }: { label: string, active: boolean, done: boolean, progress: number }) => (
  <div className={`p-3 rounded-lg border transition-all ${active ? 'bg-cyan-50 border-cyan-200 shadow-sm' : (done ? 'bg-green-50 border-green-100' : 'bg-white border-slate-100')}`}>
    <div className="flex justify-between items-center mb-2">
      <span className={`text-xs font-bold ${active ? 'text-cyan-800' : (done ? 'text-green-700' : 'text-slate-400')}`}>{label}</span>
      {done ? <CheckCircle2 size={14} className="text-green-500" /> : (active ? <RefreshCw size={14} className="text-cyan-500 animate-spin" /> : <AlertCircle size={14} className="text-slate-200" />)}
    </div>
    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
      <div 
        className={`h-full transition-all duration-300 ${done ? 'bg-green-500' : 'bg-cyan-500'}`} 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

export default ParameterLab;
