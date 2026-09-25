import { LearningModule } from '../types';
import { ohmsLawTopic } from './ohms-law';
import { seriesParallelTopic } from './series-parallel';
import { capacitorTopic } from './capacitor';
import { inductorTopic } from './inductor';
import { acDcTopic } from './ac-dc';
import { threePhasePowerTopic } from './three-phase-power';

export const electricalPrinciplesModule: LearningModule = {
  id: 'electrical-principles',
  title: 'Electrical Principles',
  topics: [ohmsLawTopic, seriesParallelTopic, capacitorTopic, inductorTopic, acDcTopic, threePhasePowerTopic],
};