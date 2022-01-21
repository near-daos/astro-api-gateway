import { Injectable, Logger } from '@nestjs/common';
import { IsNull } from 'typeorm';

import {
  Bounty,
  BountyContextDto,
  BountyContextService,
  BountyService,
} from '@sputnik-v2/bounty';
import {
  Proposal,
  ProposalDto,
  ProposalKindAddBounty,
  ProposalKindBountyDone,
  ProposalService,
  ProposalStatus,
  ProposalType,
} from '@sputnik-v2/proposal';

import { Migration } from '..';
import { buildBountyId } from '@sputnik-v2/utils';

@Injectable()
export class BountyContextMigration implements Migration {
  private readonly logger = new Logger(BountyContextMigration.name);

  constructor(
    private readonly bountyService: BountyService,
    private readonly bountyContextService: BountyContextService,
    private readonly proposalService: ProposalService,
  ) {}

  public async migrate(): Promise<void> {
    this.logger.log('Starting Bounty Context migration...');

    this.logger.log('Retrieving Proposals...');
    const allProposals: Proposal[] = await this.proposalService.find({
      order: { proposalId: 'ASC' },
    });
    this.logger.log(`Retrieved ${allProposals.length} Proposals.`);

    this.logger.log('Retrieving Bounties...');
    const bountiesToMigrate = await this.bountyService.find({
      where: { proposalId: IsNull() },
      order: { bountyId: 'ASC' },
    });
    this.logger.log(`Retrieved ${bountiesToMigrate.length} Bounties.`);

    const bountyContexts = this.getBountyContexts(allProposals);
    this.logger.log('Storing bounty contexts...');
    await this.bountyContextService.createMultiple(bountyContexts);

    const bountyDoneProposals = this.getBountyDoneProposals(
      allProposals,
      bountiesToMigrate,
    );
    this.logger.log('Updating bounty done proposals...');
    await this.proposalService.updateMultiple(bountyDoneProposals);

    this.logger.log('Setting proposalId field...');
    let filteredProposals = allProposals;
    const updatedBounties = bountiesToMigrate.map((bounty) => {
      const proposalId = this.findBountyProposalId(bounty, filteredProposals);

      // Remove found proposal from further searching
      filteredProposals = filteredProposals.filter(
        ({ id }) => proposalId !== id,
      );

      return {
        ...bounty,
        proposalId,
      };
    });

    this.logger.log('Updating bounties...');
    await this.bountyService.createMultiple(updatedBounties);

    this.logger.log('Bounty Proposal Id migration finished.');
  }

  private findBountyProposalId(bounty: Bounty, proposals: Proposal[]): string {
    return proposals.find((proposal) => {
      const proposalBounty = (proposal.kind as ProposalKindAddBounty)?.bounty;
      return (
        proposal.daoId === bounty.daoId &&
        proposal.type === ProposalType.AddBounty &&
        proposal.status === ProposalStatus.Approved &&
        proposalBounty &&
        proposalBounty.description === bounty.description &&
        proposalBounty.token === bounty.token &&
        proposalBounty.amount === bounty.amount &&
        proposalBounty.maxDeadline === bounty.maxDeadline
      );
    })?.id;
  }

  private getBountyContexts(proposals: Proposal[]): BountyContextDto[] {
    return proposals
      .filter((proposal) => proposal.type === ProposalType.AddBounty)
      .map((proposal) => ({
        id: proposal.id,
        daoId: proposal.daoId,
      }));
  }

  private getBountyDoneProposals(
    proposals: Proposal[],
    bounties: Bounty[],
  ): Partial<Proposal>[] {
    return proposals
      .filter((proposal) => proposal.type === ProposalType.BountyDone)
      .map((proposal) => {
        const bountyDoneId = buildBountyId(
          proposal.daoId,
          (proposal.kind as ProposalKindBountyDone)?.bountyId,
        );
        return {
          ...proposal,
          bountyDoneId: bounties.some(({ id }) => id === bountyDoneId)
            ? bountyDoneId
            : null,
        };
      });
  }
}
