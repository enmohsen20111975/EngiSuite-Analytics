import { ThreePhaseWaveformVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const threePhasePowerTopic: LearningTopic = {
  id: 'three-phase-power',
  title: 'Three-Phase Power',
  content: [
    "While single-phase AC power is used in homes, industrial and commercial settings rely on three-phase power, especially for running large motors and heavy machinery.",
    "Three-phase power consists of three separate AC signals (or phases) that are carried on three separate wires. Each of these sine waves is 120 degrees out of phase with the others.",
    "This arrangement has significant advantages. Most importantly, the total power delivered by a three-phase system is always constant; it never drops to zero. A single-phase system's power delivery pulsates, dropping to zero twice per cycle. This constant power delivery makes three-phase motors run much more smoothly and efficiently.",
    "It also allows for more power to be transmitted using less copper wire compared to three separate single-phase systems of the same capacity.",
    "The animation shows the three phases (often colored Red, Yellow/Brown, and Blue) and how their peaks and valleys are offset from each other in time."
  ],
  visual: ThreePhaseWaveformVisual,
};