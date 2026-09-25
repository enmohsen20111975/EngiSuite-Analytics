import { ThermocoupleVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const thermocoupleTopic: LearningTopic = {
  id: 'thermocouple',
  title: 'Thermocouples',
  content: [
    "A thermocouple is a sensor used to measure temperature. It consists of two different types of metal wires joined together at one end, called the 'hot junction' or 'measuring junction'.",
    "The principle behind it is the 'Seebeck effect': when the junction of two dissimilar metals is heated or cooled, a small voltage is produced that is proportional to the temperature difference between the hot junction and the other end, the 'cold junction'.",
    "Different combinations of metals (like Type K: Chromel-Alumel) produce different voltage characteristics and are suitable for different temperature ranges. The voltage produced is very small (millivolts), so it requires a specialized controller or transmitter to amplify and interpret the signal.",
    "Thermocouples are very popular because they are inexpensive, durable, and can measure a very wide range of temperatures, from hundreds of degrees below zero to well over 2000°C. Use the slider to heat the junction and see the voltage output."
  ],
  visual: ThermocoupleVisual,
};
