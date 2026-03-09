
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ShieldAlert, RefreshCcw, Siren } from 'lucide-react';

const SafetyLab: React.FC = () => {
  const [data, setData] = useState<{time: number, speed: number}[]>([]);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [safetyMode, setSafetyMode] = useState<'NONE' | 'STO' | 'SS1'>('NONE');
  const [speed, setSpeed] = useState(0);
  const [statusMsg, setStatusMsg] = useState('System Ready');

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 1);
      
      let newSpeed = speed;

      // Physics Logic
      if (safetyMode === 'NONE') {
         if (isRunning && speed < 1500) newSpeed += 50; // Ramp Up
         if (!isRunning && speed > 0) newSpeed -= 20; // Coast
      } 
      else if (safetyMode === 'STO') {
         if (speed > 0) newSpeed -= 20; // Coast to stop (Power cut immediately)
      } 
      else if (safetyMode === 'SS1') {
         if (speed > 0) newSpeed -= 100; // Controlled Fast Ramp Down
      }

      newSpeed = Math.max(0, newSpeed);
      setSpeed(newSpeed);

      setData(prev => {
        const updated = [...prev, { time, speed: newSpeed }];
        if (updated.length > 50) updated.shift();
        return updated;
      });

    }, 100);
    return () => clearInterval(interval);
  }, [time, isRunning, safetyMode, speed]);

  const triggerSTO = () => {
    setSafetyMode('STO');
    setStatusMsg('STO ACTIVATED: Power Cut immediately. Motor coasting...');
  };

  const triggerSS1 = () => {
    setSafetyMode('SS1');
    setStatusMsg('SS1 ACTIVATED: Fast ramp down initiated. STO will trigger at 0 speed.');
  };

  const reset = () => {
    setSafetyMode('NONE');
    setIsRunning(false);
    setStatusMsg('Safety Reset. Ready to Start.');
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="text-red-600" /> Safety Integrated Lab
          </h2>
          <div className={`px-4 py-2 rounded font-bold text-sm ${safetyMode === 'NONE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 animate-pulse'}`}>
             STATUS: {safetyMode === 'NONE' ? 'HEALTHY' : safetyMode}
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
           <div className="space-y-4 lg:col-span-1">
              <button 
                onClick={() => setIsRunning(!isRunning)} 
                disabled={safetyMode !== 'NONE'}
                className="w-full py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 disabled:opacity-50"
              >
                {isRunning ? 'Stop (Normal)' : 'Start Motor'}
              </button>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">Emergency Functions</p>
                  <button onClick={triggerSTO} className="w-full py-4 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-red-200 flex items-center justify-center gap-2">
                      <Siren /> E-STOP (STO)
                  </button>
                  <button onClick={triggerSS1} className="w-full py-4 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 flex items-center justify-center gap-2">
                      <Siren /> SAFE STOP 1 (SS1)
                  </button>
              </div>

              <button onClick={reset} className="w-full py-2 border-2 border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 flex items-center justify-center gap-2 mt-4">
                  <RefreshCcw size={16}/> Reset Safety
              </button>
           </div>

           <div className="lg:col-span-3 bg-slate-50 rounded-xl border border-slate-200 p-4">
              <ResponsiveContainer width="100%" height={300}>
                 <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={[0, 1600]} label={{ value: 'RPM', angle: -90, position: 'insideLeft' }}/>
                    <Tooltip />
                    <ReferenceLine y={1500} stroke="green" strokeDasharray="3 3" label="Rated Speed" />
                    <Line type="monotone" dataKey="speed" stroke="#0891b2" strokeWidth={3} dot={false} isAnimationActive={false} />
                 </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-white border border-slate-200 rounded text-sm text-slate-600 font-medium">
                  Log: {statusMsg}
              </div>
           </div>
       </div>

       <div className="grid grid-cols-2 gap-4 text-sm text-slate-500">
           <div className="p-4 bg-red-50 rounded border border-red-100">
               <strong className="text-red-700 block mb-1">STO (Safe Torque Off)</strong>
               Energy is cut to the motor immediately. The motor coasts to a stop based on friction and inertia. Safest state but uncontrolled stop.
           </div>
           <div className="p-4 bg-orange-50 rounded border border-orange-100">
               <strong className="text-orange-700 block mb-1">SS1 (Safe Stop 1)</strong>
               Drive actively brakes the motor to a standstill (controlled ramp), THEN activates STO. Used to stop heavy loads quickly before removing power.
           </div>
       </div>
    </div>
  );
};

export default SafetyLab;
