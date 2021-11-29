import { Injectable } from '@nestjs/common';

import { NearApiService } from '@sputnik-v2/near-api';
import { Dao } from '@sputnik-v2/dao';
import { Transaction } from '@sputnik-v2/near-indexer';
import { Proposal, ProposalService } from '@sputnik-v2/proposal';

import { castProposal } from './types/proposal';

@Injectable()
export class ProposalAggregatorService {
  constructor(
    private readonly nearApiService: NearApiService,
    private readonly proposalService: ProposalService,
  ) {}

  public async aggregateProposalsByDao(
    dao: Dao,
    txs: Transaction[],
  ): Promise<Proposal[]> {
    const proposals = await this.getProposalsByDaoId(
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

  private async getProposalsByDaoId(daoId: string, lastProposalId: number) {
    const daoContract = this.nearApiService.getContract('sputnikDao', daoId);
    const chunkSize = 50;
    const chunkCount =
      (lastProposalId - (lastProposalId % chunkSize)) / chunkSize + 1;
    let proposals = [];

    // Load all proposals by chunks
    for (let i = 0; i < chunkCount; i++) {
      const proposalsChunk = await daoContract.get_proposals({
        from_index: chunkSize * i,
        limit: chunkSize,
      });
      proposals = proposals.concat(proposalsChunk);
    }

    return proposals;
  }
}
