import { CacheModule, Module } from '@nestjs/common';
import { CacheConfigService } from '@sputnik-v2/config/api-config';
import { ProposalModule as ProposalModuleLib } from '@sputnik-v2/proposal';
import { NearApiModule } from '@sputnik-v2/near-api';
import { FeatureFlagsModule } from '@sputnik-v2/feature-flags';
import { DynamodbModule } from '@sputnik-v2/dynamodb';

import { ProposalController } from './proposal.controller';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    ProposalModuleLib,
    NearApiModule,
    FeatureFlagsModule,
    DynamodbModule,
  ],
  controllers: [ProposalController],
})
export class ProposalModule {}
