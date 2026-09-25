import { SolenoidVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const solenoidTopic: LearningTopic = {
  id: 'solenoid-valve',
  title: 'Solenoid Valves',
  content: [
    "A solenoid is a simple electromagnetic device consisting of a coil of wire. When current flows through the coil, it creates a uniform magnetic field. In automation, this principle is most often used in solenoid valves.",
    "A solenoid valve is an electromechanically operated valve. It contains a coil and a movable ferromagnetic core called a 'plunger'.",
    "In its resting state, a spring holds the plunger in a position that either blocks or allows flow through the valve (depending on whether it's a normally closed or normally open valve).",
    "When the coil is energized, the magnetic field it creates pulls the plunger, overcoming the spring force. This movement changes the valve's state, opening a closed path or closing an open one.",
    "This allows a small electrical signal to control the flow of fluids or gases, making them essential in hydraulic and pneumatic systems. Click the animation below to energize the coil and open the valve."
  ],
  visual: SolenoidVisual,
};