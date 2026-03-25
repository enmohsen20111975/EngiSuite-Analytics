import { LearningModule } from '../types';
import { dolStarterTopic } from './dol-starter';
import { starDeltaStarterTopic } from './star-delta-starter';
import { forwardReverseStarterTopic } from './forward-reverse-starter';
import { joggingCircuitTopic } from './jogging-circuit';

export const commonCircuitsModule: LearningModule = {
  id: 'common-circuits',
  title: 'Common Control Circuits',
  topics: [dolStarterTopic, starDeltaStarterTopic, forwardReverseStarterTopic, joggingCircuitTopic],
};
