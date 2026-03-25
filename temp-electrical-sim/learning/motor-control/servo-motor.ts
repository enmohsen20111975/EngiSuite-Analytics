import { ServoMotorVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const servoMotorTopic: LearningTopic = {
  id: 'servo-motor',
  title: 'Servo Motors',
  content: [
    "A servo motor is not just a motor; it's a complete closed-loop system for precise position control. It consists of a motor (usually DC), a feedback device (like a potentiometer or encoder), a gearbox, and a control circuit.",
    "The control circuit receives a command signal (typically a Pulse Width Modulation or PWM signal) that specifies a target angle or position. The feedback device constantly measures the actual position of the motor shaft.",
    "The control circuit compares the target position with the actual position and drives the motor to correct any error. If the motor overshoots, the controller will drive it back. This continuous feedback loop allows the servo to hold its position firmly and move to new positions with high accuracy and speed.",
    "Because of their ability to control angular or linear position, velocity, and acceleration with high precision, servo motors are essential in robotics, CNC machinery, automated manufacturing, and high-performance radio-controlled vehicles."
  ],
  visual: ServoMotorVisual,
};
