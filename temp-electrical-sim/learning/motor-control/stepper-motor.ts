import { StepperMotorVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const stepperMotorTopic: LearningTopic = {
  id: 'stepper-motor',
  title: 'Stepper Motors',
  content: [
    "A stepper motor is a brushless DC motor that divides a full rotation into a number of equal, discrete steps. This allows for extremely precise control over the motor's position without needing a feedback sensor (this is known as open-loop control).",
    "The motor's stator is made up of pairs of electromagnets (coils), and the rotor is typically a toothed piece of iron. The controller energizes these coils in a specific sequence.",
    "Each time the sequence advances, the rotor's teeth are attracted to the next set of energized stator poles, causing the rotor to 'step' forward by a fixed, small angle. By sending a specific number of pulses to the controller, you can make the motor turn by a precise angle and hold that position firmly.",
    "This step-by-step motion makes stepper motors ideal for applications that require precise positioning, such as 3D printers, CNC mills, camera platforms, and computer-controlled machinery."
  ],
  visual: StepperMotorVisual,
};
