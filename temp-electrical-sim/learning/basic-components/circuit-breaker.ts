import { MCBVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const circuitBreakerTopic: LearningTopic = {
  id: 'what-is-a-circuit-breaker',
  title: 'What is a Circuit Breaker?',
  content: [
      "A circuit breaker is an automatic safety switch designed to protect an electrical circuit from damage caused by excess current from an overload or a short circuit. Its basic function is to interrupt current flow after a fault is detected.",
      "Unlike a fuse, which operates once and then must be replaced, a circuit breaker can be reset (either manually or automatically) to resume normal operation.",
      "Circuit breakers have two primary trip mechanisms:",
      "1. Thermal Trip (Overload): A bimetallic strip heats up with the current. If the current is slightly too high for too long (an overload condition), the strip bends and trips the breaker. This is a slow-acting mechanism.",
      "2. Magnetic Trip (Short Circuit): An electromagnet responds instantly to the large surge of current from a short circuit. The strong magnetic field immediately trips the breaker to prevent major damage. This is a very fast-acting mechanism.",
      "Interact with the diagram below to see both trip mechanisms in action."
  ],
  visual: MCBVisual,
};
