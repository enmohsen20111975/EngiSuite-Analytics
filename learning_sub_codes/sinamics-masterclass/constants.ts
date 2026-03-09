
import { CourseModule, ModuleType, QuizQuestion, FaultCode, ForumPost } from "./types";
import { INTRO_LESSONS } from "./data/module_intro";
import { FUNDAMENTALS_LESSONS } from "./data/module_fundamentals";
import { COMMISSIONING_LESSONS } from "./data/module_commissioning";
import { PROGRAMMING_LESSONS } from "./data/module_programming";
import { MAINTENANCE_LESSONS } from "./data/module_maintenance";
import { ADVANCED_LESSONS } from "./data/module_advanced";
import { COMMUNICATION_LESSONS } from "./data/module_communication";
import { SIMULATION_LESSONS } from "./data/module_simulation";
import { HARDWARE_LESSONS } from "./data/module_hardware";

export const COURSE_MODULES: CourseModule[] = [
  // --- 1. INTRODUCTION ---
  {
    id: 'm1',
    title: '1. Introduction to SINAMICS',
    description: 'Overview of the SINAMICS portfolio, history, and modern automation role.',
    type: ModuleType.THEORY,
    lessons: INTRO_LESSONS
  },

  // --- 2. FUNDAMENTALS ---
  {
    id: 'm2',
    title: '2. Fundamentals of Drives',
    description: 'Beginner guide to AC Motors, Servo theory, and Inverter physics.',
    type: ModuleType.THEORY,
    lessons: FUNDAMENTALS_LESSONS
  },

  // --- LAB: INVERTER ---
  {
    id: 'm2-sim',
    title: 'Lab: Inverter Power Flow',
    description: 'Visualizing AC to DC to AC conversion.',
    type: ModuleType.SIMULATION_INVERTER,
    lessons: []
  },

  // --- 3. GETTING STARTED ---
  {
    id: 'm3',
    title: '3. Getting Started',
    description: 'Wiring, EMC installation, and basic commissioning.',
    type: ModuleType.THEORY,
    lessons: COMMISSIONING_LESSONS
  },

  // --- LAB: WIZARD ---
  {
    id: 'm3-sim',
    title: 'Lab: Commissioning Wizard',
    description: 'Interactive Quick Setup (p0010) simulator.',
    type: ModuleType.SIMULATION_COMMISSIONING,
    lessons: []
  },

  // --- 4. PROGRAMMING & OPERATION ---
  {
    id: 'm4',
    title: '4. Programming & Operation',
    description: 'Startdrive, CDS/DDS Data Sets, and Safety Config.',
    type: ModuleType.THEORY,
    lessons: PROGRAMMING_LESSONS
  },

  // --- LAB: MOTOR CONTROL ---
  {
    id: 'm4-motor',
    title: 'Lab: Motor Control Modes',
    description: 'Compare V/f vs Vector Control performance.',
    type: ModuleType.SIMULATION_MOTOR,
    lessons: []
  },

  // --- LAB: PARAMETERS ---
  {
    id: 'm4-params',
    title: 'Lab: Advanced Parameters',
    description: 'Simulate Auto-tuning (p1900) and Magnetization (p0346).',
    type: ModuleType.SIMULATION_PARAMETERS,
    lessons: []
  },

  // --- LAB: TEST KIT ---
  {
    id: 'm4-testkit',
    title: 'Lab: Motor Simulation Test Kit',
    description: 'Experiment with PI tuning, inertia, and load response in real-time.',
    type: ModuleType.SIMULATION_TEST_KIT,
    lessons: []
  },

  // --- 5. MAINTENANCE ---
  {
    id: 'm5',
    title: '5. Troubleshooting',
    description: 'Fault codes, diagnostics, and preventive maintenance.',
    type: ModuleType.THEORY,
    lessons: MAINTENANCE_LESSONS
  },

  // --- TOOL: FAULTS ---
  {
    id: 'm5-tool',
    title: 'Tool: Fault Database',
    description: 'Searchable F-Code database with remedies.',
    type: ModuleType.TROUBLESHOOTING,
    lessons: []
  },

  // --- 6. ADVANCED TOPICS ---
  {
    id: 'm6',
    title: '6. Advanced Topics',
    description: 'EPos Positioning, Extended Safety (SS2/SOS), and Energy.',
    type: ModuleType.THEORY,
    lessons: ADVANCED_LESSONS
  },

  // --- LAB: SAFETY ---
  {
    id: 'm6-sim',
    title: 'Lab: Safety Integrated',
    description: 'Simulate STO and SS1 functions.',
    type: ModuleType.SIMULATION_SAFETY,
    lessons: []
  },

  // --- 7. COMMUNICATION ---
  {
    id: 'm7',
    title: '7. Communication & Networking',
    description: 'Profinet, Profibus, Telegrams, DCC, and Drive-CLiQ.',
    type: ModuleType.THEORY,
    lessons: COMMUNICATION_LESSONS
  },

  // --- LAB: LOGIC ---
  {
    id: 'm7-logic',
    title: 'Lab: Logic & DCC',
    description: 'Simulate AND/OR gates, Flip-Flops, and Comparators.',
    type: ModuleType.SIMULATION_LOGIC,
    lessons: []
  },

  // --- LAB: PLC TELEGRAMS ---
  {
    id: 'm7-sim',
    title: 'Lab: PLC Telegram Analyzer',
    description: 'Bit-wise analysis of STW1 and State Machine.',
    type: ModuleType.SIMULATION_PLC,
    lessons: []
  },

  // --- 8. SIMULATION TOOLS ---
  {
    id: 'm8',
    title: '8. Simulation & Applications',
    description: 'SIZER, DT Configurator, and real-world sizing.',
    type: ModuleType.THEORY,
    lessons: SIMULATION_LESSONS
  },

  // --- LAB: PID ---
  {
    id: 'm8-pid',
    title: 'Lab: PID Loop Tuning',
    description: 'Practical tuning of the speed controller.',
    type: ModuleType.SIMULATION_PID,
    lessons: []
  },

  // --- 9. HARDWARE (NEW) ---
  {
    id: 'm9',
    title: '9. Hardware & Peripherals',
    description: 'Deep dive into CUs, PMs, and Encoders.',
    type: ModuleType.THEORY,
    lessons: HARDWARE_LESSONS
  },

  // --- TOOL: MOTOR SPECS ---
  {
    id: 'm-tool-specs',
    title: 'Tool: Motor Data Sheet',
    description: 'Technical specifications for common Siemens motors.',
    type: ModuleType.TOOL_MOTOR_SPECS,
    lessons: []
  },

  // --- COMMUNITY ---
  {
    id: 'm10',
    title: 'Community Forum',
    description: 'Discussion groups and Expert Sessions.',
    type: ModuleType.FORUM,
    lessons: []
  },

  // --- EXAM ---
  {
    id: 'm11',
    title: 'Final Assessment',
    description: 'Certification Exam.',
    type: ModuleType.QUIZ,
    lessons: []
  }
];

