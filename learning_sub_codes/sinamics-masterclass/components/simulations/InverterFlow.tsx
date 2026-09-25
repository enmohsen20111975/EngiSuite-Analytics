
import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Activity, Zap, Settings, ArrowRight, Info, Waves } from 'lucide-react';

const InverterFlow: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  
  // Rectifier State
  const [capacitance, setCapacitance] = useState(50); // % Smoothing
  
  // Inverter State
  const [frequency, setFrequency] = useState(10); // Hz
  const [voltage, setVoltage] = useState(80); // V
  const [autoVf, setAutoVf] = useState(true); // V/f Control Mode
  const [carrierFreq, setCarrierFreq] = useState(500); // Hz (Visual scale)

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const animationRef = useRef<number>(0);

  // Auto V/f Logic
  useEffect(() => {
    if (autoVf) {
      // Linear V/f: 400V @ 50Hz => 8 * Freq
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

      // Layout Config
      const width = canvas.width;
      const height = canvas.height;
      const scopeHeight = height / 3;
      
      // Clear
      ctx.fillStyle = '#0f172a'; // Slate-900
      ctx.fillRect(0, 0, width, height);

      // Grid Lines
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let x=0; x<width; x+=50) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      for(let y=0; y<height; y+=50) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
      ctx.stroke();

      if (isRunning) {
        timeRef.current += 0.5; // Time Speed
      }

      const t = timeRef.current;

      // ==========================================
      // SCOPE 1: AC INPUT (Grid) & Rectification
      // ==========================================
      const row1Base = scopeHeight / 2;
      
      // Draw 3 Phases
      const phaseAmp = 40;
      const gridFreq = 0.05; 
      
      // L1
      ctx.beginPath();
      ctx.strokeStyle = '#ef4444'; // Red
      ctx.lineWidth = 2;
      for (let x = 0; x < width; x++) {
        const y = row1Base + Math.sin((x + t) * gridFreq) * phaseAmp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // L2
      ctx.beginPath();
      ctx.strokeStyle = '#eab308'; // Yellow
      for (let x = 0; x < width; x++) {
        const y = row1Base + Math.sin((x + t) * gridFreq + (2*Math.PI/3)) * phaseAmp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // L3
      ctx.beginPath();
      ctx.strokeStyle = '#3b82f6'; // Blue
      for (let x = 0; x < width; x++) {
        const y = row1Base + Math.sin((x + t) * gridFreq + (4*Math.PI/3)) * phaseAmp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // ==========================================
      // SCOPE 2: DC LINK (Rectified)
      // ==========================================
      const row2Base = scopeHeight + (scopeHeight / 2);
      
      // Calculate Rectified Envelope (Max of absolute 3 phases)
      ctx.beginPath();
      ctx.strokeStyle = '#22c55e'; // Green
      ctx.lineWidth = 3;
      
      let lastDC = 0;
      
      for (let x = 0; x < width; x++) {
        // Ideal Diode Bridge Output (6-pulse ripple)
        const v1 = Math.abs(Math.sin((x + t) * gridFreq));
        const v2 = Math.abs(Math.sin((x + t) * gridFreq + (2*Math.PI/3)));
        const v3 = Math.abs(Math.sin((x + t) * gridFreq + (4*Math.PI/3)));
        
        let rawDC = Math.max(v1, v2, v3) * phaseAmp;
        
        // Capacitor Smoothing Simulation
        // If rawDC drops, cap discharges slowly based on capacitance slider
        // Discharge rate: Lower capacitance = faster drop (more ripple)
        const dischargeFactor = 1 - (capacitance / 105); // 0.05 to 1.0
        
        if (rawDC < lastDC) {
             rawDC = Math.max(rawDC, lastDC * dischargeFactor); 
        }
        lastDC = rawDC;

        const y = row2Base + (phaseAmp) - rawDC; // Invert for canvas Y
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


      // ==========================================
      // SCOPE 3: PWM OUTPUT (Inverter)
      // ==========================================
      const row3Base = (scopeHeight * 2) + (scopeHeight / 2);
      
      // Reference Sine Wave (Desired Output)
      const outAmp = (voltage / 400) * phaseAmp; // Scale by Voltage Slider
      const outFreq = frequency * 0.005; // Scale by Frequency Slider
      
      // Draw Ref Sine (Ghost)
      ctx.beginPath();
      ctx.strokeStyle = '#94a3b8'; // Light Slate
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x++) {
        const y = row3Base + Math.sin((x + t*2) * outFreq) * outAmp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw PWM Pulses (SPWM Logic)
      ctx.beginPath();
      ctx.strokeStyle = '#06b6d4'; // Cyan
      ctx.lineWidth = 2;
      
      // Triangle Carrier
      const carrierPeriod = 1000 / carrierFreq; 
      
      for (let x = 0; x < width; x++) {
         const sineVal = Math.sin((x + t*2) * outFreq); // -1 to 1
         
         // Visual Approximation of Triangle Wave comparison
         // We oscillate between -1 and 1 rapidly
         const carrierVal = Math.sin(x * (carrierFreq/10)); 
         
         // Modulation Index (Voltage control)
         // If Sine > Carrier, Switch is ON (High)
         // We scale sineVal by Voltage % to change Pulse Width
         const modIndex = voltage / 400;
         
         let pwmLevel = 0;
         if ((sineVal * modIndex) > carrierVal) {
             pwmLevel = 1;
         } else if ((sineVal * modIndex) < -carrierVal) {
             pwmLevel = -1;
         }
         
         // Draw Square Wave
         const y = row3Base - (pwmLevel * 30); // 30px height
         x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();


      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationRef.current);
  }, [isRunning, capacitance, frequency, voltage, carrierFreq]);


  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Waves className="text-cyan-600" /> Power Electronics Scope
          </h2>
          <p className="text-sm text-slate-500">Visualize Rectification (AC→DC) and Inversion (DC→AC) physics.</p>
        </div>
        <div className="flex items-center gap-3">
             <button 
                onClick={() => setAutoVf(!autoVf)}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors border ${autoVf ? 'bg-cyan-100 text-cyan-800 border-cyan-200' : 'bg-white text-slate-500 border-slate-200'}`}
             >
                {autoVf ? 'Mode: V/f Auto' : 'Mode: Manual'}
             </button>
             <button 
                onClick={() => setIsRunning(!isRunning)}
                className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-wide border shadow-sm transition-all ${isRunning ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'}`}
             >
                {isRunning ? 'Stop Sim' : 'Start Power'}
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        
        {/* Controls */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-8">
            
            {/* DC Link Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-green-700 uppercase tracking-wider">
                    <Zap size={16}/> Rectifier
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-slate-600">DC Capacitor</label>
                        <span className="text-xs font-mono font-bold">{capacitance}%</span>
                    </div>
                    <input 
                        type="range" min="1" max="100" 
                        value={capacitance} 
                        onChange={(e) => setCapacitance(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                    <p className="text-[10px] text-slate-500 mt-2 leading-tight">
                        Smoothing the ripple. Low C = Rough DC. High C = Flat DC.
                    </p>
                </div>
            </div>

            {/* Inverter Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-cyan-700 uppercase tracking-wider">
                    <Activity size={16}/> Inverter (PWM)
                </div>
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-100 space-y-6">
                    
                    {/* Frequency */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold text-slate-600">Output Freq</label>
                            <span className="text-xs font-mono font-bold">{frequency} Hz</span>
                        </div>
                        <input 
                            type="range" min="1" max="100" 
                            value={frequency} 
                            onChange={(e) => setFrequency(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                        />
                        <p className="text-[10px] text-slate-500 mt-2 leading-tight">
                            Controls the SPEED. Notice the sine wave expanding/compressing.
                        </p>
                    </div>

                    {/* Voltage */}
                    <div className={autoVf ? 'opacity-50 pointer-events-none' : ''}>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold text-slate-600">Output Voltage</label>
                            <span className="text-xs font-mono font-bold">{Math.round(voltage)} V</span>
                        </div>
                        <input 
                            type="range" min="0" max="400" 
                            value={voltage} 
                            onChange={(e) => setVoltage(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                        />
                         <p className="text-[10px] text-slate-500 mt-2 leading-tight">
                            Controls the TORQUE. Notice the PWM pulses getting wider (Duty Cycle).
                        </p>
                    </div>

                </div>
            </div>

            <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100 flex gap-2">
                <Info size={16} className="flex-shrink-0" />
                The drive varies the PWM Pulse Width to simulate Analog Voltage. Wide pulses = High Voltage.
            </div>

        </div>

        {/* Oscilloscope Canvas */}
        <div className="lg:col-span-3 bg-slate-900 rounded-xl border border-slate-700 shadow-inner relative overflow-hidden flex flex-col">
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

const Badge = ({label, color, style}: {label: string, color: string, style?: React.CSSProperties}) => (
    <div className={`px-2 py-1 rounded text-[10px] font-bold border backdrop-blur-sm w-fit ${color}`} style={style}>
        {label}
    </div>
);

export default InverterFlow;
