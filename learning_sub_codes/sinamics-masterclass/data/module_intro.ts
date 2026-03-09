
import { Lesson } from '../types';

export const INTRO_LESSONS: Lesson[] = [
  {
    id: 'l1-1',
    title: 'Welcome to SINAMICS',
    content: `### The Power Behind Automation
SINAMICS is the umbrella brand for Siemens' electric drives technology. From a simple 0.12 kW fan drive to a 120 MW ship propulsion system, SINAMICS provides the muscle for modern industry. But it is more than just hardware; it is a philosophy of **Integrated Drive Systems (IDS)**.

> **Engineering Fact:** Over 60% of the world's industrial electrical energy is consumed by electric motors. Optimizing these motors with VFDs can reduce global energy consumption by 10%.

### Why SINAMICS?
1. **Uniformity**: Whether it's a servo or a huge vector drive, the parameter structure (p-codes) remains consistent. If you learn how to program a G120, you effectively know 80% of an S120.
2. **Totally Integrated Automation (TIA)**: Drives are not islands. They are seamlessly integrated into the TIA Portal, allowing PLC and Drive to act as one unit. The engineering time is reduced by up to 30% due to shared databases.
3. **Safety Integrated**: Functional safety (STO, SS1, SLS) is built directly into the electronic boards. This removes the need for external safety relays, complex wiring, and reduces the cabinet footprint.

### Course Roadmap
This course is designed to take you from "What is a VFD?" to "I can commission a 5-axis servo system with Safety Integrated." We will cover hardware selection, electrical installation, software parameterization, and advanced troubleshooting.`
  },
  {
    id: 'l1-2',
    title: 'The SINAMICS Portfolio',
    content: `Understanding the "Families" is crucial for selection. Choosing the wrong drive family is a common engineering mistake that leads to cost overruns or technical limitations later.

### SINAMICS V (Basic Performance)
Designed for "Connect & Run" applications.
- **V20**: Basic general purpose. Perfect for simple pumps, fans, and conveyors. It does **not** support PROFINET IRT or advanced safety. It is a cost-effective solution for standalone machines.
- **V90**: The Basic Servo. It is paired with the 1FL6 motor. It is ideal for Pick-and-Place machines, packaging, and basic positioning. It uses Pulse/Direction or PROFINET Basic.

### SINAMICS G (General Purpose)
The workhorse of the industry. These drives handle induction motors with vector control.
- **G120**: The modular standard. It consists of a **Control Unit (CU)** and a **Power Module (PM)**. This modularity allows you to upgrade the "Brain" without replacing the "Muscle".
- **G120C**: Compact. The CU and PM are fused into one unit. It has a smaller footprint but is less flexible (e.g., you cannot swap the CU if you need different I/O).
- **G120X**: Infrastructure specialist. Optimized specifically for Pumps & Fans (HVAC/Water). It features built-in "Deragging" (cleaning pumps), Pipe Filling Mode, and Cascade Control for multi-pump systems.

### SINAMICS S (High Performance)
For complex, multi-axis motion and maximum precision.
- **S120**: The flagship. It uses a **Common DC Bus** architecture. A single "Line Module" (Rectifier) creates DC power, which is shared by multiple "Motor Modules" (Inverters).
> **Tip:** Use S120 when you have multiple axes that exchange energy. For example, in a winder/unwinder machine, the unwinder brakes (generates energy) which flows across the DC bus to power the winder, saving massive amounts of energy.
- **S210**: High-dynamic single-axis servo. Designed for high-speed packaging. It connects to 1FK2 motors using a single cable (OCC) that carries Power, Brake, and Encoder signals.`
  },
  {
    id: 'l1-3',
    title: 'The TIA Portal Advantage',
    content: `### One Engineering Environment
Unlike competitors where the PLC software and Drive software are separate programs (that often crash or have version conflicts), Siemens uses **TIA Portal** for everything: PLC, HMI, Drive, and Safety.

### Key Benefits
1. **Shared Database**: When you create a tag "Conveyor_Speed" in the PLC, you can instantly drag that tag into the Drive's telegram configuration. There are no typos, no address mismatches, and no excel sheets needed to map memory.
2. **System Diagnostics**: If the Drive faults, the PLC knows immediately via the "System Diagnostics" channel. You can view the Drive's fault message (e.g., "F30002 Overvoltage") directly on the PLC's HMI or Web Server without writing a single line of PLC code.
3. **Library Concept**: You can create a "Standard Pump Block" that contains both the PLC logic (Function Block) and the Drive Parameter set. You can then drag this block into any new project to instantiate a fully tested pump station in seconds.

### Startdrive vs. STARTER
- **STARTER**: The legacy software. It is still used for older drives (Micromaster) or very complex Simotion applications.
- **Startdrive**: The modern tool inside TIA Portal. It is the future standard for G120, S120, and S210.`
  },
  {
    id: 'l1-4',
    title: 'Digitalization & Industrial Edge',
    content: `### The Drive as a Sensor
Modern drives are not just power supplies; they are high-speed data acquisition devices. They monitor current, torque, voltage, and temperature in millisecond intervals.

### Industrial Edge for Drives
You can install an "Edge Device" (like a small PC) next to the drive.
- **Analyze MyDrives**: This app runs on the Edge. It records the torque curve of your machine 24/7.
- **Predictive Maintenance**: If the torque on a conveyor belt slowly increases over 3 months, the AI model can predict "Bearing Failure in 2 weeks" before the bearing actually seizes. This prevents unplanned downtime.
- **High Frequency Sampling**: The Edge device can pull data at 4kHz (4000 times a second), which is impossible for a standard PLC to handle.

### MindSphere
The cloud solution. You can push KPIs (Key Performance Indicators) from your drives globally to compare factory performance. "Why is the pump in Berlin using 10% more energy than the pump in Munich?"`
  },
  {
    id: 'l1-5',
    title: 'Selection Guide: Which Drive?',
    content: `### The Decision Matrix
How do you choose between G120, S120, or V90?

1. **Do you need synchronized axes?** (e.g., a robot arm or printing press)
   - **YES**: Use **S120** or **S210**. (Isosynchronous mode required).
   - **NO**: Go to step 2.

2. **Is it a basic pump/fan or conveyor?**
   - **YES**: Use **G120** or **G120X**.
   - **NO**: It's a high-speed packaging machine? Go to Step 1.

3. **Do you need energy regeneration?** (Braking frequently)
   - **YES**: Use **PM250** (G120) or **Active Line Module** (S120).
   - **NO**: Use **PM240-2** (G120) with a braking resistor.

4. **Is space critical?**
   - **YES**: Use **S120 Booksize** (Zero side clearance) or **G120C**.
   - **NO**: Use standard G120 Modular.

> **Rule of Thumb**: If it moves something from A to B blindly (Conveyor), it's G-Series. If it positions something exactly at X,Y,Z coordinates, it's S-Series.`
  }
];
