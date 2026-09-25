import { OhmsLawVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const ohmsLawTopic: LearningTopic = {
  id: 'ohms-law',
  title: "Ohm's Law (V=IR)",
  content: [
    "Ohm's Law is the most fundamental equation in all of electrical engineering. It describes the relationship between voltage (V), current (I), and resistance (R).",
    "Voltage (V): Think of it as electrical 'pressure'. It's the potential difference that pushes electrons through a circuit. Measured in Volts (V).",
    "Current (I): This is the rate of flow of electric charge (electrons). Think of it as the 'volume' of electricity flowing. Measured in Amperes (A).",
    "Resistance (R): This is the opposition to the flow of current. A higher resistance means it's harder for electrons to flow. Measured in Ohms (Ω).",
    "The law states: Voltage = Current × Resistance (V = I × R). You can also rearrange it to find the other values: I = V / R and R = V / I.",
    "Use the interactive simulation below. Adjust the voltage and resistance sliders to see how the current changes in real-time. Notice how the flow of electrons speeds up with higher voltage or lower resistance."
  ],
  visual: OhmsLawVisual,
};
