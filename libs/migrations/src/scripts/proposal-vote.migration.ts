import { Injectable, Logger } from '@nestjs/common';
import {
  calcProposalVotePeriodEnd,
  getBlockTimestamp,
} from '@sputnik-v2/utils';
import PromisePool from '@supercharge/promise-pool';
import { ProposalService, ProposalVoteStatus } from '@sputnik-v2/proposal';
import { Migration } from '..';

@Injectable()
export class ProposalVoteMigration implements Migration {
  private readonly logger = new Logger(ProposalVoteMigration.name);

  constructor(private readonly proposalService: ProposalService) {}

  public async migrate(): Promise<void> {
    this.logger.log('Starting Proposal Vote migration...');

    this.logger.log('Collecting proposals...');
    const proposals = await this.proposalService.find();

    const currentTimestamp = getBlockTimestamp();
    const migratedProposals = proposals.map((proposal) => {
      const votePeriodEnd = calcProposalVotePeriodEnd(
        proposal.submissionTime,
        proposal.dao.policy.proposalPeriod,
      );
      return {
        ...proposal,
        votePeriodEnd,
        voteStatus:
          BigInt(votePeriodEnd) > BigInt(currentTimestamp)
            ? ProposalVoteStatus.Active
            : ProposalVoteStatus.Expired,
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
    this.logger.log('Proposal Vote migration finished.');
  }
}
