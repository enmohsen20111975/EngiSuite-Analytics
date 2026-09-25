
import React from 'react';

// Import lesson components
import PascalsLaw from '../components/training/lessons/PascalsLaw';
import CylinderAnimation from '../components/training/lessons/CylinderAnimation';
import HydraulicPumpPrinciples from '../components/training/lessons/HydraulicPumpPrinciples';
import ValveTypes from '../components/training/lessons/ValveTypes';
import BasicCircuit from '../components/training/lessons/BasicCircuit';
import ReadingSchematics from '../components/training/lessons/ReadingSchematics';
import RelayLogic from '../components/training/lessons/RelayLogic';
import PressureValvesExplained from '../components/training/lessons/PressureValvesExplained';
import PlcIntegration from '../components/training/lessons/PlcIntegration';
import SeriesParallel from '../components/training/lessons/SeriesParallel';
import Pneumatics101 from '../components/training/lessons/Pneumatics101';
import SafetyCircuit from '../components/training/lessons/SafetyCircuit';


export interface LessonTopic {
  id: string;
  title: string;
  category: string;
  description: string;
  component: React.FC;
}

export const lessons: LessonTopic[] = [
  { 
    id: 'pascals-law', 
    title: "Pascal's Law", 
    category: "Fundamentals",
    description: "Learn how force is multiplied in hydraulic systems.",
    component: PascalsLaw 
  },
  { 
    id: 'reading-schematics', 
    title: "Reading Schematics", 
    category: "Fundamentals",
    description: "An interactive guide to common fluid power symbols.",
    component: ReadingSchematics
  },
   { 
    id: 'pneumatics-vs-hydraulics', 
    title: "Pneumatics vs. Hydraulics", 
    category: "Fundamentals",
    description: "Compare the principles of pneumatic (air) and hydraulic (fluid) systems.",
    component: Pneumatics101
  },
  { 
    id: 'hydraulic-pumps', 
    title: "Hydraulic Pumps", 
    category: "Components",
    description: "Explore the inner workings of gear, vane, and piston pumps.",
    component: HydraulicPumpPrinciples
  },
  { 
    id: 'cylinder-animation', 
    title: "Cylinders", 
    category: "Components",
    description: "See how a double-acting cylinder extends and retracts.",
    component: CylinderAnimation
  },
  { 
    id: 'valve-types', 
    title: "Control Valves", 
    category: "Components",
    description: "Understand how directional control valves route fluid.",
    component: ValveTypes
  },
  { 
    id: 'pressure-valves', 
    title: "Pressure Valves", 
    category: "Components",
    description: "Compare and contrast pressure relief and pressure reducing valves.",
    component: PressureValvesExplained
  },
  { 
    id: 'basic-circuit', 
    title: "Basic Circuit", 
    category: "Circuit Design",
    description: "Follow the flow of fluid in a simple hydraulic circuit.",
    component: BasicCircuit
  },
  { 
    id: 'series-vs-parallel', 
    title: "Series vs. Parallel", 
    category: "Electrical Control",
    description: "Learn the fundamental differences between series and parallel circuits.",
    component: SeriesParallel
  },
  { 
    id: 'relay-logic', 
    title: "Relay Logic", 
    category: "Electrical Control",
    description: "Understand how relays use a small current to switch a larger one.",
    component: RelayLogic
  },
   { 
    id: 'plc-control', 
    title: "PLC Integration", 
    category: "Electrical Control",
    description: "See how a PLC reads inputs, runs logic, and controls outputs.",
    component: PlcIntegration
  },
  { 
    id: 'safety-circuit', 
    title: "E-Stop Safety Circuit", 
    category: "Electrical Control",
    description: "Learn how an E-Stop button and safety relay protect machinery.",
    component: SafetyCircuit
  },
];
