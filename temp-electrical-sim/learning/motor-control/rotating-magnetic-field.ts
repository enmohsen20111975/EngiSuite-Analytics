import { RotatingMagneticFieldVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const rotatingMagneticFieldTopic: LearningTopic = {
  id: 'rotating-magnetic-field',
  title: 'The Rotating Magnetic Field (RMF)',
  content: [
    "The 'magic' behind the three-phase induction motor is the Rotating Magnetic Field (RMF). It's a magnetic field that appears to spin without any physical parts moving in the stator.",
    "This is achieved by arranging three sets of coils (windings) 120 degrees apart around the stator. Each coil is connected to one phase of a three-phase AC power supply.",
    "The currents in these three phases are also 120 degrees apart in time. This means they reach their positive and negative peaks at different moments.",
    "As the current in Phase 1 peaks, its coil creates a strong magnetic field. As it begins to fade, the current in Phase 2 starts to peak, creating a magnetic field in its coil, which is physically 120 degrees away. Then Phase 3 peaks. This sequence repeats continuously.",
    "The result is a single, combined magnetic field whose strongest point smoothly rotates around the stator at a speed determined by the frequency of the AC supply. This is what 'induces' the current in the rotor and drags it along.",
    "The animation below visualizes this process. Watch how the three sine waves correspond to the energizing of the stator poles, creating a smoothly rotating field that the rotor (compass needle) follows."
  ],
  visual: RotatingMagneticFieldVisual,
};
