import { TimerOffDelayVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const timerOffDelayTopic: LearningTopic = {
  id: 'off-delay-timer',
  title: 'Timers (Off-Delay / TOF)',
  content: [
    "The Off-Delay Timer (TOF) is the counterpart to the On-Delay timer. It's used when you need an action to continue for a set period *after* the initial signal has been turned off.",
    "Its operation is the reverse of a TON timer: when the timer's coil is energized, its contacts change state *immediately*. The Normally Open (NO) contacts close, and the Normally Closed (NC) contacts open right away.",
    "The timing period only begins when the coil is *de-energized*. At that moment, the timer starts counting down from its preset time. During this countdown, the contacts remain in their changed (energized) state.",
    "Once the timer has finished counting down to zero, the contacts finally reset to their normal positions (NO opens, NC closes).",
    "This is useful for applications like running a cooling fan for a minute after a machine has been shut down, or keeping a light on in a hallway for a short time after the switch is flicked off."
  ],
  visual: TimerOffDelayVisual,
};
