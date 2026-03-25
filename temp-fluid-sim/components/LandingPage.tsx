
import React from 'react';
import { CircuitBoard, GraduationCap, Github } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: 'simulator' | 'training') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-grid relative overflow-hidden p-4" style={{
        backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
    }}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background/50"></div>
      
      <main className="z-10 flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-primary mb-4 tracking-tighter">
          Fluid Power Pro
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-12">
          An advanced web-based platform to design, simulate, and learn about industrial hydraulic, pneumatic, and electrical control circuits.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <div
            onClick={() => onNavigate('simulator')}
            className="group relative p-8 bg-card border-2 border-border rounded-xl cursor-pointer hover:border-blue-500 hover:bg-accent/50 transition-all duration-300 transform hover:-translate-y-2"
          >
            <CircuitBoard className="h-16 w-16 mb-4 text-blue-400 mx-auto" strokeWidth={1.5} />
            <h2 className="text-2xl font-bold text-foreground mb-2">Circuit Simulator</h2>
            <p className="text-muted-foreground">
              Drag, drop, and connect components. Design complex circuits and run real-time physics-based simulations with integrated PLC logic.
            </p>
            <div className="absolute bottom-4 right-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                Launch Simulator →
            </div>
          </div>
          
          <div
            onClick={() => onNavigate('training')}
            className="group relative p-8 bg-card border-2 border-border rounded-xl cursor-pointer hover:border-green-500 hover:bg-accent/50 transition-all duration-300 transform hover:-translate-y-2"
          >
            <GraduationCap className="h-16 w-16 mb-4 text-green-400 mx-auto" strokeWidth={1.5} />
            <h2 className="text-2xl font-bold text-foreground mb-2">Training Center</h2>
            <p className="text-muted-foreground">
              Learn the fundamentals of fluid power and electrical control through interactive lessons, animations, and guided tutorials.
            </p>
            <div className="absolute bottom-4 right-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                Start Learning →
            </div>
          </div>
        </div>
      </main>
      
      <footer className="absolute bottom-4 text-muted-foreground text-sm z-10">
        <a href="#" className="flex items-center gap-2 hover:text-primary transition-colors">
            <Github size={16} /> <span>View on GitHub</span>
        </a>
      </footer>
    </div>
  );
};

export default LandingPage;
