import React from 'react';

export interface LearningTopic {
  id: string;
  title: string;
  content: string[];
  visual?: React.FC;
  visuals?: { title: string; component: React.FC }[];
}

export interface LearningModule {
  id: string;
  title: string;
  topics: LearningTopic[];
}
