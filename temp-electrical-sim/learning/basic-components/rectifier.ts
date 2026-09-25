import { BridgeRectifierVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const rectifierTopic: LearningTopic = {
  id: 'bridge-rectifier',
  title: 'Bridge Rectifier',
  content: [
    "A rectifier is a circuit that converts alternating current (AC), which periodically reverses direction, into direct current (DC), which flows in only one direction. This is a fundamental process in almost all electronics, as most devices run on DC power from an AC wall outlet.",
    "A simple and very common type is the full-wave bridge rectifier. It uses four diodes arranged in a specific bridge configuration.",
    "Diodes act as one-way gates for electricity. The bridge arrangement is clever: during the positive half of the AC cycle, current flows through two of the diodes. During the negative half, it flows through the other two diodes.",
    "Crucially, no matter which pair of diodes is active, the current is always directed through the load in the same direction. This flips the negative half of the AC wave into a positive one, resulting in a pulsating DC output.",
    "The animation below shows the AC input wave and highlights the current path through the diodes for each half-cycle, producing the DC output."
  ],
  visual: BridgeRectifierVisual,
};
