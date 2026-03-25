import { TransformerOperationVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const transformerOperationTopic: LearningTopic = {
  id: 'transformer-operation',
  title: 'How a Transformer Works',
  content: [
    "A transformer is a passive electrical device that transfers electrical energy from one circuit to another through the principle of electromagnetic induction. It is most commonly used to increase ('step-up') or decrease ('step-down') AC voltages.",
    "It consists of two coils of wire, the 'primary winding' and the 'secondary winding', wrapped around a common iron core. There is no direct electrical connection between the two coils.",
    "When an AC voltage is applied to the primary winding, it creates a fluctuating magnetic field (or 'flux') in the iron core. This changing magnetic field then 'induces' a voltage in the secondary winding.",
    "The ratio of the number of turns in the primary coil to the number of turns in the secondary coil determines whether the voltage is stepped up or down. If the secondary has more turns, the voltage will be higher; if it has fewer turns, the voltage will be lower.",
    "Hover over the primary coil in the animation to see the magnetic flux in action."
  ],
  visual: TransformerOperationVisual,
};