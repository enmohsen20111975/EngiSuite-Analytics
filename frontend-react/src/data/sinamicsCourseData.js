// SINAMICS Masterclass Course Data
// This module contains course structure, lessons, and simulation configurations

export const SINAMICS_COURSE = {
  id: 'sinamics-masterclass',
  title: 'SINAMICS Masterclass',
  description: 'Master Siemens SINAMICS drives technology - from fundamentals to advanced commissioning',
  discipline: 'electrical',
  level: 'intermediate',
  totalLessons: 45,
  duration: '20 hours',
  image: '/images/courses/sinamics.jpg',
  features: [
    'Interactive motor simulations',
    'PID tuning lab',
    'Power electronics visualization',
    'Real-world fault troubleshooting'
  ]
};

// Module types for SINAMICS
export const SinamicsModuleType = {
  THEORY: 'THEORY',
  SIMULATION_MOTOR: 'SIMULATION_MOTOR',
  SIMULATION_INVERTER: 'SIMULATION_INVERTER',
  SIMULATION_SAFETY: 'SIMULATION_SAFETY',
  SIMULATION_PID: 'SIMULATION_PID',
  SIMULATION_COMMISSIONING: 'SIMULATION_COMMISSIONING',
  SIMULATION_PLC: 'SIMULATION_PLC',
  SIMULATION_LOGIC: 'SIMULATION_LOGIC',
  SIMULATION_PARAMETERS: 'SIMULATION_PARAMETERS',
  SIMULATION_TEST_KIT: 'SIMULATION_TEST_KIT',
  TOOL_MOTOR_SPECS: 'TOOL_MOTOR_SPECS',
  QUIZ: 'QUIZ',
  TROUBLESHOOTING: 'TROUBLESHOOTING',
  FORUM: 'FORUM'
};

