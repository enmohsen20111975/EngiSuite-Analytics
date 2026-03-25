import React from 'react';
import { Power, FolderUp, FolderDown, TestTube2, ArrowLeft, Tags } from 'lucide-react';
import { useCircuitStore } from '../hooks/useCircuitStore';
import { cn } from '../lib/utils';

interface HeaderProps {
  worker: Worker | null;
  onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ worker, onBack }) => {
    const { 
        circuit, 
        plcMappings, 
        plcInputValues, 
        plcInputMappings,
        setUnitSystem, 
        isSimulationRunning,
        setSimulationRunning,
        showLabels,
        toggleLabels
    } = useCircuitStore();
    const unitSystem = circuit?.unitSystem || 'SI';

    const handleToggleSimulation = () => {
        if (isSimulationRunning) {
            if (!worker) return;
            worker.postMessage({ type: 'stop-simulation' });
            setSimulationRunning(false);
        } else {
            if (!worker || !circuit) return;
            worker.postMessage({ 
                type: 'start-simulation', 
                payload: { circuit, plcMappings, plcInputMappings, plcInputs: plcInputValues } 
            });
            setSimulationRunning(true);
        }
    };

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b-2 border-border bg-card shadow-sm z-20 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="px-3 py-1.5 text-sm rounded-md hover:bg-accent flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>
        <h1 className="text-xl font-bold text-primary whitespace-nowrap hidden lg:block">Industrial Circuit & PLC Simulator Pro</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <button disabled={isSimulationRunning} className="px-3 py-1.5 text-sm rounded-md hover:bg-accent flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <TestTube2 className="h-4 w-4" /> Demos
        </button>
        <button disabled={isSimulationRunning} className="px-3 py-1.5 text-sm rounded-md hover:bg-accent flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <FolderUp className="h-4 w-4" /> Save
        </button>
        <button disabled={isSimulationRunning} className="px-3 py-1.5 text-sm rounded-md hover:bg-accent flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <FolderDown className="h-4 w-4" /> Load
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button 
            onClick={toggleLabels}
            className={cn(
                "p-2 text-sm rounded-md flex items-center gap-2",
                showLabels ? "bg-accent text-primary" : "hover:bg-accent"
            )}
            title={showLabels ? 'Hide Labels' : 'Show Labels'}
        >
            <Tags className="h-4 w-4" />
        </button>

         {/* Unit System Toggle */}
        <div className="flex items-center bg-muted p-0.5 rounded-md">
            <button 
                onClick={() => setUnitSystem('SI')}
                disabled={isSimulationRunning}
                className={cn(
                    "px-2.5 py-1 text-xs font-semibold rounded disabled:opacity-50 disabled:cursor-not-allowed",
                    unitSystem === 'SI' ? 'bg-primary text-primary-foreground shadow' : 'hover:bg-accent'
                )}
            >
                SI
            </button>
            <button
                onClick={() => setUnitSystem('Imperial')}
                disabled={isSimulationRunning}
                 className={cn(
                    "px-2.5 py-1 text-xs font-semibold rounded disabled:opacity-50 disabled:cursor-not-allowed",
                    unitSystem === 'Imperial' ? 'bg-primary text-primary-foreground shadow' : 'hover:bg-accent'
                )}
            >
                Imperial
            </button>
        </div>
         <button 
            onClick={handleToggleSimulation} 
            className={cn(
                "px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 transition-colors",
                isSimulationRunning 
                    ? "bg-red-600 hover:bg-red-700 text-white" 
                    : "bg-green-600 hover:bg-green-700 text-white"
            )}
        >
            <Power className="h-4 w-4" />
            {isSimulationRunning ? 'Stop' : 'Run'}
        </button>
      </div>
    </header>
  );
};

export default Header;