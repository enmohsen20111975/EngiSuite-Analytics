import { LearningModule } from '../types';
import { plcScanCycleTopic } from './plc-scan-cycle';
import { safetyRelayTopic } from './safety-relay';
import { softStarterTopic } from './soft-starter';

export const advancedControlModule: LearningModule = {
  id: 'advanced-control',
  title: 'Advanced Control & Safety',
  topics: [
    softStarterTopic,
    safetyRelayTopic,
    plcScanCycleTopic,
  ],
};