import { Injectable, Logger } from '@nestjs/common';
import PromisePool from '@supercharge/promise-pool';
import { BountyService } from '@sputnik-v2/bounty';
import {
  Proposal,
  ProposalKindBountyDone,
  ProposalService,
  ProposalType,
} from '@sputnik-v2/proposal';
import { Migration } from '..';
import { IsNull } from 'typeorm';

@Injectable()
export class ProposalClaimIdMigration implements Migration {
  private readonly logger = new Logger(ProposalClaimIdMigration.name);

  constructor(
    private readonly proposalService: ProposalService,
    private readonly bountyService: BountyService,
  ) {}

  public async migrate(): Promise<void> {
    this.logger.log('Starting Proposal Claim IDs migration...');

    this.logger.log('Collecting proposals...');
    const proposals = await this.proposalService.find({
      where: { type: ProposalType.BountyDone, bountyClaimId: IsNull() },
    });

    this.logger.log(`Set Proposal Claim IDs...`);
    const { results, errors } = await PromisePool.withConcurrency(1)
      .for(proposals)
      .process(async (proposal) => this.migrateProposalClaimId(proposal));

    this.logger.log(
      `Successfully updated Proposals: ${results.flat().length}. Errors: ${
        errors.length
      }`,
    );
    this.logger.log('Proposal Proposal Claim IDs migration finished.');
  }

  public async migrateProposalClaimId(proposal: Proposal): Promise<Proposal> {
    const proposalKind = proposal.kind as ProposalKindBountyDone;
    const bountyClaim = await this.bountyService.getLastBountyClaim(
      proposal.daoId,
      proposalKind.bountyId,
      proposalKind.receiverId,
      proposal.createTimestamp,
    );
    return this.proposalService.update({
      ...proposal,
      bountyClaimId: bountyClaim?.id,
    });
  }
}
