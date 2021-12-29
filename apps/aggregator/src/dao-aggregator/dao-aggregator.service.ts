import { Injectable } from '@nestjs/common';

import { SputnikService } from '@sputnik-v2/sputnikdao';
import { Account, Transaction } from '@sputnik-v2/near-indexer';
import { Dao, DaoService } from '@sputnik-v2/dao';

import { castDao } from './types/dao';

@Injectable()
export class DaoAggregatorService {
  constructor(
    private readonly sputnikService: SputnikService,
    private readonly daoService: DaoService,
  ) {}

  public async aggregateByAccount(
    daoAccount: Account,
    txs: Transaction[],
  ): Promise<Dao> {
    const daoInfo = await this.sputnikService.getDaoInfo(daoAccount.accountId);
    return this.daoService.create(castDao(daoAccount, txs, daoInfo));
  }
}
