import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DaoModule } from '@sputnik-v2/dao';

import { ProposalTemplate, SharedProposalTemplate } from './entities';
import { SharedProposalTemplateDao } from '@sputnik-v2/proposal-template/entities';
import { ProposalTemplateService } from './proposal-template.service';
import { SharedProposalTemplateService } from './shared-proposal-template.service';
import { DynamoSharedProposalTemplateService } from '@sputnik-v2/proposal-template/dynamo-shared-proposal-template.service';
import { DynamoProposalTemplateService } from '@sputnik-v2/proposal-template/dynamo-proposal-template.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProposalTemplate,
      SharedProposalTemplate,
      SharedProposalTemplateDao,
    ]),
    DaoModule,
  ],
  providers: [
    ProposalTemplateService,
    SharedProposalTemplateService,
    DynamoSharedProposalTemplateService,
    DynamoProposalTemplateService,
  ],
  exports: [
    ProposalTemplateService,
    SharedProposalTemplateService,
    DynamoSharedProposalTemplateService,
    DynamoProposalTemplateService,
  ],
})
export class ProposalTemplateModule {}
