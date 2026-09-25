
import React from 'react';
import { CourseModule, ModuleType } from '../types';
import { COURSE_MODULES } from '../constants';
import { 
  GraduationCap, 
  Activity, 
  Cpu, 
  Shield, 
  Zap, 
  Wrench, 
  ArrowRight, 
  PlayCircle, 
  BookOpen, 
  Layers, 
  Settings,
  Target,
  Workflow
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (moduleId: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  
  // Helper to filter simulations
  const simulations = COURSE_MODULES.filter(m => m.type.toString().startsWith('SIMULATION_'));

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-12">
      
      {/* Hero Section */}
      <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/50 border border-cyan-700/50 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            v4.0 Professional Edition
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Master the Art of <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Motion Control</span>
          </h1>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            The complete engineering course for SINAMICS drives. From basic V/f physics to advanced PROFINET IRT Motion Control and Safety Integrated.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => onNavigate('m1')}
              className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-900/50 flex items-center gap-2"
            >
              Start Course <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => onNavigate('m2-sim')}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700 flex items-center gap-2"
            >
              Try Simulations <Activity size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 1. Browse by Level */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <GraduationCap size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Learning Paths</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Beginner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer" onClick={() => onNavigate('m1')}>
            <div className="h-2 w-12 bg-green-500 rounded-full mb-4"></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors">Level 1: Technician</h3>
            <p className="text-slate-500 text-sm mb-4">Understand the basics of AC Motors, Inverters, and wiring. Learn to commission a G120C using the BOP-2.</p>
            <div className="flex flex-col gap-2">
               <div className="text-xs font-bold text-slate-400 uppercase">Includes:</div>
               <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><ArrowRight size={14} className="text-green-500"/> Intro to Drives</span>
               <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><ArrowRight size={14} className="text-green-500"/> Motor Fundamentals</span>
               <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><ArrowRight size={14} className="text-green-500"/> Basic Commissioning</span>
            </div>
          </div>

          {/* Intermediate */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer" onClick={() => onNavigate('m4')}>
            <div className="h-2 w-12 bg-yellow-500 rounded-full mb-4"></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors">Level 2: Engineer</h3>
            <p className="text-slate-500 text-sm mb-4">Master Startdrive software, parameter structures, and troubleshooting fault codes.</p>
            <div className="flex flex-col gap-2">
               <div className="text-xs font-bold text-slate-400 uppercase">Includes:</div>
               <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><ArrowRight size={14} className="text-yellow-500"/> Programming (TIA)</span>
               <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><ArrowRight size={14} className="text-yellow-500"/> Diagnostics</span>
               <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><ArrowRight size={14} className="text-yellow-500"/> Vector Control</span>
            </div>
          </div>

          {/* Advanced */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer" onClick={() => onNavigate('m7')}>
            <div className="h-2 w-12 bg-red-500 rounded-full mb-4"></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors">Level 3: Expert</h3>
            <p className="text-slate-500 text-sm mb-4">Deep dive into Telegrams, Safety Integrated (STO/SS1), and PROFINET communication.</p>
            <div className="flex flex-col gap-2">
               <div className="text-xs font-bold text-slate-400 uppercase">Includes:</div>
               <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><ArrowRight size={14} className="text-red-500"/> PLC Communication</span>
               <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><ArrowRight size={14} className="text-red-500"/> Safety Integrated</span>
               <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><ArrowRight size={14} className="text-red-500"/> Drive Control Chart</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Simulation Arcade */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
            <Zap size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Simulation Arcade</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {simulations.map(sim => (
            <div 
              key={sim.id}
              onClick={() => onNavigate(sim.id)}
              className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center text-center h-full"
            >
               <div className="w-16 h-16 rounded-full bg-slate-50 group-hover:bg-purple-50 flex items-center justify-center mb-4 transition-colors">
                  {sim.type === ModuleType.SIMULATION_INVERTER && <Zap className="text-yellow-500" size={32} />}
                  {sim.type === ModuleType.SIMULATION_MOTOR && <Activity className="text-cyan-500" size={32} />}
                  {sim.type === ModuleType.SIMULATION_COMMISSIONING && <Settings className="text-slate-600" size={32} />}
                  {sim.type === ModuleType.SIMULATION_PLC && <Cpu className="text-blue-600" size={32} />}
                  {sim.type === ModuleType.SIMULATION_SAFETY && <Shield className="text-red-600" size={32} />}
                  {sim.type === ModuleType.SIMULATION_PID && <Target className="text-green-600" size={32} />}
                  {sim.type === ModuleType.SIMULATION_LOGIC && <Workflow className="text-slate-600" size={32} />}
               </div>
               <h4 className="font-bold text-slate-800 text-sm mb-1">{sim.title.replace('Lab: ', '')}</h4>
               <p className="text-xs text-slate-500 line-clamp-2">{sim.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Main Points (Topics) */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
            <Layers size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Key Topics</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
           <button onClick={() => onNavigate('m6-sim')} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left">
              <div className="p-3 bg-red-100 text-red-600 rounded-lg"><Shield size={20}/></div>
              <div>
                 <div className="font-bold text-slate-800">Safety</div>
                 <div className="text-xs text-slate-500">STO, SS1, SLS</div>
              </div>
           </button>
           
           <button onClick={() => onNavigate('m7-sim')} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Cpu size={20}/></div>
              <div>
                 <div className="font-bold text-slate-800">PLC Comms</div>
                 <div className="text-xs text-slate-500">Profinet & Telegrams</div>
              </div>
           </button>

           <button onClick={() => onNavigate('m8-pid')} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Activity size={20}/></div>
              <div>
                 <div className="font-bold text-slate-800">Tuning</div>
                 <div className="text-xs text-slate-500">PID Optimization</div>
              </div>
           </button>

           <button onClick={() => onNavigate('m5-tool')} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left">
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg"><Wrench size={20}/></div>
              <div>
                 <div className="font-bold text-slate-800">Maintenance</div>
                 <div className="text-xs text-slate-500">Fault Codes & Fixes</div>
              </div>
           </button>
        </div>
      </section>

      {/* 4. Full Chapter List */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
            <BookOpen size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Complete Syllabus</h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
           {COURSE_MODULES.filter(m => m.type === ModuleType.THEORY).map((module, idx) => (
             <div key={module.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => onNavigate(module.id)}>
                <div className="flex items-center gap-4">
                   <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center text-sm group-hover:bg-cyan-100 group-hover:text-cyan-700 transition-colors">
                      {idx + 1}
                   </div>
                   <div>
                      <div className="font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">{module.title}</div>
                      <div className="text-sm text-slate-500">{module.description}</div>
                   </div>
                </div>
                <PlayCircle size={20} className="text-slate-300 group-hover:text-cyan-500" />
             </div>
           ))}
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
