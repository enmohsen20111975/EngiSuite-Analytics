
import React, { useState } from 'react';
import { Check, ChevronRight, AlertCircle, Settings, Save } from 'lucide-react';

const CommissioningWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    standard: 'IEC',
    voltage: 400,
    current: 1.2,
    power: 0.37,
    rpm: 1450,
    macro: 'Standard'
  });
  const [complete, setComplete] = useState(false);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => Math.max(1, prev - 1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const finish = () => {
    setComplete(true);
  };

  if (complete) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 bg-white rounded-xl border border-slate-200 text-center animate-in zoom-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Check size={48} className="text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Commissioning Complete</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8">
          The drive has been parameterized successfully. Motor ID (p1900) will execute on the next start command.
        </p>
        <div className="bg-white p-6 rounded-lg text-left w-full max-w-sm border-2 border-slate-200 shadow-md">
           <h3 className="text-sm font-bold text-slate-900 uppercase mb-4 border-b pb-2">Configuration Summary</h3>
           <div className="space-y-3 text-sm text-slate-700 font-medium">
             <div className="flex justify-between border-b border-slate-100 pb-1"><span>Motor Standard:</span> <span className="font-bold text-slate-900">{formData.standard}</span></div>
             <div className="flex justify-between border-b border-slate-100 pb-1"><span>Rated Voltage:</span> <span className="font-bold text-slate-900">{formData.voltage} V</span></div>
             <div className="flex justify-between border-b border-slate-100 pb-1"><span>Rated Current:</span> <span className="font-bold text-slate-900">{formData.current} A</span></div>
             <div className="flex justify-between border-b border-slate-100 pb-1"><span>Rated Power:</span> <span className="font-bold text-slate-900">{formData.power} kW</span></div>
             <div className="flex justify-between"><span>Control Macro:</span> <span className="font-bold text-cyan-700">{formData.macro}</span></div>
           </div>
        </div>
        <button 
           onClick={() => {setComplete(false); setStep(1);}}
           className="mt-8 text-cyan-600 font-bold hover:underline"
        >
          Restart Wizard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="text-cyan-600" /> Quick Commissioning Wizard
        </h2>
        <p className="text-slate-500">Step-by-step drive parameterization (p0010 = 1).</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-cyan-600 h-full transition-all duration-300" 
          style={{ width: `${(step / 6) * 100}%` }}
        ></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8">
          
          {step === 1 && (
            <div className="animate-in slide-in-from-right">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Step 1: Motor Standard</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="radio" name="standard" value="IEC" checked={formData.standard === 'IEC'} onChange={handleChange} className="w-5 h-5 accent-cyan-600" />
                  <div>
                    <div className="font-bold text-slate-900">IEC (50Hz)</div>
                    <div className="text-sm text-slate-500">Europe/Asia - kW units</div>
                  </div>
                </label>
                <label className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="radio" name="standard" value="NEMA" checked={formData.standard === 'NEMA'} onChange={handleChange} className="w-5 h-5 accent-cyan-600" />
                  <div>
                    <div className="font-bold text-slate-900">NEMA (60Hz)</div>
                    <div className="text-sm text-slate-500">North America - hp units</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
             <div className="animate-in slide-in-from-right space-y-6">
                <h3 className="text-xl font-bold text-slate-800">Step 2: Motor Voltage (p304)</h3>
                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-600">Rated Motor Voltage</label>
                   <input type="number" name="voltage" value={formData.voltage} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" />
                   <p className="text-xs text-orange-500 flex items-center gap-1"><AlertCircle size={12}/> Check Motor Nameplate (Star/Delta connection!)</p>
                </div>
             </div>
          )}

          {step === 3 && (
             <div className="animate-in slide-in-from-right space-y-6">
                <h3 className="text-xl font-bold text-slate-800">Step 3: Motor Current (p305)</h3>
                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-600">Rated Motor Current (Amps)</label>
                   <input type="number" name="current" step="0.1" value={formData.current} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" />
                </div>
             </div>
          )}

          {step === 4 && (
             <div className="animate-in slide-in-from-right space-y-6">
                <h3 className="text-xl font-bold text-slate-800">Step 4: Motor Power (p307)</h3>
                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-600">Rated Motor Power ({formData.standard === 'IEC' ? 'kW' : 'hp'})</label>
                   <input type="number" name="power" step="0.01" value={formData.power} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" />
                </div>
             </div>
          )}

           {step === 5 && (
             <div className="animate-in slide-in-from-right space-y-6">
                <h3 className="text-xl font-bold text-slate-800">Step 5: Motor Speed (p311)</h3>
                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-600">Rated Motor Speed (RPM)</label>
                   <input type="number" name="rpm" value={formData.rpm} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" />
                   <p className="text-xs text-slate-400">Do not enter Synchronous speed (e.g. 1500). Enter rated speed (e.g. 1450) to allow slip compensation.</p>
                </div>
             </div>
          )}

          {step === 6 && (
             <div className="animate-in slide-in-from-right space-y-6">
                <h3 className="text-xl font-bold text-slate-800">Step 6: Control Macro (p0015)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {['Standard I/O', 'Conveyor', 'Pump/Fan', 'Process Industry'].map((m) => (
                      <button 
                        key={m} 
                        onClick={() => setFormData(prev => ({...prev, macro: m}))}
                        className={`p-4 rounded-lg border text-left transition-all ${formData.macro === m ? 'border-cyan-500 bg-cyan-50 text-cyan-800 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                         <div className="font-bold">{m}</div>
                      </button>
                   ))}
                </div>
             </div>
          )}

        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between">
           <button 
             onClick={prevStep}
             disabled={step === 1}
             className="px-6 py-2 rounded-lg font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-200 transition-colors"
           >
             Back
           </button>
           
           {step < 6 ? (
             <button 
               onClick={nextStep}
               className="px-6 py-2 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-700 transition-colors flex items-center gap-2"
             >
               Next <ChevronRight size={18} />
             </button>
           ) : (
             <button 
               onClick={finish}
               className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
             >
               <Save size={18} /> Calculate & Save
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default CommissioningWizard;
