import { useState, useEffect, useRef } from 'react';
import { Play, Square, Activity, Zap, Settings, Info, Waves } from 'lucide-react';

const SinamicsInverterFlow = () => {
  const [isRunning, setIsRunning] = useState(false);
  
  // Rectifier State
  const [capacitance, setCapacitance] = useState(50);
  
  // Inverter State
  const [frequency, setFrequency] = useState(10);
  const [voltage, setVoltage] = useState(80);
  const [autoVf, setAutoVf] = useState(true);
  const [carrierFreq, setCarrierFreq] = useState(500);

  const canvasRef = useRef(null);
  const timeRef = useRef(0);
  const animationRef = useRef(0);

  // Auto V/f Logic
  useEffect(() => {
    if (autoVf) {
      const v = Math.min(400, frequency * 8);
      setVoltage(v);
    }
  }, [frequency, autoVf]);

  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const scopeHeight = height / 3;
      
      // Clear
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Grid Lines
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let x=0; x<width; x+=50) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      for(let y=0; y<height; y+=50) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
      ctx.stroke();

      if (isRunning) {
        timeRef.current += 0.5;
      }

      const t = timeRef.current;

      // SCOPE 1: AC INPUT (Grid) & Rectification
      const row1Base = scopeHeight / 2;
      
      const phaseAmp = 40;
      const gridFreq = 0.05; 
      
      // L1
      ctx.beginPath();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      for (let x = 0; x < width; x++) {
        const y = row1Base + Math.sin((x + t) * gridFreq) * phaseAmp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // L2
      ctx.beginPath();
      ctx.strokeStyle = '#eab308';
      for (let x = 0; x < width; x++) {
        const y = row1Base + Math.sin((x + t) * gridFreq + (2*Math.PI/3)) * phaseAmp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // L3
      ctx.beginPath();
      ctx.strokeStyle = '#3b82f6';
      for (let x = 0; x < width; x++) {
        const y = row1Base + Math.sin((x + t) * gridFreq + (4*Math.PI/3)) * phaseAmp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // SCOPE 2: DC LINK (Rectified)
      const row2Base = scopeHeight + (scopeHeight / 2);
      
      ctx.beginPath();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      
      let lastDC = 0;
      
      for (let x = 0; x < width; x++) {
        const v1 = Math.abs(Math.sin((x + t) * gridFreq));
        const v2 = Math.abs(Math.sin((x + t) * gridFreq + (2*Math.PI/3)));
        const v3 = Math.abs(Math.sin((x + t) * gridFreq + (4*Math.PI/3)));
        
        let rawDC = Math.max(v1, v2, v3) * phaseAmp;
        
        const dischargeFactor = 1 - (capacitance / 105);
        
        if (rawDC < lastDC) {
             rawDC = Math.max(rawDC, lastDC * dischargeFactor); 
        }
        lastDC = rawDC;

        const y = row2Base + (phaseAmp) - rawDC;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      // Draw 0V Reference for DC
      ctx.strokeStyle = '#64748b';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, row2Base + phaseAmp);
      ctx.lineTo(width, row2Base + phaseAmp);
      ctx.stroke();
      ctx.setLineDash([]);


      // SCOPE 3: PWM OUTPUT (Inverter)
      const row3Base = (scopeHeight * 2) + (scopeHeight / 2);
      
      const outAmp = (voltage / 400) * phaseAmp;
      const outFreq = frequency * 0.005;
      
      // Draw Ref Sine (Ghost)
      ctx.beginPath();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x++) {
        const y = row3Base + Math.sin((x + t*2) * outFreq) * outAmp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw PWM Pulses
      ctx.beginPath();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      
      for (let x = 0; x < width; x++) {
         const sineVal = Math.sin((x + t*2) * outFreq);
         const carrierVal = Math.sin(x * (carrierFreq/10)); 
         const modIndex = voltage / 400;
         
         let pwmLevel = 0;
         if ((sineVal * modIndex) > carrierVal) {
             pwmLevel = 1;
         } else if ((sineVal * modIndex) < -carrierVal) {
             pwmLevel = -1;
         }
         
         const y = row3Base - (pwmLevel * 30);
         x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();


      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationRef.current);
  }, [isRunning, capacitance, frequency, voltage, carrierFreq]);


  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Waves className="text-cyan-600" /> SINAMICS Power Electronics Scope
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Visualize Rectification (AC→DC) and Inversion (DC→AC) physics.</p>
        </div>
        <div className="flex items-center gap-3">
             <button 
                onClick={() => setAutoVf(!autoVf)}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors border ${autoVf ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
             >
                {autoVf ? 'Mode: V/f Auto' : 'Mode: Manual'}
             </button>
             <button 
                onClick={() => setIsRunning(!isRunning)}
                className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-wide border shadow-sm transition-all ${isRunning ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30'}`}
             >
                {isRunning ? 'Stop Sim' : 'Start Power'}
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        
        {/* Controls */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-8">
            
            {/* DC Link Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">
                    <Zap size={16}/> Rectifier
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">DC Capacitor</label>
                        <span className="text-xs font-mono font-bold">{capacitance}%</span>
                    </div>
                    <input 
                        type="range" min="1" max="100" 
                        value={capacitance} 
                        onChange={(e) => setCapacitance(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-tight">
                        Smoothing the ripple. Low C = Rough DC. High C = Flat DC.
                    </p>
                </div>
            </div>

            {/* Inverter Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
                    <Activity size={16}/> Inverter (PWM)
                </div>
                <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg border border-cyan-100 dark:border-cyan-800 space-y-6">
                    
                    {/* Frequency */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Output Freq</label>
                            <span className="text-xs font-mono font-bold">{frequency} Hz</span>
                        </div>
                        <input 
                            type="range" min="1" max="100" 
                            value={frequency} 
                            onChange={(e) => setFrequency(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                        />
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-tight">
                            Controls the SPEED. Notice the sine wave expanding/compressing.
                        </p>
                    </div>

                    {/* Voltage */}
                    <div className={autoVf ? 'opacity-50 pointer-events-none' : ''}>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Output Voltage</label>
                            <span className="text-xs font-mono font-bold">{Math.round(voltage)} V</span>
                        </div>
                        <input 
                            type="range" min="0" max="400" 
                            value={voltage} 
                            onChange={(e) => setVoltage(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                        />
                         <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-tight">
                            Controls the TORQUE. Notice the PWM pulses getting wider (Duty Cycle).
                         </p>
                    </div>

                </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded border border-blue-100 dark:border-blue-800 flex gap-2">
                <Info size={16} className="flex-shrink-0" />
                The drive varies the PWM Pulse Width to simulate Analog Voltage. Wide pulses = High Voltage.
            </div>

        </div>

        {/* Oscilloscope Canvas */}
        <div className="lg:col-span-3 bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-700 dark:border-slate-800 shadow-inner relative overflow-hidden flex flex-col">
            <div className="absolute top-2 left-2 flex flex-col gap-2 z-10 pointer-events-none">
                 <Badge color="bg-red-500/20 text-red-200 border-red-500/50" label="SCOPE 1: AC INPUT (L1, L2, L3)" />
                 <Badge color="bg-green-500/20 text-green-200 border-green-500/50" label="SCOPE 2: DC LINK BUS" style={{marginTop: '110px'}} />
                 <Badge color="bg-cyan-500/20 text-cyan-200 border-cyan-500/50" label="SCOPE 3: PWM OUTPUT (IGBT)" style={{marginTop: '110px'}} />
            </div>

            <canvas 
                ref={canvasRef} 
                width={800} 
                height={600} 
                className="w-full h-full object-cover"
            />
        </div>

      </div>
    </div>
  );
};

const Badge = ({label, color, style}) => (
    <div className={`px-2 py-1 rounded text-[10px] font-bold border backdrop-blur-sm w-fit ${color}`} style={style}>
        {label}
    </div>
);

export default SinamicsInverterFlow;
