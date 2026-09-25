
import React from 'react';
import { CourseModule, ModuleType } from '../types';
import { BookOpen, Activity, CheckSquare, Menu, Shield, Wrench, Users, Cpu, Settings, PlayCircle, ClipboardList, LayoutDashboard, Workflow, Database, Sliders } from 'lucide-react';

interface SidebarProps {
  modules: CourseModule[];
  activeModuleId: string;
  onSelectModule: (id: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ modules, activeModuleId, onSelectModule, isOpen, toggleSidebar }) => {
  
  const getIcon = (type: ModuleType) => {
    switch (type) {
      case ModuleType.SIMULATION_MOTOR: return <Activity size={18} />;
      case ModuleType.SIMULATION_INVERTER: return <Cpu size={18} />;
      case ModuleType.SIMULATION_SAFETY: return <Shield size={18} />;
      case ModuleType.SIMULATION_PID: return <Settings size={18} />;
      case ModuleType.SIMULATION_COMMISSIONING: return <ClipboardList size={18} />;
      case ModuleType.SIMULATION_PLC: return <Cpu size={18} />;
      case ModuleType.SIMULATION_LOGIC: return <Workflow size={18} />;
      case ModuleType.SIMULATION_PARAMETERS: return <Settings size={18} />;
      case ModuleType.SIMULATION_TEST_KIT: return <Sliders size={18} />;
      case ModuleType.TOOL_MOTOR_SPECS: return <Database size={18} />;
      case ModuleType.QUIZ: return <CheckSquare size={18} />;
      case ModuleType.TROUBLESHOOTING: return <Wrench size={18} />;
      case ModuleType.FORUM: return <Users size={18} />;
      default: return <BookOpen size={18} />;
    }
  };

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button onClick={toggleSidebar} className="p-2 bg-slate-800 text-white rounded shadow-lg">
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out w-72 bg-slate-900 text-slate-300 flex flex-col z-40 border-r border-slate-700`}>
        <div className="p-6 border-b border-slate-800 bg-slate-950">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 bg-cyan-600 rounded flex items-center justify-center text-white font-bold text-sm">S</span>
            SINAMICS<span className="font-light text-cyan-400">Class</span>
          </h1>
          <p className="text-xs text-slate-500 mt-2 uppercase tracking-wider">Professional Training</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            
            {/* Dashboard / Home Link */}
            <li className="mb-4">
              <button
                  onClick={() => {
                    onSelectModule('home');
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                    activeModuleId === 'home'
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50'
                      : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                  }`}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
              </button>
            </li>

            <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Modules</div>

            {modules.map((module) => (
              <li key={module.id}>
                <button
                  onClick={() => {
                    onSelectModule(module.id);
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeModuleId === module.id
                      ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-800'
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className={`${activeModuleId === module.id ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {getIcon(module.type)}
                  </span>
                  <div className="flex flex-col items-start text-left">
                    <span>{module.title}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <Shield size={14} />
            <span>v4.0 • MasterClass</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