// SINAMICS Course Modules
export const SINAMICS_MODULES = [
  {
    id: 'sinamics-m1',
    title: '1. Introduction to SINAMICS',
    description: 'Overview of the SINAMICS portfolio, history, and modern automation role.',
    type: SinamicsModuleType.THEORY,
    lessons: [
      {
        id: 'sinamics-l1-1',
        title: 'Welcome to SINAMICS',
        content: `### The Power Behind Automation
SINAMICS is the umbrella brand for Siemens' electric drives technology. From a simple 0.12 kW fan drive to a 120 MW ship propulsion system, SINAMICS provides the muscle for modern industry. But it is more than just hardware; it is a philosophy of **Integrated Drive Systems (IDS)**.

> **Engineering Fact:** Over 60% of the world's industrial electrical energy is consumed by electric motors. Optimizing these motors with VFDs can reduce global energy consumption by 10%.

### Why SINAMICS?
1. **Uniformity**: Whether it's a servo or a huge vector drive, the parameter structure (p-codes) remains consistent. If you learn how to program a G120, you effectively know 80% of an S120.
2. **Totally Integrated Automation (TIA)**: Drives are not islands. They are seamlessly integrated into the TIA Portal, allowing PLC and Drive to act as one unit. The engineering time is reduced by up to 30% due to shared databases.
3. **Safety Integrated**: Functional safety (STO, SS1, SLS) is built directly into the electronic boards. This removes the need for external safety relays, complex wiring, and reduces the cabinet footprint.

### Course Roadmap
This course is designed to take you from "What is a VFD?" to "I can commission a 5-axis servo system with Safety Integrated." We will cover hardware selection, electrical installation, software parameterization, and advanced troubleshooting.`,
        type: 'reading',
        duration: 15
      },
      {
        id: 'sinamics-l1-2',
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
- **S210**: High-dynamic single-axis servo. Designed for high-speed packaging. It connects to 1FK2 motors using a single cable (OCC) that carries Power, Brake, and Encoder signals.`,
        type: 'reading',
        duration: 20
      },
      {
        id: 'sinamics-l1-3',
        title: 'The TIA Portal Advantage',
        content: `### One Engineering Environment
Unlike competitors where the PLC software and Drive software are separate programs (that often crash or have version conflicts), Siemens uses **TIA Portal** for everything: PLC, HMI, Drive, and Safety.

### Key Benefits
1. **Shared Database**: When you create a tag "Conveyor_Speed" in the PLC, you can instantly drag that tag into the Drive's telegram configuration. There are no typos, no address mismatches, and no excel sheets needed to map memory.
2. **System Diagnostics**: If the Drive faults, the PLC knows immediately via the "System Diagnostics" channel. You can view the Drive's fault message (e.g., "F30002 Overvoltage") directly on the PLC's HMI or Web Server without writing a single line of PLC code.
3. **Library Concept**: You can create a "Standard Pump Block" that contains both the PLC logic (Function Block) and the Drive Parameter set. You can then drag this block into any new project to instantiate a fully tested pump station in seconds.

### Startdrive vs. STARTER
- **STARTER**: The legacy software. It is still used for older drives (Micromaster) or very complex Simotion applications.
- **Startdrive**: The modern tool inside TIA Portal. It is the future standard for G120, S120, and S210.`,
        type: 'reading',
        duration: 15
      }
    ]
  },
  {
    id: 'sinamics-m2',
    title: '2. Fundamentals of Drives',
    description: 'Beginner guide to AC Motors, Servo theory, and Inverter physics.',
    type: SinamicsModuleType.THEORY,
    lessons: [
      {
        id: 'sinamics-l2-1',
        title: 'AC Motor Fundamentals',
        content: `### How AC Motors Work
An AC induction motor consists of two main parts:
1. **Stator**: The stationary part with windings that create a rotating magnetic field
2. **Rotor**: The rotating part that follows the stator's magnetic field

### Synchronous Speed
The speed of the rotating magnetic field is determined by:
- **Frequency** (Hz): How fast the AC alternates
- **Poles**: Number of magnetic pole pairs in the stator

Formula: **Sync Speed (RPM) = (120 × Frequency) / Poles**

For a 4-pole motor at 50Hz: (120 × 50) / 4 = **1500 RPM**

### Slip
The rotor never quite reaches synchronous speed - it "slips" behind. This slip is essential for torque production.
- **Slip = (Sync Speed - Rotor Speed) / Sync Speed × 100%**
- Typical slip at full load: 2-5%`,
        type: 'reading',
        duration: 20
      },
      {
        id: 'sinamics-l2-2',
        title: 'V/f Control Theory',
        content: `### What is V/f Control?
V/f (Voltage/Frequency) control is the simplest method to vary motor speed. The ratio of voltage to frequency is kept constant to maintain constant magnetic flux in the motor.

### The V/f Curve
- At 50Hz, motor gets 400V (ratio = 8:1)
- At 25Hz, motor gets 200V (same ratio)
- At 10Hz, motor gets 80V (same ratio)

### Limitations
1. **Low Speed Torque**: At very low frequencies, voltage boost is needed
2. **No Speed Feedback**: Actual speed is estimated, not measured
3. **Dynamic Response**: Slower response to load changes

### When to Use V/f
- Pumps and fans (quadratic torque loads)
- Simple conveyors
- Applications not requiring precise speed control`,
        type: 'reading',
        duration: 15
      }
    ]
  },
  {
    id: 'sinamics-m2-sim',
    title: 'Lab: Inverter Power Flow',
    description: 'Visualizing AC to DC to AC conversion.',
    type: SinamicsModuleType.SIMULATION_INVERTER,
    simulationType: 'sinamics-inverter-flow',
    lessons: []
  },
  {
    id: 'sinamics-m3',
    title: '3. Motor Control Modes',
    description: 'Compare V/f vs Vector Control performance.',
    type: SinamicsModuleType.THEORY,
    lessons: [
      {
        id: 'sinamics-l3-1',
        title: 'Vector Control (SLVC)',
        content: `### Sensorless Vector Control
SLVC (SensorLess Vector Control) uses advanced motor models to calculate rotor position without an encoder.

### How It Works
1. The drive measures motor current and voltage
2. A mathematical model estimates rotor flux position
3. Current is controlled in two components:
   - **Id (Flux current)**: Creates magnetic field
   - **Iq (Torque current)**: Produces torque

### Advantages over V/f
- **Better low-speed torque**: Full torque at 3Hz
- **Faster dynamic response**: Reacts to load changes in milliseconds
- **Higher efficiency**: Optimizes motor flux
- **Speed accuracy**: ±0.5% instead of ±2-3%

### Parameter p1300
- **p1300 = 0**: V/f control
- **p1300 = 20**: SLVC (without encoder)
- **p1300 = 21**: SLVC with speed controller optimization`,
        type: 'reading',
        duration: 20
      }
    ]
  },
  {
    id: 'sinamics-m4-motor',
    title: 'Lab: Motor Control Modes',
    description: 'Compare V/f vs Vector Control performance.',
    type: SinamicsModuleType.SIMULATION_MOTOR,
    simulationType: 'sinamics-motor-lab',
    lessons: []
  },
  {
    id: 'sinamics-m5',
    title: '5. Speed Controller Tuning',
    description: 'Fine-tune the PI loop for optimal performance.',
    type: SinamicsModuleType.THEORY,
    lessons: [
      {
        id: 'sinamics-l5-1',
        title: 'PI Controller Basics',
        content: `### The Speed Controller
The speed controller in SINAMICS drives is a PI (Proportional-Integral) controller that adjusts torque to maintain setpoint speed.

### Key Parameters
- **p1460 (Kp)**: Proportional gain
  - Higher = Stiffer response, but may oscillate
  - Lower = Softer response, may be sluggish
  
- **p1462 (Tn)**: Integral time (ms)
  - Lower = Faster error elimination, but may overshoot
  - Higher = Slower integration, more stable

### Tuning Procedure
1. Start with conservative values (Kp=1, Tn=2000ms)
2. Apply step changes in setpoint
3. Increase Kp until slight oscillation appears
4. Back off Kp by 20%
5. Decrease Tn until steady-state error is eliminated
6. Verify with load disturbances`,
        type: 'reading',
        duration: 25
      }
    ]
  },
  {
    id: 'sinamics-m5-pid',
    title: 'Lab: PID Loop Tuning',
    description: 'Practical tuning of the speed controller.',
    type: SinamicsModuleType.SIMULATION_PID,
    simulationType: 'sinamics-pid-lab',
    lessons: []
  }
];

// Fault Codes Database
export const SINAMICS_FAULT_CODES = [
  { 
    code: 'F07801', 
    name: 'Motor Overcurrent', 
    description: 'Current limit exceeded. Hardware issue or PID tuning too aggressive.', 
    remedy: '1. Check motor data (Star/Delta). 2. Check for short circuit / ground fault. 3. Increase ramp-up time (p1120).' 
  },
  { 
    code: 'F30001', 
    name: 'Overcurrent Power Unit', 
    description: 'Power unit detected huge spike in current (Short circuit).', 
    remedy: '1. Check motor insulation (Megger test). 2. Check motor cable for damage. 3. Replace Power Module if IGBT is blown.' 
  },
  { 
    code: 'F07900', 
    name: 'Motor Blocked', 
    description: 'Motor running at torque limit for longer than p2177 time.', 
    remedy: '1. Check if load is mechanically jammed. 2. Check if motor brake is opening. 3. Increase torque limits (p640).' 
  },
  { 
    code: 'F30002', 
    name: 'DC Link Overvoltage', 
    description: 'DC bus voltage too high. Motor is regenerating energy.', 
    remedy: '1. Increase ramp-down time (p1121). 2. Enable Vdc_max controller (p1240). 3. Install braking resistor.' 
  },
  { 
    code: 'F30003', 
    name: 'DC Link Undervoltage', 
    description: 'Line supply failure or phase loss.', 
    remedy: '1. Check mains voltage. 2. Check input fuses. 3. Check for loose terminals on line supply.' 
  },
  { 
    code: 'F07320', 
    name: 'Automatic Restart Aborted', 
    description: 'Drive failed to catch the spinning motor (Flying Restart).', 
    remedy: '1. Enable Flying Restart (p1200). 2. Check motor magnetization time.' 
  },
  { 
    code: 'F01600', 
    name: 'SI: STOP A initiated', 
    description: 'Safety Integrated fault. Drive stopped immediately.', 
    remedy: '1. Check safety wiring (dual channel discrepancy). 2. Perform Safe Acceptance Test.' 
  },
  { 
    code: 'F01910', 
    name: 'Fieldbus Setpoint Timeout', 
    description: 'The PLC stopped communicating with the Drive.', 
    remedy: '1. Check Profinet cable. 2. Check if PLC is in RUN mode. 3. Check "Master Sign of Life" (STW2) logic in PLC.' 
  }
];

// Quiz Data
export const SINAMICS_QUIZ_DATA = [
  {
    id: 1,
    question: "You have a 230/400V Motor and a 400V Supply. How must you wire the motor?",
    options: ["Delta (Δ)", "Star (Y)", "Either is fine", "Series"],
    correctIndex: 1
  },
  {
    id: 2,
    question: "What is the primary advantage of the 87Hz characteristic?",
    options: ["It saves energy", "It reduces motor temperature", "It provides constant torque and higher power output above 50Hz", "It allows using a smaller cable"],
    correctIndex: 2
  },
  {
    id: 3,
    question: "In Profidrive Telegram 1, what does Bit 10 of the Control Word (STW1) do?",
    options: ["Enables Safety", "Requests Control from PLC", "Resets Faults", "Activates Jog Mode"],
    correctIndex: 1
  },
  {
    id: 4,
    question: "Which Safety Function monitors the deceleration ramp before removing torque?",
    options: ["STO (Safe Torque Off)", "SS1 (Safe Stop 1)", "SLS (Safely Limited Speed)", "SBC (Safe Brake Control)"],
    correctIndex: 1
  },
  {
    id: 5,
    question: "What is the function of ZSW2 Bit 13?",
    options: ["Drive is Ready", "Motor is Blocked/Jammed", "DC Link is charged", "Fan is running"],
    correctIndex: 1
  }
];

export default {
  SINAMICS_COURSE,
  SINAMICS_MODULES,
  SINAMICS_FAULT_CODES,
  SINAMICS_QUIZ_DATA,
  SinamicsModuleType
};
