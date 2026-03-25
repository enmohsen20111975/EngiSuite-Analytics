import React from 'react';
import { componentLibrary } from '../data/componentLibrary';
import { ComponentType } from '../types';
import * as Icons from './icons';
import { useCircuitStore } from '../hooks/useCircuitStore';
import { cn } from '../lib/utils';

const Palette: React.FC = () => {
  const isSimulationRunning = useCircuitStore(state => state.isSimulationRunning);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, componentType: ComponentType) => {
    if (isSimulationRunning) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData('application/reactflow', componentType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const categorizedComponents = componentLibrary.reduce((acc, comp) => {
    const category = comp.category || 'Generic';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(comp);
    return acc;
  }, {} as Record<string, typeof componentLibrary>);

  return (
    <aside className={cn(
        "w-64 bg-card border-r-2 border-border p-2 overflow-y-auto z-10 transition-opacity",
        isSimulationRunning && "opacity-50 pointer-events-none"
    )}>
      <h2 className="text-lg font-semibold mb-2 px-2">Components</h2>
      <div className="space-y-4">
        {Object.entries(categorizedComponents).map(([category, components]) => (
          <div key={category}>
            <h3 className="text-xs font-bold uppercase text-muted-foreground mb-2 px-2">{category}</h3>
            <div className="space-y-1">
              {components.map((comp) => {
                const Icon = Icons[comp.type as keyof typeof Icons] || Icons.Fallback;
                return (
                  <div
                    key={comp.type}
                    className="flex items-center p-2 border border-transparent rounded-lg cursor-grab hover:bg-accent hover:border-primary/20 transition-colors"
                    onDragStart={(event) => onDragStart(event, comp.type)}
                    draggable={!isSimulationRunning}
                  >
                    <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center mr-3">
                        <Icon className="h-8 w-8 text-foreground" />
                    </div>
                    <span className="text-sm text-foreground">{comp.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Palette;