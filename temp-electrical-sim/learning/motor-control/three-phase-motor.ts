import { ThreePhaseMotorVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const threePhaseMotorTopic: LearningTopic = {
  id: 'what-is-a-3-phase-motor',
  title: 'Three-Phase Induction Motors',
  content: [
    "The three-phase induction motor is the most widely used motor in industrial applications. It's known for being rugged, reliable, and relatively simple in construction.",
    "It consists of two main parts: a stationary outer part called the 'Stator', and a rotating inner part called the 'Rotor'. There are no electrical connections (like brushes) to the rotor.",
    "The magic happens in the stator, which contains three sets of windings. When connected to a three-phase AC power supply, these windings create a 'Rotating Magnetic Field' (RMF). This is a magnetic field that spins at a constant speed (the synchronous speed) around the inside of the motor.",
    "This spinning magnetic field passes through the rotor's conductive bars, inducing a powerful electric current in them—much like a transformer. This induced current creates the rotor's own magnetic field.",
    "The interaction between the stator's rotating magnetic field and the rotor's induced magnetic field creates a force, or torque, that drags the rotor along, causing it to spin.",
    "Interestingly, the rotor always spins slightly slower than the RMF. This difference in speed is called 'slip', and it's necessary for induction to occur. Without slip, no current would be induced, and no torque would be produced."
  ],
  visual: ThreePhaseMotorVisual,
};