import { LearningModule } from '../types';
import { pressureSwitchTopic } from './pressure-switch';
import { levelSwitchTopic } from './level-switch';
import { thermocoupleTopic } from './thermocouple';
import { flowSwitchTopic } from './flow-switch';

export const instrumentationModule: LearningModule = {
  id: 'instrumentation',
  title: 'Instrumentation & Sensors',
  topics: [
    pressureSwitchTopic,
    levelSwitchTopic,
    thermocoupleTopic,
    flowSwitchTopic,
  ],
};
