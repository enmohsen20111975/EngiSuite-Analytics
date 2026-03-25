import React, { useState } from 'react';
import { learningContent } from '../learning';
import { LearningTopic } from '../learning/types';
import { ArrowLeftIcon } from './ActionIcons';

interface LearningCenterProps {
  onClose: () => void;
  isPage?: boolean;
}

export const LearningCenter: React.FC<LearningCenterProps> = ({ onClose, isPage }) => {
  const [selectedTopic, setSelectedTopic] = useState<LearningTopic>(learningContent[0].topics[0]);

  const handleSelectTopic = (topic: LearningTopic) => {
    setSelectedTopic(topic);
  };
  
  const content = (
    <div 
        className="w-full h-full bg-[var(--bg-secondary)] flex overflow-hidden"
        onClick={!isPage ? (e) => e.stopPropagation() : undefined}
    >
        {/* Sidebar */}
        <aside className="w-1/4 bg-[var(--bg-primary)] p-4 overflow-y-auto">
          <h2 className="text-xl font-bold text-[var(--text-accent)] mb-6">Learning Center</h2>
          {isPage && (
              <button onClick={onClose} className="flex items-center space-x-2 px-3 py-2 mb-4 w-full text-left font-semibold hover:bg-[var(--bg-interactive)] rounded text-sm text-[var(--text-secondary)]">
                  <ArrowLeftIcon size={18}/> 
                  <span>Back to Home</span>
              </button>
          )}
          <nav className="space-y-6">
            {learningContent.map((module) => (
              <div key={module.id}>
                <h3 className="text-lg font-semibold text-[var(--text-secondary)] mb-2 border-b border-[var(--border-secondary)] pb-1">{module.title}</h3>
                <ul className="space-y-1">
                  {module.topics.map((topic) => (
                    <li key={topic.id}>
                      <button
                        onClick={() => handleSelectTopic(topic)}
                        className={`w-full text-left p-2 rounded transition-colors text-sm ${
                          selectedTopic.id === topic.id
                            ? 'bg-blue-600 text-white'
                            : 'text-[var(--text-muted)] hover:bg-[var(--bg-interactive)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {topic.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="w-3/4 p-8 overflow-y-auto relative">
           {!isPage && <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl leading-none">&times;</button>}
          <h1 className="text-3xl font-bold mb-4 text-white">{selectedTopic.title}</h1>
          <div className="prose prose-invert max-w-none text-[var(--text-secondary)] space-y-4">
            {selectedTopic.content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          {selectedTopic.visual && (
            <div className="mt-8 p-4 bg-black/30 rounded-lg flex items-center justify-center">
              <selectedTopic.visual />
            </div>
          )}
          {selectedTopic.visuals && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedTopic.visuals.map((vis, idx) => (
                <div key={vis.title + idx} className="p-4 bg-black/30 rounded-lg flex flex-col items-center justify-center">
                  <h4 className="font-semibold mb-2 text-lg">{vis.title}</h4>
                  <vis.component />
                </div>
              ))}
            </div>
          )}
        </main>
    </div>
  );

  if (isPage) {
    return (
        <div className="h-screen w-screen">
            {content}
        </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-5xl h-[90vh] rounded-lg shadow-2xl overflow-hidden border border-[var(--border-primary)]"
      >
        {content}
      </div>
    </div>
  );
};
