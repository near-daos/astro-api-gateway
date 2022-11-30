import { Injectable } from '@nestjs/common';

import { Transaction } from '@sputnik-v2/near-indexer';
import { SputnikService } from '@sputnik-v2/sputnikdao';
import { Dao } from '@sputnik-v2/dao';
import { TransactionService } from '@sputnik-v2/transaction';
import { Bounty, BountyService } from '@sputnik-v2/bounty';

import { castBounty } from './types/bounty';

@Injectable()
export class BountyAggregatorService {
  constructor(
    private readonly sputnikService: SputnikService,
    private readonly transactionService: TransactionService,
    private readonly bountyService: BountyService,
  ) {}

  public async aggregateBountiesByDao(
    dao: Dao,
    txs: Transaction[],
  ): Promise<Bounty[]> {
    const bountyClaimTransactions =
      await this.transactionService.findBountyClaimTransactions(dao.id);
    const bountyClaimAccountIds = [
      ...new Set(
        [...bountyClaimTransactions, ...txs]
          .filter(
            ({ transactionAction: action }) =>
              'bounty_claim' === action?.args?.method_name,
          )
          .map(({ signerAccountId }) => signerAccountId),
      ),
    ];

    const bounties = await this.sputnikService.getBountiesByDaoId(dao.id);
    const claims = await this.sputnikService.getBountyClaims(
      dao.id,
      bountyClaimAccountIds,
    );
    const daoBounties = await this.bountyService.find({
      where: { daoId: dao.id },
      relations: ['bountyClaims'],
    });

    const bountyDtos = bounties.map((bounty) =>
      castBounty(
        dao,
        txs,
        bounty,
        claims,
        daoBounties.find(({ bountyId }) => bountyId === bounty.id),
      ),
    );

    return this.bountyService.createMultiple(bountyDtos);
  }
}
