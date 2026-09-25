import { LimitSwitchVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const limitSwitchTopic: LearningTopic = {
  id: 'limit-switch',
  title: 'Limit Switches',
  content: [
    "A limit switch is a mechanical switch used to detect the presence or absence of an object, or to detect when a machine part has reached the end of its travel.",
    "It consists of an actuator (like a lever, roller, or plunger) that is mechanically linked to a set of electrical contacts. When an object makes contact with the actuator, it moves and causes the electrical contacts to change state.",
    "Just like a relay, a limit switch typically has a set of Normally Open (NO) and Normally Closed (NC) contacts.",
    "Before being actuated, the NC contact allows current to flow, and the NO contact does not. When the actuator is pressed, the internal mechanism flips, opening the NC contact and closing the NO contact.",
    "They are simple, rugged, and reliable, making them extremely common in industrial automation for sensing the position of machine parts, doors, and products on a conveyor line. Click the lever in the animation to see the contacts change state."
  ],
  visual: LimitSwitchVisual,
};