import { SoftStarterVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const softStarterTopic: LearningTopic = {
  id: 'soft-starter',
  title: 'Soft Starters',
  content: [
    "A soft starter is an electronic device used with AC induction motors to temporarily reduce the load and torque during startup. This provides a gentle, step-less acceleration of the motor up to full speed.",
    "Unlike a DOL starter that applies full voltage instantly, or a Star-Delta starter which has two distinct voltage steps, a soft starter smoothly ramps up the voltage.",
    "It works by using solid-state devices called thyristors or Silicon Controlled Rectifiers (SCRs). By precisely controlling when these SCRs turn on during each AC cycle (a technique called 'phase-angle control'), the soft starter can effectively 'chop' the voltage waveform, gradually increasing the voltage supplied to the motor from an initial setting up to the full line voltage.",
    "The main benefits include reduced mechanical stress on the motor and connected equipment, lower inrush currents which reduces electrical stress on the power supply, and an overall smoother startup. Use the animation below to see the voltage ramp-up in action."
  ],
  visual: SoftStarterVisual,
};
