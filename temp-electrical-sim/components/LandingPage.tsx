import React from 'react';
import { BookOpenIcon } from './ActionIcons';

const SimulatorIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V5m0 14v-1M9 6l1.086 1.086a1 1 0 001.414 0L15 6m-6 12l1.086-1.086a1 1 0 011.414 0L15 18m-6-6h.01M15 12h.01M12 9h.01M12 15h.01" />
    </svg>
);

const LogoIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);


interface LandingPageProps {
  onSelectView: (view: 'simulator' | 'training') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectView }) => {
  return (
    <div
      className="flex flex-col items-center justify-center h-screen w-screen bg-[var(--bg-primary)] font-sans p-8"
    >
      <div className="flex flex-col items-center justify-center w-full h-full text-center">
        
        <LogoIcon className="w-auto h-24 md:h-32 text-yellow-400 mb-4" />
        <h1 className="text-5xl font-bold text-[var(--text-accent)] mb-2">ElectraSim Pro</h1>
        <p className="text-xl text-[var(--text-secondary)]">Industrial Circuit Simulator & Training Hub</p>
      
        <div className="flex flex-col md:flex-row gap-8 mt-12">
          {/* Simulator Card */}
          <div 
            onClick={() => onSelectView('simulator')}
            className="group w-80 h-96 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex flex-col items-center justify-center p-8 cursor-pointer transition-all duration-300 hover:border-[var(--text-accent)] hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2"
          >
            <div className="flex flex-col items-center justify-center text-center">
                <SimulatorIcon />
                <h2 className="text-3xl font-semibold mb-2 text-white">Simulator</h2>
                <p className="text-center text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
                    Jump into the workspace to design and test your power and control circuits with a vast library of components.
                </p>
            </div>
          </div>
          
          {/* Training Center Card */}
          <div 
            onClick={() => onSelectView('training')}
            className="group w-80 h-96 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex flex-col items-center justify-center p-8 cursor-pointer transition-all duration-300 hover:border-[var(--text-accent)] hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-2"
          >
            <div className="flex flex-col items-center justify-center text-center">
                <BookOpenIcon size={64} />
                <h2 className="text-3xl font-semibold mb-2 mt-4 text-white">Training Center</h2>
                <p className="text-center text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
                    Learn the fundamentals of electrical engineering with interactive animations and guided lessons.
                </p>
            </div>
          </div>
        </div>
        <footer className="absolute bottom-4 text-xs text-[var(--text-muted)]">
          Select an option to begin.
        </footer>
      </div>
    </div>
  );
};