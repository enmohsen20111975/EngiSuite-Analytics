
import React, { useState } from 'react';
import { Search, Database, Zap, Activity, Info, Ruler } from 'lucide-react';

interface MotorData {
  id: string;
  model: string;
  series: string;
  type: 'Induction' | 'Servo';
  power: number; // kW
  voltage: number; // V
  current: number; // A
  speed: number; // RPM
  eff: number; // %
  pf: number; // cos phi
  torque?: number; // Nm (if explicit, else calculated)
  frameSize: string;
  weight: number; // kg
}

const MOCK_MOTORS: MotorData[] = [
  // 1LE1 Induction Motors (Simotics GP)
  { id: '1LE1001-0DB2', model: '1LE1001-0DB2', series: 'Simotics GP', type: 'Induction', power: 0.55, voltage: 400, current: 1.42, speed: 1415, eff: 77.1, pf: 0.72, frameSize: '80M', weight: 8 },
  { id: '1LE1001-0EB0', model: '1LE1001-0EB0', series: 'Simotics GP', type: 'Induction', power: 0.75, voltage: 400, current: 1.86, speed: 1440, eff: 79.6, pf: 0.74, frameSize: '80M', weight: 9 },
  { id: '1LE1001-0EB4', model: '1LE1001-0EB4', series: 'Simotics GP', type: 'Induction', power: 1.5, voltage: 400, current: 3.35, speed: 1445, eff: 85.3, pf: 0.79, frameSize: '90L', weight: 16 },
  { id: '1LE1001-1AB4', model: '1LE1001-1AB4', series: 'Simotics GP', type: 'Induction', power: 2.2, voltage: 400, current: 4.7, speed: 1445, eff: 86.7, pf: 0.78, frameSize: '100L', weight: 23 },
  { id: '1LE1001-1CB0', model: '1LE1001-1CB0', series: 'Simotics GP', type: 'Induction', power: 7.5, voltage: 400, current: 14.7, speed: 1460, eff: 90.4, pf: 0.82, frameSize: '132M', weight: 51 },
  { id: '1LE1001-1DB2', model: '1LE1001-1DB2', series: 'Simotics GP', type: 'Induction', power: 11, voltage: 400, current: 21.5, speed: 1470, eff: 91.2, pf: 0.84, frameSize: '160M', weight: 72 },
  { id: '1LE1001-1DB4', model: '1LE1001-1DB4', series: 'Simotics GP', type: 'Induction', power: 15, voltage: 400, current: 28.0, speed: 1475, eff: 91.9, pf: 0.85, frameSize: '160L', weight: 89 },
  { id: '1LE1501-1EB2', model: '1LE1501-1EB2', series: 'Simotics SD (Severe Duty)', type: 'Induction', power: 22, voltage: 400, current: 40.5, speed: 1475, eff: 93.0, pf: 0.86, frameSize: '180M', weight: 165 },
  { id: '1LE1501-2AB5', model: '1LE1501-2AB5', series: 'Simotics SD (Severe Duty)', type: 'Induction', power: 37, voltage: 400, current: 68.0, speed: 1480, eff: 93.9, pf: 0.84, frameSize: '225S', weight: 295 },
  
  // 1FK7 Servos
  { id: '1FK7042-2AF71', model: '1FK7042-2AF71', series: 'Simotics S-1FK7', type: 'Servo', power: 0.82, voltage: 400, current: 2.2, speed: 3000, eff: 91.0, pf: 0.95, torque: 2.6, frameSize: '48', weight: 4.5 },
  { id: '1FK7081-2AF71', model: '1FK7081-2AF71', series: 'Simotics S-1FK7', type: 'Servo', power: 2.1, voltage: 400, current: 4.8, speed: 3000, eff: 94.0, pf: 0.95, torque: 10.0, frameSize: '80', weight: 13.5 },
];

