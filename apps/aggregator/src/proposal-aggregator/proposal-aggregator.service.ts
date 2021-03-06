import { Injectable } from '@nestjs/common';

import { SputnikService } from '@sputnik-v2/sputnikdao';
import { Dao, DaoService } from '@sputnik-v2/dao';
import { Transaction } from '@sputnik-v2/near-indexer';
import { Proposal, ProposalService, ProposalType } from '@sputnik-v2/proposal';

import { castProposal } from './types/proposal';
import PromisePool from '@supercharge/promise-pool';
import { BountyContextService } from '@sputnik-v2/bounty/bounty-context.service';

@Injectable()
export class ProposalAggregatorService {
  constructor(
    private readonly sputnikService: SputnikService,
    private readonly proposalService: ProposalService,
    private readonly daoService: DaoService,
    private readonly bountyContextService: BountyContextService,
  ) {}

  public async aggregateProposalsByDao(
    dao: Dao,
    txs: Transaction[],
  ): Promise<Proposal[]> {
    const proposals = await this.sputnikService.getProposalsByDaoId(
      dao.id,
      dao.lastProposalId,
    );
    const proposalDtos = proposals.map((proposal) =>
      castProposal(dao, txs, proposal),
    );
    const bountyContextDtos = proposalDtos
      .filter(({ type }) => type === ProposalType.AddBounty)
      .map((proposal) => ({ id: proposal.id, daoId: proposal.daoId }));

    const removedProposalIds = (
      await this.proposalService.find({
        where: { daoId: dao.id },
        select: ['id'],
      })
    )
      .filter(({ id }) =>
        proposalDtos.every((proposalDto) => proposalDto.id !== id),
      )
      .map(({ id }) => id);

    if (removedProposalIds) {
      await this.proposalService.removeMultiple(removedProposalIds);
    }

    const { results: createdProposals } = await PromisePool.withConcurrency(5)
      .for(proposalDtos)
      .process((proposalDto) => this.proposalService.create(proposalDto));

    await this.bountyContextService.createMultiple(bountyContextDtos);

    return createdProposals;
  }

  public async updateExpiredProposals(): Promise<void> {
    const daoIds = await this.proposalService.getExpiredProposalDaoIds();

    await this.proposalService.updateExpiredProposals();

    if (daoIds.length) {
      await PromisePool.withConcurrency(10)
        .for(daoIds)
        .process((daoId) =>
          this.daoService.saveWithProposalCount({ id: daoId }),
        );
    }
  }
}
