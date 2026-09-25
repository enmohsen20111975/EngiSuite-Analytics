
import React, { useState } from 'react';
import { FAULT_CODES } from '../constants';
import { Search, AlertTriangle, CheckCircle } from 'lucide-react';

const Troubleshooting: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaults = FAULT_CODES.filter(f => 
    f.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Technical Support Database</h1>
        <p className="text-slate-500 mb-6">Search for F-Codes (Faults) or A-Codes (Alarms) to find immediate remedies.</p>
        
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search e.g., F30002 or Overvoltage..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm text-lg"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredFaults.length > 0 ? (
          filteredFaults.map((fault) => (
            <div key={fault.code} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
               <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg flex-shrink-0 ${fault.code.startsWith('F') ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                     <AlertTriangle size={24} />
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-slate-900">{fault.code} - {fault.name}</h3>
                        <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${fault.code.startsWith('F') ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                           {fault.code.startsWith('F') ? 'Fault' : 'Alarm'}
                        </span>
                     </div>
                     <p className="text-slate-600 mt-2">{fault.description}</p>
                     
                     <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                           <CheckCircle size={14} className="text-green-600"/> Remedy:
                        </h4>
                        <p className="text-sm text-slate-600">{fault.remedy}</p>
                     </div>
                  </div>
               </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-400">
             <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
             <p>No fault codes found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Troubleshooting;
