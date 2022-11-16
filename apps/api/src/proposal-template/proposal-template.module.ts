import { CacheModule, Module } from '@nestjs/common';
import { DaoModule } from '@sputnik-v2/dao';
import { CacheConfigService } from '@sputnik-v2/config/api-config';
import { NearApiModule } from '@sputnik-v2/near-api';
import { ProposalTemplateModule as ProposalTemplateModuleLib } from '@sputnik-v2/proposal-template';

import { ProposalTemplateController } from './proposal-template.controller';
import { SharedProposalTemplateController } from './shared-proposal-template.controller';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    DaoModule,
    NearApiModule,
    ProposalTemplateModuleLib,
  ],
  controllers: [ProposalTemplateController, SharedProposalTemplateController],
})
export class ProposalTemplateModule {}
