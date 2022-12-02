import { Injectable, Logger } from '@nestjs/common';

import { SputnikService } from '@sputnik-v2/sputnikdao';
import { Dao, DaoService } from '@sputnik-v2/dao';
import { Transaction } from '@sputnik-v2/near-indexer';
import { ProposalService, ProposalType } from '@sputnik-v2/proposal';

import { castProposal } from './types/proposal';
import PromisePool from '@supercharge/promise-pool';
import { BountyContextService } from '@sputnik-v2/bounty/bounty-context.service';

@Injectable()
export class ProposalAggregatorService {
  private readonly logger = new Logger(ProposalAggregatorService.name);

  constructor(
    private readonly sputnikService: SputnikService,
    private readonly proposalService: ProposalService,
    private readonly daoService: DaoService,
    private readonly bountyContextService: BountyContextService,
  ) {}

  public async aggregateProposalsByDao(dao: Dao, txs: Transaction[]) {
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

    await PromisePool.withConcurrency(5)
      .for(proposalDtos)
      .handleError((err, dto) => {
        this.logger.error(
          `Failed create proposal ${JSON.stringify(dto)}: ${err} (${
            err.stack
          })`,
        );
      })
      .process((proposalDto) => this.proposalService.create(proposalDto));

    await this.bountyContextService.createMultiple(bountyContextDtos);
  }

  public async updateExpiredProposals(): Promise<void> {
    const daoIds = await this.proposalService.getExpiredProposalDaoIds();

    await this.proposalService.updateExpiredProposals();

    if (daoIds.length) {
      await PromisePool.withConcurrency(10)
        .for(daoIds)
        .handleError((err, daoId) => {
          this.logger.error(
            `Failed update proposal count for ${daoId}: ${err} (${err.stack})`,
          );
        })
        .process((daoId) =>
          this.daoService.save({ id: daoId }, { updateProposalsCount: true }),
        );
    }
  }
}
