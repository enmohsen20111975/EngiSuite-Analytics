import { LevelSwitchVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const levelSwitchTopic: LearningTopic = {
  id: 'level-switch',
  title: 'Level Switches',
  content: [
    "A level switch is used to detect the level of a liquid or solid within a tank or container. One of the simplest and most common types is the float switch.",
    "A float switch uses a buoyant object (the float) connected to a mechanical arm. As the liquid level rises or falls, the float moves with it, causing the arm to pivot.",
    "This pivoting motion is used to actuate an electrical switch, which can be configured as Normally Open or Normally Closed. This signal can then be used to turn a pump on or off, open or close a valve, or trigger an alarm for high or low levels.",
    "They are widely used for automatic pump control in sumps, water tanks, and for preventing tanks from overflowing or running dry. Drag the slider to adjust the water level and see the float switch operate."
  ],
  visual: LevelSwitchVisual,
};
