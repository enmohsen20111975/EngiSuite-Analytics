import { TimerOnDelayVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const timerOnDelayTopic: LearningTopic = {
  id: 'on-delay-timer',
  title: 'Timers (On-Delay / TON)',
  content: [
    "A timer relay is an essential component for introducing time-based control into a circuit. It allows actions to be delayed after an event occurs. One of the most common types is the On-Delay Timer, often abbreviated as TON (Timer On-Delay).",
    "Its operation is straightforward: when the timer's coil is energized, it begins counting to a preset time. It does *not* immediately change its contacts.",
    "Once the timer has finished counting (i.e., the preset time has elapsed), its contacts will change state: any Normally Open (NO) contacts will close, and any Normally Closed (NC) contacts will open.",
    "The contacts will remain in this changed state for as long as the coil remains energized. As soon as power is cut from the coil, the contacts instantly reset to their original (normal) positions, regardless of whether the timer had finished counting or not.",
    "This behavior is perfect for situations like allowing a motor to get up to speed before engaging another process, or sequencing the start-up of multiple machines."
  ],
  visual: TimerOnDelayVisual,
};
