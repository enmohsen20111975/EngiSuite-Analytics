import { VFDVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const vfdTopic: LearningTopic = {
  id: 'vfd',
  title: 'Variable Frequency Drive (VFD)',
  content: [
    "A Variable Frequency Drive (VFD) is a type of motor controller that drives an electric motor by varying the frequency and voltage of its power supply. VFDs are used in applications where adjustable speed is needed.",
    "The speed of an AC induction motor is directly proportional to the frequency of the AC power. By changing the frequency, a VFD can control the motor's speed with high precision, from a slow crawl to full speed and beyond.",
    "A VFD works in three main stages:",
    "1. Rectifier: It first takes the incoming AC power and converts it into DC power.",
    "2. DC Bus: The DC power is smoothed out and stored in capacitors.",
    "3. Inverter: High-speed switches (like IGBTs) turn the DC power on and off very rapidly to create a simulated AC waveform of any desired frequency. This is a form of Pulse Width Modulation (PWM).",
    "Besides speed control, VFDs provide benefits like soft starting (reducing mechanical and electrical stress), energy savings (by running the motor only as fast as needed), and reverse operation.",
    "Use the interactive diagram below to change the frequency and see how it affects the motor's speed."
  ],
  visual: VFDVisual,
};
