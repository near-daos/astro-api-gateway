import { Injectable, Logger } from '@nestjs/common';
import { IsNull } from 'typeorm';

import { Bounty, BountyService } from '@sputnik-v2/bounty';
import {
  Proposal,
  ProposalKindAddBounty,
  ProposalService,
  ProposalStatus,
  ProposalType,
} from '@sputnik-v2/proposal';

import { Migration } from '..';

@Injectable()
export class BountyProposalIdMigration implements Migration {
  private readonly logger = new Logger(BountyProposalIdMigration.name);

  constructor(
    private readonly bountyService: BountyService,
    private readonly proposalService: ProposalService,
  ) {}

  public async migrate(): Promise<void> {
    this.logger.log('Starting Bounty Proposal Id migration...');

    this.logger.log('Retrieving Proposals...');
    const allProposals: Proposal[] = await this.proposalService.find();
    this.logger.log(`Retrieved ${allProposals.length} Proposals.`);

    this.logger.log('Retrieving Bounties...');
    const bountiesToMigrate = await this.bountyService.find({
      proposalId: IsNull(),
    });
    this.logger.log(`Retrieved ${bountiesToMigrate.length} Bounties.`);

    const updatedBounties = bountiesToMigrate.map((bounty) => {
      return {
        ...bounty,
        proposalId: this.findBountyProposalId(bounty, allProposals),
      };
    });

    await this.bountyService.createMultiple(updatedBounties);
  }

  private findBountyProposalId(
    bounty: Bounty,
    allProposals: Proposal[],
  ): string {
    return allProposals.find((proposal) => {
      const proposalBounty = (proposal.kind as ProposalKindAddBounty)?.bounty;
      return (
        proposal.daoId === bounty.daoId &&
        proposal.type === ProposalType.AddBounty &&
        proposal.status === ProposalStatus.Approved &&
        proposalBounty &&
        proposalBounty.description === bounty.description &&
        proposalBounty.token === bounty.token &&
        proposalBounty.amount === bounty.amount &&
        Number(proposalBounty.times) === Number(bounty.times) &&
        proposalBounty.maxDeadline === bounty.maxDeadline
      );
    })?.id;
  }
}
