import { CapacitorVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const capacitorTopic: LearningTopic = {
  id: 'capacitor-dc',
  title: 'Capacitors in DC Circuits',
  content: [
    "A capacitor is a fundamental electronic component that stores electrical energy in an electric field. It's like a tiny, rechargeable battery that can charge and discharge very quickly.",
    "It consists of two conductive plates separated by an insulating material called a dielectric. When a voltage is applied across the plates, electric charge accumulates—positive charge on one plate and negative on the other.",
    "When you first connect a capacitor to a DC source, current flows freely as the capacitor charges. As it charges, the voltage across it increases, opposing the source voltage and causing the current to decrease. Once the capacitor's voltage matches the source, the current stops.",
    "If you then disconnect the source and provide a path for discharge (like through an LED), the stored energy is released, creating a burst of current that diminishes as the capacitor runs out of charge.",
    "This behavior is crucial for timing circuits, smoothing power supplies, and filtering signals. Use the animation to see this charge/discharge cycle in action."
  ],
  visual: CapacitorVisual,
};
