import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ProposalTemplate } from '@sputnik-v2/proposal-template';
import { SharedProposalTemplateService } from '@sputnik-v2/proposal-template/shared-proposal-template.service';

import { Migration } from '..';

@Injectable()
export class SharedProposalTemplateMigration implements Migration {
  private readonly logger = new Logger(SharedProposalTemplateMigration.name);

  constructor(
    @InjectRepository(ProposalTemplate)
    private readonly proposalTemplateRepository: Repository<ProposalTemplate>,

    private readonly sharedProposalTemplateService: SharedProposalTemplateService,
  ) {}

  public async migrate(): Promise<void> {
    this.logger.log('Starting Shared Proposal Template migration...');

    this.logger.log('Retrieving DAO Proposal Templates...');

    const proposalTemplates = await this.proposalTemplateRepository.find();

    this.logger.log(
      `DAO Proposal Templates found: ${proposalTemplates.length}`,
    );

    this.logger.log('Creating Shared Proposal Templates...');
    for (const template of proposalTemplates) {
      await this.sharedProposalTemplateService.create({
        ...template,
        description: null,
        createdBy: template.daoId,
      });
    }

    this.logger.log('Finished Shared Proposal Template migration.');
  }
}
