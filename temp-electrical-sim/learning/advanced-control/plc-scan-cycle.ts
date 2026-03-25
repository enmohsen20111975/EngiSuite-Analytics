import { PLCScanCycleVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const plcScanCycleTopic: LearningTopic = {
  id: 'plc-scan-cycle',
  title: 'The PLC Scan Cycle',
  content: [
    "A Programmable Logic Controller (PLC) doesn't execute its program like a regular computer. Instead, it runs a continuous, repetitive loop called the 'scan cycle'. Understanding this cycle is fundamental to PLC programming.",
    "The scan cycle consists of four main steps, executed very rapidly:",
    "1. Read Inputs: The PLC checks the status of all its physical inputs (switches, sensors, etc.) and stores their ON/OFF state in its memory.",
    "2. Execute Program: It then runs the user-written program (like ladder logic) from top to bottom, one instruction at a time. It uses the input states it just saved and the current program logic to determine what the output states should be.",
    "3. Diagnostics & Comms: The PLC performs internal health checks and handles any communication tasks with other devices or networks.",
    "4. Write Outputs: Finally, the PLC updates the state of all its physical outputs (lights, coils, motors) based on the results of the program execution.",
    "This entire loop repeats continuously, thousands of times per second. The time it takes to complete one full loop is called the 'scan time', which is typically just a few milliseconds."
  ],
  visual: PLCScanCycleVisual,
};
