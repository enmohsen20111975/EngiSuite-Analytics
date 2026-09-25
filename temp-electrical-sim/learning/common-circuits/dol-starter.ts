import { DOLStarterVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const dolStarterTopic: LearningTopic = {
    id: 'dol-starter',
    title: 'Direct-On-Line (DOL) Starter',
    content: [
        "The Direct-On-Line (DOL) starter is the simplest and most common method for starting a three-phase induction motor. It applies the full line voltage directly to the motor terminals.",
        "This circuit uses a Start button, a Stop button, and a contactor (with its coil and contacts). The key to its operation is the 'latching' or 'holding' contact.",
        "Here is the sequence of events:",
        "1. START: When you press the green 'Start' button (NO), it completes the circuit, allowing current to flow through the red 'Stop' button (NC) and energize the contactor's coil (KM1).",
        "2. MOTOR ON & LATCHING: As soon as the coil is energized, two things happen simultaneously: (a) The main power contacts of KM1 close, starting the motor. (b) An auxiliary contact (KM1-Aux) also closes. This contact is wired in parallel with the Start button.",
        "3. HOLDING: When you release the Start button, the circuit remains complete through the now-closed auxiliary contact. This is the 'latch' or 'hold'. The motor keeps running.",
        "4. STOP: When you press the red 'Stop' button (NC), it breaks the circuit to the coil. The coil de-energizes, and all the contactor's contacts (both main and auxiliary) spring open, stopping the motor.",
        "Try it yourself in the interactive diagram below!"
    ],
    visual: DOLStarterVisual,
};
