import { ContactorVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const contactorTopic: LearningTopic = {
  id: 'what-is-a-contactor',
  title: 'What is a Contactor?',
  content: [
    "A contactor is a heavy-duty, electrically-controlled switch used for switching a high-power electrical circuit, similar to a relay but designed for larger currents. It's the workhorse for starting and stopping motors, controlling lighting, and managing other industrial loads.",
    "It has two main parts: the coil and the main contacts. The coil is part of the control circuit, which operates at a lower voltage (like 24V DC). The main contacts are part of the power circuit, which handles high voltages (like 400V AC).",
    "When the coil is energized by the control circuit, it creates a magnetic field. This magnetic field pulls an armature, which physically closes the main power contacts. This allows high-voltage electricity to flow through to the load (e.g., a motor). When the coil is de-energized, the magnetic field collapses, and springs pull the contacts open, stopping the flow of power.",
    "This separation of control and power circuits is a key safety and design feature in industrial automation. It allows low-voltage, simple logic (from buttons, PLCs, or sensors) to safely control very powerful machinery.",
    "Below is an interactive animation. Hover over the coil to see how it works!"
  ],
  visual: ContactorVisual,
};
