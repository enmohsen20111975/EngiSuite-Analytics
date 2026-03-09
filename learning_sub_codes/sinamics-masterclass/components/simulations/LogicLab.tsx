
import React, { useState } from 'react';
import { Workflow, CheckCircle, XCircle, Power, ToggleLeft, ToggleRight, ArrowRight } from 'lucide-react';

const LogicLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GATES' | 'LATCH' | 'COMPARATOR'>('GATES');

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col animate-in fade-in">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Workflow className="text-cyan-600" /> DCC & Logic Lab
          </h2>
          <p className="text-slate-500 text-sm">Visualize internal drive logic blocks (Free Function Blocks).</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
           <button 
             onClick={() => setActiveTab('GATES')}
             className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'GATES' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Boolean Gates
           </button>
           <button 
             onClick={() => setActiveTab('LATCH')}
             className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'LATCH' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             RS Flip-Flop
           </button>
           <button 
             onClick={() => setActiveTab('COMPARATOR')}
             className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'COMPARATOR' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Comparator
           </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-8 flex items-center justify-center overflow-hidden relative">
         <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
         
         {activeTab === 'GATES' && <GatesSim />}
         {activeTab === 'LATCH' && <LatchSim />}
         {activeTab === 'COMPARATOR' && <ComparatorSim />}
      </div>
    </div>
  );
};

const GatesSim = () => {
  const [in1, setIn1] = useState(false);
  const [in2, setIn2] = useState(false);
  const [gateType, setGateType] = useState<'AND' | 'OR' | 'XOR'>('AND');

  let out = false;
  if (gateType === 'AND') out = in1 && in2;
  if (gateType === 'OR') out = in1 || in2;
  if (gateType === 'XOR') out = (in1 && !in2) || (!in1 && in2);

  return (
    <div className="flex flex-col items-center gap-12 w-full max-w-2xl">
       <div className="flex gap-4">
          {['AND', 'OR', 'XOR'].map((t) => (
             <button 
               key={t}
               onClick={() => setGateType(t as any)}
               className={`px-6 py-2 rounded-full font-bold border-2 transition-all ${gateType === t ? 'border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-slate-200 bg-white text-slate-400'}`}
             >
               {t}
             </button>
          ))}
       </div>

       <div className="flex items-center gap-8 w-full justify-center relative">
          
          {/* Inputs */}
          <div className="flex flex-col gap-12">
             <div className="flex items-center gap-4">
                <Switch label="Input 1 (DI 0)" active={in1} onClick={() => setIn1(!in1)} />
                <Wire active={in1} />
             </div>
             <div className="flex items-center gap-4">
                <Switch label="Input 2 (DI 1)" active={in2} onClick={() => setIn2(!in2)} />
                <Wire active={in2} />
             </div>
          </div>

          {/* Gate Block */}
          <div className="w-32 h-32 bg-slate-800 rounded-lg shadow-xl flex items-center justify-center border-2 border-slate-600 relative z-10">
             <span className="text-3xl font-bold text-white tracking-widest">{gateType}</span>
             {/* Connectors */}
             <div className="absolute left-[-10px] top-8 w-3 h-3 bg-slate-400 rounded-full"></div>
             <div className="absolute left-[-10px] bottom-8 w-3 h-3 bg-slate-400 rounded-full"></div>
             <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-400 rounded-full"></div>
          </div>

          {/* Output */}
          <div className="flex items-center gap-4">
             <Wire active={out} length="w-24" />
             <LightBulb active={out} label="Output (r20xxx)" />
          </div>

       </div>

       <div className="bg-white p-4 rounded-lg border border-slate-200 text-sm text-slate-600 max-w-lg text-center">
          <strong>Use Case:</strong> {gateType === 'AND' ? 'Safety interlock (e.g. Run only if Safety OK AND Button Pressed).' : gateType === 'OR' ? 'Multiple start sources (Start from Button OR PLC).' : 'Detecting mismatch (e.g. two limit switches that should act together).'}
       </div>
    </div>
  );
};

const LatchSim = () => {
  const [setQ, setSetQ] = useState(false);
  const [resetQ, setResetQ] = useState(false);
  const [output, setOutput] = useState(false);

  // Logic: Set turns on. Reset turns off (Reset dominant).
  const handleSet = () => {
    if (!resetQ) setOutput(true);
  };

  const handleReset = (val: boolean) => {
    setResetQ(val);
    if (val) setOutput(false);
  };

  return (
    <div className="flex flex-col items-center gap-12 w-full max-w-2xl">
       <h3 className="text-xl font-bold text-slate-800">RS Flip-Flop (Memory Latch)</h3>
       
       <div className="flex items-center gap-8 w-full justify-center relative">
          
          <div className="flex flex-col gap-12">
             <div className="flex items-center gap-4">
                <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-slate-400">SET (Pulse)</span>
                    <button 
                        onMouseDown={() => { setSetQ(true); handleSet(); }} 
                        onMouseUp={() => setSetQ(false)}
                        onMouseLeave={() => setSetQ(false)}
                        className={`px-4 py-2 rounded border-2 font-bold transition-all active:scale-95 ${setQ ? 'bg-green-500 border-green-600 text-white' : 'bg-white border-slate-300 text-slate-500'}`}
                    >
                        Push
                    </button>
                </div>
                <Wire active={setQ} />
             </div>
             <div className="flex items-center gap-4">
                <Switch label="RESET (Stop)" active={resetQ} onClick={() => handleReset(!resetQ)} color="red" />
                <Wire active={resetQ} color="red" />
             </div>
          </div>

          <div className="w-32 h-40 bg-slate-800 rounded-lg shadow-xl flex flex-col items-center justify-between py-6 border-2 border-slate-600 relative z-10">
             <span className="text-white font-bold text-sm">S</span>
             <span className="text-2xl font-bold text-yellow-400">RS-FF</span>
             <span className="text-white font-bold text-sm">R1</span>
             
             <div className="absolute left-[-10px] top-8 w-3 h-3 bg-slate-400 rounded-full"></div>
             <div className="absolute left-[-10px] bottom-8 w-3 h-3 bg-slate-400 rounded-full"></div>
             <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-400 rounded-full"></div>
          </div>

          <div className="flex items-center gap-4">
             <Wire active={output} length="w-24" />
             <LightBulb active={output} label="Drive Run Command" />
          </div>
       </div>

       <div className="bg-white p-4 rounded-lg border border-slate-200 text-sm text-slate-600 max-w-lg text-center">
          <strong>Engineering Tip:</strong> This block (RSR) is used to create a "3-Wire Control" logic inside the drive. The Green button sets the latch (Run), the Red button breaks the latch (Stop).
       </div>
    </div>
  );
};

