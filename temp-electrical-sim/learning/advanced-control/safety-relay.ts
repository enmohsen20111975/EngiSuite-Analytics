import { SafetyRelayVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const safetyRelayTopic: LearningTopic = {
  id: 'safety-relay',
  title: 'Safety Relays',
  content: [
    "A safety relay is a critical component designed to correctly implement safety functions in machinery. Standard relays and PLCs can fail in unpredictable ways, but safety relays are designed with redundancy and self-monitoring to ensure they fail into a safe state.",
    "They are used to monitor safety devices like Emergency Stop buttons, light curtains, and safety gate switches. These relays typically use a 'dual-channel' input, meaning they monitor two separate electrical contacts from the safety device. This redundancy ensures that a single fault (like a welded contact or broken wire) doesn't lead to a dangerous situation.",
    "When a safety device is triggered (e.g., an E-Stop is pressed), the safety relay's internal logic opens its safety outputs, reliably cutting power to the machine's primary control elements (like a motor contactor).",
    "A key feature is the manual 'Reset' function. Even after the safety fault is cleared (e.g., the E-Stop is released), the machine will not restart until a separate Reset button is pressed. This prevents unexpected machine startup. Interact with the simulation to see this process."
  ],
  visual: SafetyRelayVisual,
};