const MotorSpecs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMotor, setSelectedMotor] = useState<MotorData | null>(null);
  const [showSeriesTable, setShowSeriesTable] = useState(false);

  const filteredMotors = MOCK_MOTORS.filter(m => 
    m.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.series.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateTorque = (m: MotorData) => {
    if (m.torque) return m.torque;
    // T = 9550 * P / n
    return ((9550 * m.power) / m.speed).toFixed(2);
  };

  const le1Motors = MOCK_MOTORS.filter(m => m.series.includes('Simotics GP') || m.series.includes('Simotics SD'));

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
         <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Database className="text-cyan-600" /> Motor Spec Database
            </h2>
            <p className="text-slate-500 text-sm">Technical data sheet for commissioning reference.</p>
         </div>
         <div className="flex items-center gap-4">
            <button 
                onClick={() => setShowSeriesTable(!showSeriesTable)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                    showSeriesTable 
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-md' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
            >
                {showSeriesTable ? 'Hide Series Table' : 'Show 1LE1 Series Table'}
            </button>
            <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input 
                type="text" 
                placeholder="Search 1LE1, 1FK7..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
            </div>
         </div>
      </div>

      {showSeriesTable ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Simotics 1LE1 Series Technical Overview (400V / 50Hz)</h3>
                  <span className="text-[10px] text-slate-400 font-mono italic">Data derived from Siemens D 81.1 Catalog</span>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                          <tr>
                              <th className="px-6 py-3">Order Code</th>
                              <th className="px-6 py-3">Power (kW)</th>
                              <th className="px-6 py-3">Speed (RPM)</th>
                              <th className="px-6 py-3">Current (A)</th>
                              <th className="px-6 py-3">Eff (%)</th>
                              <th className="px-6 py-3">cos φ</th>
                              <th className="px-6 py-3">Frame</th>
                              <th className="px-6 py-3">Weight (kg)</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                          {le1Motors.map(m => (
                              <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-4 font-mono font-bold text-slate-700">{m.model}</td>
                                  <td className="px-6 py-4 font-bold text-cyan-700">{m.power}</td>
                                  <td className="px-6 py-4">{m.speed}</td>
                                  <td className="px-6 py-4">{m.current}</td>
                                  <td className="px-6 py-4">{m.eff}</td>
                                  <td className="px-6 py-4">{m.pf}</td>
                                  <td className="px-6 py-4">{m.frameSize}</td>
                                  <td className="px-6 py-4">{m.weight}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[500px]">
            {/* List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-600 text-xs uppercase tracking-wider">
                    Select Motor
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {filteredMotors.map(motor => (
                        <button
                            key={motor.id}
                            onClick={() => setSelectedMotor(motor)}
                            className={`w-full text-left p-3 rounded-lg transition-all flex justify-between items-center group ${
                                selectedMotor?.id === motor.id 
                                ? 'bg-cyan-50 border border-cyan-200 shadow-sm' 
                                : 'hover:bg-slate-50 border border-transparent'
                            }`}
                        >
                            <div>
                                <div className={`font-bold text-sm ${selectedMotor?.id === motor.id ? 'text-cyan-800' : 'text-slate-700'}`}>
                                    {motor.model}
                                </div>
                                <div className="text-xs text-slate-400">{motor.series} • {motor.power} kW</div>
                            </div>
                            {selectedMotor?.id === motor.id && <div className="w-2 h-2 rounded-full bg-cyan-500"></div>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Details View */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-8 relative">
                {selectedMotor ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                        <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                            <div>
                                <h3 className="text-3xl font-bold text-slate-900 mb-1">{selectedMotor.model}</h3>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                                    {selectedMotor.series}
                                </span>
                            </div>
                            <div className="text-right">
                                 <div className="text-4xl font-mono font-bold text-cyan-600">{selectedMotor.power} <span className="text-lg text-slate-400">kW</span></div>
                                 <div className="text-sm text-slate-500 font-medium">Rated Power</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <SpecCard label="Voltage" value={selectedMotor.voltage} unit="V" icon={<Zap size={16} className="text-yellow-500"/>} />
                            <SpecCard label="Current (In)" value={selectedMotor.current} unit="A" icon={<Activity size={16} className="text-blue-500"/>} />
                            <SpecCard label="Rated Speed" value={selectedMotor.speed} unit="RPM" icon={<Activity size={16} className="text-purple-500"/>} />
                            <SpecCard label="Torque (Mn)" value={calculateTorque(selectedMotor)} unit="Nm" icon={<Zap size={16} className="text-orange-500"/>} />
                            <SpecCard label="Efficiency" value={selectedMotor.eff} unit="%" icon={<Zap size={16} className="text-green-500"/>} />
                            <SpecCard label="Power Factor" value={selectedMotor.pf} unit="cos φ" icon={<Zap size={16} className="text-slate-500"/>} />
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                             <div className="bg-slate-50 p-4 rounded-lg flex items-center gap-4">
                                 <div className="p-2 bg-white rounded shadow-sm text-slate-500"><Ruler size={24}/></div>
                                 <div>
                                     <div className="text-xs font-bold text-slate-500 uppercase">Frame Size</div>
                                     <div className="text-xl font-bold text-slate-800">{selectedMotor.frameSize}</div>
                                 </div>
                             </div>
                             <div className="bg-slate-50 p-4 rounded-lg flex items-center gap-4">
                                 <div className="p-2 bg-white rounded shadow-sm text-slate-500"><Database size={24}/></div>
                                 <div>
                                     <div className="text-xs font-bold text-slate-500 uppercase">Weight</div>
                                     <div className="text-xl font-bold text-slate-800">{selectedMotor.weight} <span className="text-sm text-slate-400 font-normal">kg</span></div>
                                 </div>
                             </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-800">
                            <Info className="flex-shrink-0" size={20} />
                            <div>
                                <strong>Commissioning Tip:</strong> Enter these exact values into <em>p0304 (Voltage)</em>, <em>p0305 (Current)</em>, and <em>p0307 (Power)</em>. For {selectedMotor.type} motors, accurate data is critical for the vector model stability.
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Database size={32} />
                        </div>
                        <p>Select a motor from the list to view specifications.</p>
                    </div>
                )}
            </div>
          </div>
      )}
    </div>
  );
};

const SpecCard = ({ label, value, unit, icon }: { label: string, value: string | number, unit: string, icon: React.ReactNode }) => (
    <div className="p-4 rounded-lg border border-slate-100 hover:border-cyan-100 hover:bg-cyan-50/30 transition-all group">
        <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs font-bold uppercase tracking-wider group-hover:text-cyan-700">
            {icon} {label}
        </div>
        <div className="text-2xl font-mono font-bold text-slate-800">
            {value} <span className="text-sm text-slate-400 font-sans font-normal">{unit}</span>
        </div>
    </div>
);

export default MotorSpecs;