const ComparatorSim = () => {
    const [speed, setSpeed] = useState(500);
    const [threshold, setThreshold] = useState(1000);
    const [hysteresis, setHysteresis] = useState(50);
    
    // Logic with Hysteresis
    // ON if Speed > Threshold
    // OFF if Speed < (Threshold - Hysteresis)
    const [output, setOutput] = useState(false);

    React.useEffect(() => {
        if (output && speed < (threshold - hysteresis)) {
            setOutput(false);
        } else if (!output && speed > threshold) {
            setOutput(true);
        }
    }, [speed, threshold, hysteresis, output]);
  
    return (
      <div className="flex flex-col items-center gap-12 w-full max-w-3xl">
         <h3 className="text-xl font-bold text-slate-800">Comparator (Limit Monitor)</h3>
         
         <div className="flex items-center gap-8 w-full justify-center relative">
            
            <div className="flex flex-col gap-12 w-1/3">
               <div className="flex flex-col gap-2">
                   <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>Actual Speed (r63)</span>
                        <span className="text-blue-600">{speed} rpm</span>
                   </div>
                   <input type="range" min="0" max="2000" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
                   <Wire active={true} color="blue" dashed />
               </div>

               <div className="flex flex-col gap-2">
                   <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>Threshold (p2155)</span>
                        <span className="text-slate-800">{threshold} rpm</span>
                   </div>
                   <input type="range" min="0" max="2000" value={threshold} onChange={e => setThreshold(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"/>
                   <Wire active={true} color="gray" dashed />
               </div>
            </div>
  
            <div className="w-40 h-40 bg-slate-800 rounded-lg shadow-xl flex flex-col items-center justify-center gap-2 border-2 border-slate-600 relative z-10">
               <span className="text-3xl font-bold text-white">x {'>'} y</span>
               <div className="text-[10px] text-slate-400">Hyst: {hysteresis}</div>
               
               <div className="absolute left-[-10px] top-10 w-3 h-3 bg-blue-400 rounded-full"></div>
               <div className="absolute left-[-10px] bottom-10 w-3 h-3 bg-slate-400 rounded-full"></div>
               <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-400 rounded-full"></div>
            </div>
  
            <div className="flex items-center gap-4">
               <Wire active={output} length="w-24" />
               <LightBulb active={output} label="Speed OK (DO 0)" />
            </div>
         </div>

         <div className="bg-white p-4 rounded-lg border border-slate-200 text-sm text-slate-600 max-w-lg text-center">
            <strong>Application:</strong> This block controls Digital Outputs. For example, "Turn on the Conveyor Running Light" only when the motor is actually spinning fast enough.
         </div>
      </div>
    );
};

// UI Components
const Wire = ({ active, length = "w-16", color = "cyan", dashed = false }: { active: boolean, length?: string, color?: string, dashed?: boolean }) => {
    let colorClass = active ? `bg-${color}-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]` : 'bg-slate-300';
    if (color === 'red' && active) colorClass = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]';
    if (color === 'blue') colorClass = 'bg-blue-500';
    
    return (
        <div className={`${length} h-1 ${colorClass} transition-all duration-300 rounded-full ${dashed ? 'opacity-50' : ''}`}></div>
    );
};

const Switch = ({ label, active, onClick, color = 'cyan' }: { label: string, active: boolean, onClick: () => void, color?: string }) => (
    <div className="flex flex-col items-end gap-1">
        <span className="text-xs font-bold text-slate-400">{label}</span>
        <button 
            onClick={onClick}
            className={`w-12 h-6 rounded-full flex items-center px-1 transition-all duration-300 ${active ? (color === 'red' ? 'bg-red-500' : 'bg-cyan-600') : 'bg-slate-300'}`}
        >
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${active ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </button>
    </div>
);

const LightBulb = ({ active, label }: { active: boolean, label: string }) => (
    <div className="flex flex-col items-center gap-2">
        <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${active ? 'bg-yellow-400 border-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.6)] scale-110' : 'bg-slate-200 border-slate-300'}`}>
            <Power size={20} className={active ? 'text-white' : 'text-slate-400'} />
        </div>
        <span className={`text-xs font-bold transition-colors ${active ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
    </div>
);

export default LogicLab;
