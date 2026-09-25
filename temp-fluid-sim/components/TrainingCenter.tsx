
import React, { useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { lessons, LessonTopic } from '../data/lessons';

interface TrainingCenterProps {
  onNavigate: (view: 'landing' | 'simulator') => void;
}

const TrainingCenter: React.FC<TrainingCenterProps> = ({ onNavigate }) => {
  const [activeTopic, setActiveTopic] = useState<LessonTopic>(lessons[0]);

  const categories = [...new Set(lessons.map(l => l.category))];

  const ActiveComponent = activeTopic.component;

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center justify-between p-4 border-b border-border shrink-0 bg-card shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('landing')} className="p-2 rounded-md hover:bg-accent flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Home</span>
            </button>
            <h2 className="text-xl font-bold text-primary">Fluid Power Training Center</h2>
        </div>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <aside className="w-72 border-r border-border p-4 overflow-y-auto bg-card shrink-0">
          <nav className="flex flex-col gap-4">
            {categories.map(category => (
                <div key={category}>
                    <h3 className="text-sm font-semibold text-muted-foreground px-3 mb-2 uppercase tracking-wider">{category}</h3>
                    <div className="flex flex-col gap-1">
                        {lessons.filter(l => l.category === category).map(lesson => (
                            <button
                            key={lesson.id}
                            onClick={() => setActiveTopic(lesson)}
                            className={cn(
                                "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                                activeTopic.id === lesson.id ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-accent"
                            )}
                            >
                            {lesson.title}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
          </nav>
        </aside>
        <div className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto bg-muted/20">
            <div className="max-w-7xl mx-auto">
                <ActiveComponent />
            </div>
        </div>
      </main>
    </div>
  );
};

export default TrainingCenter;
