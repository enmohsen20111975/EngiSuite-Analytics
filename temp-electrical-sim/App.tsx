import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Simulator } from './components/Simulator';
import { LearningCenter } from './components/LearningCenter';

const App: React.FC = () => {
    const [view, setView] = useState<'landing' | 'simulator' | 'training'>('landing');

    const handleBack = () => setView('landing');
    const handleSelectView = (selectedView: 'simulator' | 'training') => setView(selectedView);

    switch (view) {
        case 'simulator':
            return <Simulator onBack={handleBack} />;
        case 'training':
            return <LearningCenter onClose={handleBack} isPage />;
        case 'landing':
        default:
            return <LandingPage onSelectView={handleSelectView} />;
    }
};

export default App;
