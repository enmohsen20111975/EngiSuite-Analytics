
export enum ModuleType {
  THEORY = 'THEORY',
  SIMULATION_MOTOR = 'SIMULATION_MOTOR',
  SIMULATION_INVERTER = 'SIMULATION_INVERTER',
  SIMULATION_SAFETY = 'SIMULATION_SAFETY',
  SIMULATION_PID = 'SIMULATION_PID',
  SIMULATION_COMMISSIONING = 'SIMULATION_COMMISSIONING',
  SIMULATION_PLC = 'SIMULATION_PLC',
  SIMULATION_LOGIC = 'SIMULATION_LOGIC',
  SIMULATION_PARAMETERS = 'SIMULATION_PARAMETERS',
  SIMULATION_TEST_KIT = 'SIMULATION_TEST_KIT',
  TOOL_MOTOR_SPECS = 'TOOL_MOTOR_SPECS',
  QUIZ = 'QUIZ',
  TROUBLESHOOTING = 'TROUBLESHOOTING',
  FORUM = 'FORUM'
}

export interface Lesson {
  id: string;
  title: string;
  content: string; // Markdown-like content
  image?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  type: ModuleType;
  lessons: Lesson[];
}

export interface SimulationState {
  isRunning: boolean;
  frequency: number; // Hz
  voltage: number; // Volts
  current: number; // Amps
  rpm: number;
  setpointHz: number;
  temperature: number; // Celsius
  torque?: number; // Nm
  power?: number; // kW
  cosPhi?: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface ForumPost {
  id: string;
  author: string;
  title: string;
  replies: number;
  views: number;
  tags: string[];
  date: string;
}

export interface FaultCode {
  code: string;
  name: string;
  description: string;
  remedy: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