export const FAULT_CODES: FaultCode[] = [
  { code: 'F07801', name: 'Motor Overcurrent', description: 'Current limit exceeded. Hardware issue or PID tuning too aggressive.', remedy: '1. Check motor data (Star/Delta). 2. Check for short circuit / ground fault. 3. Increase ramp-up time (p1120).' },
  { code: 'F30001', name: 'Overcurrent Power Unit', description: 'Power unit detected huge spike in current (Short circuit).', remedy: '1. Check motor insulation (Megger test). 2. Check motor cable for damage. 3. Replace Power Module if IGBT is blown.' },
  { code: 'F07900', name: 'Motor Blocked', description: 'Motor running at torque limit for longer than p2177 time.', remedy: '1. Check if load is mechanically jammed. 2. Check if motor brake is opening. 3. Increase torque limits (p640).' },
  { code: 'F30002', name: 'DC Link Overvoltage', description: 'DC bus voltage too high. Motor is regenerating energy.', remedy: '1. Increase ramp-down time (p1121). 2. Enable Vdc_max controller (p1240). 3. Install braking resistor.' },
  { code: 'F30003', name: 'DC Link Undervoltage', description: 'Line supply failure or phase loss.', remedy: '1. Check mains voltage. 2. Check input fuses. 3. Check for loose terminals on line supply.' },
  { code: 'F07320', name: 'Automatic Restart Aborted', description: 'Drive failed to catch the spinning motor (Flying Restart).', remedy: '1. Enable Flying Restart (p1200). 2. Check motor magnetization time.' },
  { code: 'F01600', name: 'SI: STOP A initiated', description: 'Safety Integrated fault. Drive stopped immediately.', remedy: '1. Check safety wiring (dual channel discrepancy). 2. Perform Safe Acceptance Test.' },
  { code: 'F01611', name: 'SI: Defect in Monitoring Channel', description: 'Internal safety cross-check failed.', remedy: '1. Cycle power to the drive. 2. If persistent, replace Control Unit.' },
  { code: 'A07400', name: 'DC Link Voltage Max Controller Active', description: 'Drive is automatically extending ramp-down time to prevent F30002.', remedy: 'Information only. If fast stop needed, install braking resistor.' },
  { code: 'F07901', name: 'Motor Overspeed', description: 'Motor exceeded maximum speed (p1082).', remedy: '1. Check controller tuning (overshoot). 2. Check if load is driving the motor (hoist).' },
  { code: 'F01910', name: 'Fieldbus Setpoint Timeout', description: 'The PLC stopped communicating with the Drive.', remedy: '1. Check Profinet cable. 2. Check if PLC is in RUN mode. 3. Check "Master Sign of Life" (STW2) logic in PLC.' },
  { code: 'F01054', name: 'CU: System Limit Exceeded', description: 'Control Unit Processor Load too high.', remedy: '1. Check if too many axes are connected to CU320. 2. Check if complex DCC charts are running. 3. Reduce current controller sampling time (p0115).' }
];

export const FORUM_POSTS: ForumPost[] = [
  { id: 'p1', author: 'DriveGuru99', title: 'G120C Comm loss with S7-1200', replies: 12, views: 340, tags: ['PROFINET', 'G120C'], date: '2 hrs ago' },
  { id: 'p2', author: 'NewbieEng', title: 'Difference between p1300=20 and p1300=21?', replies: 3, views: 85, tags: ['Vector Control', 'Tuning'], date: '5 hrs ago' },
  { id: 'p3', author: 'SiemensExpert', title: 'Guide: Optimizing Kn factor for heavy flywheels', replies: 45, views: 1200, tags: ['Tuning', 'Advanced'], date: '1 day ago' },
  { id: 'p4', author: 'MaintenanceJoe', title: 'F30002 on huge fan during stop', replies: 8, views: 210, tags: ['Faults', 'Braking'], date: '2 days ago' },
];

export const QUIZ_DATA: QuizQuestion[] = [
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
