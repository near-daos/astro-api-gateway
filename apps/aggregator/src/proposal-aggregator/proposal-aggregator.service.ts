import { Injectable } from '@nestjs/common';

import { SputnikService } from '@sputnik-v2/sputnikdao';
import { Dao, DaoService } from '@sputnik-v2/dao';
import { Transaction } from '@sputnik-v2/near-indexer';
import { Proposal, ProposalService } from '@sputnik-v2/proposal';

import { castProposal } from './types/proposal';
import PromisePool from '@supercharge/promise-pool';

@Injectable()
export class ProposalAggregatorService {
  constructor(
    private readonly sputnikService: SputnikService,
    private readonly proposalService: ProposalService,
    private readonly daoService: DaoService,
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

    const removedProposalIds = (
      await this.proposalService.findProposalsByDaoIds([dao.id])
    )
      .filter(({ id }) =>
        proposalDtos.every((proposalDto) => proposalDto.id !== id),
      )
      .map(({ id }) => id);

    if (removedProposalIds) {
      await this.proposalService.removeMultiple(removedProposalIds);
    }

    return this.proposalService.createMultiple(proposalDtos);
  }

  public async updateExpiredProposals(): Promise<Proposal[]> {
    const expiredProposals =
      await this.proposalService.updateExpiredProposals();
    const daoIds = [...new Set(expiredProposals.map(({ daoId }) => daoId))];

    if (daoIds.length) {
      await PromisePool.withConcurrency(10)
        .for(daoIds)
        .process((daoId) =>
          this.daoService.saveWithProposalCount({ id: daoId }),
        );
    }

    return expiredProposals;
  }
}
