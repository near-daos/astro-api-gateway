import { Injectable } from '@nestjs/common';

import { NearApiService } from '@sputnik-v2/near-api';
import { Account, Transaction } from '@sputnik-v2/near-indexer';
import { Dao, DaoService } from '@sputnik-v2/dao';

import { castDao } from './types/dao';

@Injectable()
export class DaoAggregatorService {
  constructor(
    private readonly nearApiService: NearApiService,
    private readonly daoService: DaoService,
  ) {}

  public async aggregateByAccount(
    daoAccount: Account,
    txs: Transaction[],
  ): Promise<Dao> {
    const daoContract = this.nearApiService.getContract(
      'sputnikDao',
      daoAccount.accountId,
    );
    const config = await daoContract.get_config();
    const policy = await daoContract.get_policy();
    const stakingContract = await daoContract.get_staking_contract();
    const totalSupply = await daoContract.delegation_total_supply();
    const lastProposalId = await daoContract.get_last_proposal_id();
    const lastBountyId = await daoContract.get_last_bounty_id();
    const amount = await this.nearApiService.getAccountAmount(
      daoAccount.accountId,
    );

    return this.daoService.create(
      castDao(daoAccount, txs, {
        config,
        policy,
        stakingContract,
        totalSupply,
        lastProposalId,
        lastBountyId,
        amount,
      }),
    );
  }
}
