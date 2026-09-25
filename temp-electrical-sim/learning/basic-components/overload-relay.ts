import { OverloadRelayVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const overloadRelayTopic: LearningTopic = {
  id: 'what-is-an-overload-relay',
  title: 'What is an Overload Relay?',
  content: [
    "An Overload Relay (OLR) is a crucial protection device for electric motors. Its primary job is to protect the motor from overheating due to drawing too much current (an overload condition).",
    "It's different from a circuit breaker. While a breaker protects against large, sudden short circuits, an overload relay protects against sustained, smaller overcurrents that would eventually burn out the motor windings over time.",
    "Inside, it typically uses bimetallic strips. The motor's current passes through small heaters next to these strips. If the motor is overloaded, the current increases, the heaters get hotter, and the bimetallic strips bend.",
    "When a strip bends far enough, it trips a mechanism. This action opens a Normally Closed (NC) contact (terminals 95-96) and closes a Normally Open (NO) contact (terminals 97-98).",
    "The NC contact is wired in series with the motor's contactor coil. When it opens, it cuts power to the coil, stopping the motor safely. The NO contact is often used to turn on a warning light to alert an operator that the motor has tripped.",
    "Use the simulation below to see how an overload condition affects the relay's contacts."
  ],
  visual: OverloadRelayVisual,
};
