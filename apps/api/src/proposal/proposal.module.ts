import { CacheModule, Module } from '@nestjs/common';
import { CacheConfigService } from '@sputnik-v2/config/api-config';
import { ProposalModule as ProposalModuleLib } from '@sputnik-v2/proposal';
import { NearApiModule } from '@sputnik-v2/near-api';

import { ProposalController } from './proposal.controller';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    ProposalModuleLib,
    NearApiModule,
  ],
  controllers: [ProposalController],
})
export class ProposalModule {}
