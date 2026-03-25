import { StarDeltaVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const starDeltaStarterTopic: LearningTopic = {
  id: 'star-delta-starter',
  title: 'Star-Delta Starter',
  content: [
    "A Star-Delta (or Wye-Delta) starter is a common method used to reduce the starting current of a three-phase induction motor. It's used for larger motors where a Direct-On-Line (DOL) start would draw too much current from the power supply, causing voltage dips.",
    "The motor's windings must be accessible at six terminals (U1, V1, W1, U2, V2, W2) for this to work. The starter uses three contactors: a Main contactor, a Star contactor, and a Delta contactor.",
    "The starting sequence is controlled by a timer:",
    "1. Star Connection: When the start button is pressed, the Main and Star contactors close. This connects the motor windings in a 'star' configuration. In this setup, the voltage across each winding is reduced to 1/√3 (about 58%) of the line voltage, which significantly reduces the starting current and torque.",
    "2. Timer Starts: The motor starts accelerating with reduced torque.",
    "3. Changeover to Delta: After a set time, when the motor has reached about 70-80% of its full speed, the timer triggers a changeover. The Star contactor opens, and after a very brief delay, the Delta contactor closes. This reconnects the motor windings in a 'delta' configuration.",
    "4. Delta Connection: In the delta configuration, the full line voltage is applied across each winding, and the motor runs at its full power and torque.",
    "This two-stage start provides a much smoother, lower-current startup for large motors."
  ],
  visual: StarDeltaVisual,
};
