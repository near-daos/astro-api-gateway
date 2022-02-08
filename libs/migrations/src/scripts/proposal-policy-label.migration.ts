import { Injectable, Logger } from '@nestjs/common';
import PromisePool from '@supercharge/promise-pool';
import {
  ProposalService,
  ProposalTypeToPolicyLabel,
} from '@sputnik-v2/proposal';
import { Migration } from '..';

@Injectable()
export class ProposalPolicyLabelMigration implements Migration {
  private readonly logger = new Logger(ProposalPolicyLabelMigration.name);

  constructor(private readonly proposalService: ProposalService) {}

  public async migrate(): Promise<void> {
    this.logger.log('Starting Proposal Policy Label migration...');

    this.logger.log('Collecting proposals...');
    const proposals = await this.proposalService.find();

    const migratedProposals = proposals.map((proposal) => {
      return {
        ...proposal,
        policyLabel: ProposalTypeToPolicyLabel[proposal.type],
      };
    });

    this.logger.log(`Updating migrated Proposals...`);
    const { results, errors: proposalErrors } =
      await PromisePool.withConcurrency(500)
        .for(migratedProposals)
        .process(
          async (proposal) => await this.proposalService.update(proposal),
        );

    this.logger.log(
      `Successfully updated Proposals: ${results.flat().length}. Errors: ${
        proposalErrors.length
      }`,
    );
    this.logger.log('Proposal Policy Label migration finished.');
  }
}
