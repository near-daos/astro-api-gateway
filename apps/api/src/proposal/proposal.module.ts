import { CacheModule, Module } from '@nestjs/common';
import { CacheConfigService } from '@sputnik-v2/config/api-config';
import { ProposalModule as ProposalModuleLib } from '@sputnik-v2/proposal';

import { ProposalController } from './proposal.controller';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    ProposalModuleLib,
  ],
  controllers: [ProposalController],
})
export class ProposalModule {}
