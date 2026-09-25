import { InductorVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const inductorTopic: LearningTopic = {
  id: 'inductor-dc',
  title: 'Inductors in DC Circuits',
  content: [
    "An inductor is another fundamental component, typically a coil of wire, that stores energy in a magnetic field when electric current flows through it.",
    "An inductor's defining property is its opposition to changes in current. When current starts to flow, the inductor generates a 'back EMF' (electromotive force) that resists the increase in current. This means the current ramps up slowly, not instantly.",
    "Conversely, if you try to stop the current suddenly (by opening a switch), the collapsing magnetic field will induce a large voltage spike in the opposite direction, trying to keep the current flowing. This property is used in boost converters but can also damage switch contacts if not managed (e.g., with a flyback diode).",
    "This 'electrical inertia' makes inductors essential for applications like power supply filters (to smooth out current), and transformers.",
    "The animation below shows the magnetic field building as current ramps up, and the energy release when the circuit is opened."
  ],
  visual: InductorVisual,
};
