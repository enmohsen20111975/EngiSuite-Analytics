import { LearningModule } from '../types';
import { threePhaseMotorTopic } from './three-phase-motor';
import { rotatingMagneticFieldTopic } from './rotating-magnetic-field';
import { dcMotorTopic } from './dc-motor';
import { servoMotorTopic } from './servo-motor';
import { stepperMotorTopic } from './stepper-motor';
import { vfdTopic } from './vfd';

export const motorControlModule: LearningModule = {
  id: 'motor-principles',
  title: 'Motor Principles',
  topics: [
    threePhaseMotorTopic,
    rotatingMagneticFieldTopic,
    dcMotorTopic,
    servoMotorTopic,
    stepperMotorTopic,
    vfdTopic,
  ],
};
