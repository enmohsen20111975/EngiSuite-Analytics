import { ProximitySensorVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const proximitySensorTopic: LearningTopic = {
  id: 'proximity-sensor',
  title: 'Inductive Proximity Sensors',
  content: [
    "A proximity sensor is able to detect the presence of nearby objects without any physical contact. An inductive proximity sensor is a common type designed specifically to detect metallic objects.",
    "The sensor's face contains a coil that generates a high-frequency oscillating magnetic field. This field emanates from the sensor's face.",
    "When a metallic object enters this field, it induces small electrical currents (called eddy currents) on the surface of the metal. These eddy currents create their own magnetic field that opposes the sensor's field.",
    "The sensor's internal circuitry detects this change in the magnetic field (specifically, a drop in the oscillation's amplitude). Once the change passes a certain threshold, the sensor's output switches state, signaling the detection of the object.",
    "Because they are non-contact, sealed, and have no moving parts, inductive proximity sensors are extremely reliable for detecting the position of metal parts in harsh industrial environments. Drag the metal target in the animation to trigger the sensor."
  ],
  visual: ProximitySensorVisual,
};