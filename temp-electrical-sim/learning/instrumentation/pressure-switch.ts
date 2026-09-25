import { PressureSwitchVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const pressureSwitchTopic: LearningTopic = {
  id: 'pressure-switch',
  title: 'Pressure Switches',
  content: [
    "A pressure switch is a device that monitors pressure in a system (like air in a tank or fluid in a pipe) and opens or closes an electrical contact when a certain pressure is reached.",
    "It typically works using a diaphragm or piston that moves in response to the system pressure. This movement is opposed by a pre-set spring.",
    "When the system pressure becomes strong enough to overcome the spring force, it moves a mechanical linkage that actuates a set of electrical contacts (NO and NC), similar to a relay or limit switch.",
    "The pressure at which the switch activates is called the 'setpoint'. The difference in pressure between where it activates and where it deactivates is called the 'deadband' or 'differential'.",
    "Pressure switches are essential for automating tasks like starting an air compressor when the tank pressure is low, or triggering an alarm if hydraulic pressure is too high. Use the slider below to see it in action."
  ],
  visual: PressureSwitchVisual,
};
