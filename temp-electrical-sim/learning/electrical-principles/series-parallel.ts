import { SeriesParallelVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const seriesParallelTopic: LearningTopic = {
  id: 'series-parallel-circuits',
  title: 'Series & Parallel Circuits',
  content: [
    "Components in a circuit can be connected in two basic ways: series or parallel. The way they are connected dramatically changes the circuit's behavior.",
    "Series Circuit: Components are connected end-to-end, forming a single path for the current to flow. If you remove one component (like unscrewing a light bulb), the entire path is broken, and all components will turn off. The total resistance is the sum of all individual resistances, and the voltage is divided among the components.",
    "Parallel Circuit: Components are connected across the same two points, creating multiple branches for the current to flow. If you remove one component, the other branches are unaffected and will continue to work. The voltage across each branch is the same, but the current divides among them.",
    "Most real-world electrical systems, like the wiring in your house, use parallel circuits so that you can turn on one light without having to turn on everything.",
    "Use the interactive diagram below to see the difference for yourself."
  ],
  visual: SeriesParallelVisual,
};
