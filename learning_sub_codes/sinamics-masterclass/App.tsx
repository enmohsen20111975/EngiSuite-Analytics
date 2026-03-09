
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ModuleContent from './components/ModuleContent';
import LandingPage from './components/LandingPage';
import MotorLab from './components/simulations/MotorLab';
import InverterFlow from './components/simulations/InverterFlow';
import SafetyLab from './components/simulations/SafetyLab';
import PIDLab from './components/simulations/PIDLab';
import CommissioningWizard from './components/simulations/CommissioningWizard';
import PlcTelegrams from './components/simulations/PlcTelegrams';
import LogicLab from './components/simulations/LogicLab';
import ParameterLab from './components/simulations/ParameterLab';
import MotorTestKit from './components/simulations/MotorTestKit';
import MotorSpecs from './components/tools/MotorSpecs';
import Troubleshooting from './components/Troubleshooting';
import Forum from './components/Forum';
import Quiz from './components/Quiz';
import { COURSE_MODULES, QUIZ_DATA } from './constants';
import { ModuleType } from './types';

const App: React.FC = () => {
  const [activeModuleId, setActiveModuleId] = useState<string>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeModule = COURSE_MODULES.find(m => m.id === activeModuleId);

  const handleNavigate = (id: string) => {
    setActiveModuleId(id);
    window.scrollTo(0,0);
  };

  const renderContent = () => {
    if (activeModuleId === 'home' || !activeModule) {
      return <LandingPage onNavigate={handleNavigate} />;
    }

    switch (activeModule.type) {
      case ModuleType.SIMULATION_MOTOR:
        return <MotorLab />;
      case ModuleType.SIMULATION_INVERTER:
        return <InverterFlow />;
      case ModuleType.SIMULATION_SAFETY:
        return <SafetyLab />;
      case ModuleType.SIMULATION_PID:
        return <PIDLab />;
      case ModuleType.SIMULATION_COMMISSIONING:
        return <CommissioningWizard />;
      case ModuleType.SIMULATION_PLC:
        return <PlcTelegrams />;
      case ModuleType.SIMULATION_LOGIC:
        return <LogicLab />;
      case ModuleType.SIMULATION_PARAMETERS:
        return <ParameterLab />;
      case ModuleType.SIMULATION_TEST_KIT:
        return <MotorTestKit />;
      case ModuleType.TOOL_MOTOR_SPECS:
        return <MotorSpecs />;
      case ModuleType.QUIZ:
        return <Quiz questions={QUIZ_DATA} />;
      case ModuleType.TROUBLESHOOTING:
        return <Troubleshooting />;
      case ModuleType.FORUM:
        return <Forum />;
      case ModuleType.THEORY:
      default:
        return <ModuleContent module={activeModule} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Navigation */}
      <Sidebar 
        modules={COURSE_MODULES} 
        activeModuleId={activeModuleId} 
        onSelectModule={handleNavigate}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 min-h-screen transition-all duration-300">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
             <div className="ml-10 md:ml-0">
                 <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    {activeModuleId === 'home' ? 'Dashboard' : 'Current Module'}
                 </h2>
                 <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate">
                    {activeModuleId === 'home' ? 'Course Overview' : activeModule?.title}
                 </h1>
             </div>
             <div className="hidden md:flex items-center gap-4">
                 <div className="text-right">
                     <div className="text-sm font-bold text-slate-800">Sr. Engineer</div>
                     <div className="text-xs text-slate-500">Certification Track</div>
                 </div>
                 <div className="w-10 h-10 bg-cyan-800 text-white rounded-full flex items-center justify-center font-bold border border-slate-300 shadow-sm">
                     SE
                 </div>
             </div>
        </header>

        <div className="p-6 md:p-12 max-w-7xl mx-auto">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
