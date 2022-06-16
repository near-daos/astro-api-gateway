import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DaoModule } from '@sputnik-v2/dao';

import { ProposalTemplate, SharedProposalTemplate } from './entities';
import { SharedProposalTemplateDao } from './entities/shared-proposal-template-dao.entity';
import { ProposalTemplateService } from './proposal-template.service';
import { SharedProposalTemplateService } from './shared-proposal-template.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProposalTemplate,
      SharedProposalTemplate,
      SharedProposalTemplateDao,
    ]),
    DaoModule,
  ],
  providers: [ProposalTemplateService, SharedProposalTemplateService],
  exports: [ProposalTemplateService, SharedProposalTemplateService],
})
export class ProposalTemplateModule {}
