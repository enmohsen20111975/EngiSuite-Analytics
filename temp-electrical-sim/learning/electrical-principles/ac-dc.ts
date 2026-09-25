import { ACDCFlowVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const acDcTopic: LearningTopic = {
  id: 'ac-dc-current',
  title: 'AC vs. DC Current',
  content: [
    "Electrical current can flow in two different ways: Direct Current (DC) or Alternating Current (AC).",
    "Direct Current (DC) is the simpler of the two. It describes the flow of electrons in a single, constant direction. A battery is a perfect example of a DC power source; it has a fixed positive and negative terminal, and current always flows from one to the other.",
    "Alternating Current (AC) is the type of electricity that powers our homes and industries. In AC, the flow of electrons periodically reverses direction, oscillating back and forth. This oscillation is described by a sine wave.",
    "The reason AC is so widely used is that it's much easier to 'transform' its voltage up or down. High voltage is efficient for long-distance power transmission, and low voltage is safer for use in homes and businesses.",
    "The animation below provides a clear visual comparison of the electron flow in both AC and DC circuits."
  ],
  visual: ACDCFlowVisual,
};