import { DCMotorVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const dcMotorTopic: LearningTopic = {
  id: 'dc-motor',
  title: 'DC Motors',
  content: [
    "A Direct Current (DC) motor is a type of motor that converts DC electrical energy into mechanical energy. It's one of the simplest types of motors.",
    "The basic principle involves a current-carrying conductor in a magnetic field. This interaction creates a force (Lorentz force) that produces torque on a rotating armature. A key component is the 'commutator', a mechanical switch that reverses the direction of current in the windings twice every rotation, allowing the motor to keep spinning continuously in one direction.",
    "A fundamental characteristic of simple DC motors is that their direction of rotation is dependent on the polarity of the applied voltage. If you reverse the positive and negative connections, the motor will spin in the opposite direction.",
    "DC motors are widely used in applications where speed control is important and a DC power source (like a battery) is available, such as in toys, automotive power windows and seats, and small robotic applications."
  ],
  visual: DCMotorVisual,
};
