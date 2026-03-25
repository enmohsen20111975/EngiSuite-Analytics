import { ForwardReverseVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const forwardReverseStarterTopic: LearningTopic = {
  id: 'forward-reverse-starter',
  title: 'Forward-Reverse Starter',
  content: [
    "A forward-reverse starter is a common control circuit used to run a three-phase motor in both clockwise and counter-clockwise directions. This is essential for applications like conveyor belts, hoists, and industrial doors.",
    "The principle is simple: to reverse a three-phase motor, you just need to swap any two of its three power supply lines. This circuit achieves that using two separate contactors: one for forward (KM1) and one for reverse (KM2).",
    "A critical feature of this circuit is 'interlocking'. This prevents both contactors from being energized at the same time, which would cause a dead short circuit between two phases and catastrophic failure.",
    "There are two types of interlocking used:",
    "1. Electrical Interlocking: In the control circuit for the forward contactor (KM1), a normally closed auxiliary contact from the reverse contactor (KM2) is placed in series. And vice-versa. This means KM1 cannot get power if KM2 is active, and KM2 cannot get power if KM1 is active.",
    "2. Mechanical Interlocking: A physical device is often mounted between the two contactors that mechanically prevents one from closing if the other is already closed. This provides a redundant, fail-safe layer of protection.",
    "Interact with the diagram below to see how the phase-swapping and interlocking work together."
  ],
  visual: ForwardReverseVisual,
};
