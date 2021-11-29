import { Injectable } from '@nestjs/common';

import { NearApiService } from '@sputnik-v2/near-api';
import { Transaction } from '@sputnik-v2/near-indexer';
import { Dao } from '@sputnik-v2/dao';
import PromisePool from '@supercharge/promise-pool';
import { TransactionService } from '@sputnik-v2/transaction';
import { Bounty, BountyService } from '@sputnik-v2/bounty';

import { castBounty } from './types/bounty';

@Injectable()
export class BountyAggregatorService {
  constructor(
    private readonly nearApiService: NearApiService,
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

    const bounties = await this.getBountiesByDaoId(dao.id, dao.lastBountyId);
    const claims = await this.getBountyClaims(dao.id, bountyClaimAccountIds);

    const bountyDtos = bounties.map((bounty) =>
      castBounty(dao, txs, bounty, claims),
    );

    return this.bountyService.createMultiple(bountyDtos);
  }

  private async getBountiesByDaoId(daoId: string, lastBountyId: number) {
    const daoContract = this.nearApiService.getContract('sputnikDao', daoId);
    const chunkSize = 50;
    const chunkCount =
      (lastBountyId - (lastBountyId % chunkSize)) / chunkSize + 1;
    let bounties = [];

    // Load all bounties by chunks
    for (let i = 0; i < chunkCount; i++) {
      const bountiesChunk = await daoContract.get_bounties({
        from_index: chunkSize * i,
        limit: chunkSize,
      });
      bounties = bounties.concat(bountiesChunk);
    }

    await PromisePool.withConcurrency(5)
      .for(bounties)
      .process(async (bounty) => {
        bounty.numberOfClaims = await daoContract.get_bounty_number_of_claims({
          id: bounty.id,
        });
      });

    return bounties;
  }

  private async getBountyClaims(daoId: string, accountIds: string[]) {
    const daoContract = this.nearApiService.getContract('sputnikDao', daoId);
    const { results: claims } = await PromisePool.withConcurrency(2)
      .for(accountIds)
      .process(async (accountId) => {
        const bountyClaims = await daoContract.get_bounty_claims({
          account_id: accountId,
        });

        return bountyClaims.map((claim) => ({
          ...claim,
          accountId,
        }));
      });

    return claims.flat();
  }
}
