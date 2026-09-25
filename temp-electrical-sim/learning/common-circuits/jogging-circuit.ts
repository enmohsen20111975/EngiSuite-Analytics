import { JoggingCircuitVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const joggingCircuitTopic: LearningTopic = {
  id: 'jogging-circuit',
  title: 'Jogging / Inching Circuit',
  content: [
    "A Jogging (or 'Inching') circuit is a modification to a standard motor starter that allows an operator to run a motor for very short, precise movements. This is crucial for tasks like positioning a conveyor belt, aligning a machine part, or performing maintenance.",
    "The circuit uses a selector switch to choose between 'RUN' mode and 'JOG' mode.",
    "In 'RUN' mode, the circuit behaves exactly like a standard DOL starter. The 'Start' button energizes the contactor coil, and the latching (holding) contact keeps the motor running until the 'Stop' button is pressed.",
    "In 'JOG' mode, the selector switch changes the circuit path. It disables the latching contact and enables a 'Jog' push button. Now, the motor will only run as long as the 'Jog' button is held down. When it's released, the motor stops immediately. This provides the precise, momentary control needed for jogging operations.",
    "This dual-mode control is a very common and useful feature in industrial panels."
  ],
  visual: JoggingCircuitVisual,
};
