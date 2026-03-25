import { basicComponentsModule } from './basic-components';
import { commonCircuitsModule } from './common-circuits';
import { motorControlModule } from './motor-control';
import { LearningModule } from './types';
import { electricalPrinciplesModule } from './electrical-principles';
import { advancedControlModule } from './advanced-control';
import { instrumentationModule } from './instrumentation';

export const learningContent: LearningModule[] = [
    electricalPrinciplesModule,
    basicComponentsModule,
    motorControlModule,
    commonCircuitsModule,
    advancedControlModule,
    instrumentationModule,
];
