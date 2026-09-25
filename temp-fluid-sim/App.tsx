
import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Simulator from './components/Simulator';
import TrainingCenter from './components/TrainingCenter';

type View = 'landing' | 'simulator' | 'training';

export default function App() {
  const [view, setView] = useState<View>('landing');

  const renderView = () => {
    switch (view) {
      case 'simulator':
        return <Simulator onNavigate={setView} />;
      case 'training':
        return <TrainingCenter onNavigate={setView} />;
      case 'landing':
      default:
        return <LandingPage onNavigate={setView} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans antialiased">
      {renderView()}
    </div>
  );
}
