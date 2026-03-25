import { LearningModule } from '../types';
import { contactorTopic } from './contactor';
import { relayTopic } from './relay';
import { circuitBreakerTopic } from './circuit-breaker';
import { pushButtonTopic } from './push-button';
import { overloadRelayTopic } from './overload-relay';
import { timerOnDelayTopic } from './timer-on-delay';
import { timerOffDelayTopic } from './timer-off-delay';
import { rectifierTopic } from './rectifier';
import { transformerOperationTopic } from './transformer-operation';
import { solenoidTopic } from './solenoid';
import { limitSwitchTopic } from './limit-switch';
import { proximitySensorTopic } from './proximity-sensor';

export const basicComponentsModule: LearningModule = {
  id: 'basic-components',
  title: 'Basic Components',
  topics: [contactorTopic, relayTopic, circuitBreakerTopic, pushButtonTopic, overloadRelayTopic, timerOnDelayTopic, timerOffDelayTopic, rectifierTopic, transformerOperationTopic, solenoidTopic, limitSwitchTopic, proximitySensorTopic],
};