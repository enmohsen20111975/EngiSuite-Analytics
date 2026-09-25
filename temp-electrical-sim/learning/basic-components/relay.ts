import { RelayVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const relayTopic: LearningTopic = {
  id: 'what-is-a-relay',
  title: 'What is a Relay?',
  content: [
      "A relay is also an electrically operated switch, much like a contactor. However, relays are typically used for lower current applications.",
      "Their main purpose is to use a small electrical signal to control a much larger signal. They are fundamental building blocks in control logic, allowing one circuit to switch another circuit on or off.",
      "A standard relay has a coil (like a contactor) and a set of contacts. These contacts usually include a 'Common' (COM) terminal, a 'Normally Open' (NO) terminal, and a 'Normally Closed' (NC) terminal.",
      "When the coil is off, the Common terminal is connected to the Normally Closed terminal. When the coil is energized, the magnetic field flips an internal switch, connecting the Common terminal to the Normally Open terminal instead.",
      "This ability to switch between two different paths makes relays very versatile for creating logic circuits."
  ],
  visual: RelayVisual,
};
