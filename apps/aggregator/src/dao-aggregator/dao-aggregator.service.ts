import { Injectable, Logger } from '@nestjs/common';
import PromisePool from '@supercharge/promise-pool';
import { ReturnValue } from '@supercharge/promise-pool/dist/return-value';

import { SputnikService } from '@sputnik-v2/sputnikdao';
import { Account, Transaction } from '@sputnik-v2/near-indexer';
import { Dao, DaoService } from '@sputnik-v2/dao';

import { castDao, castDaoById } from './types/dao';

@Injectable()
export class DaoAggregatorService {
  private readonly logger = new Logger(DaoAggregatorService.name);

  constructor(
    private readonly sputnikService: SputnikService,
    private readonly daoService: DaoService,
  ) {}

  public async aggregateByAccount(
    daoAccount: Account,
    txs: Transaction[],
  ): Promise<Dao> {
    const daoInfo = await this.sputnikService.getDaoInfo(daoAccount.accountId);
    const delegationAccounts =
      await this.daoService.getDelegationAccountsByDaoId(daoAccount.accountId);
    return this.daoService.create(
      castDao(daoAccount, txs, daoInfo, delegationAccounts),
    );
  }

  public async aggregateDaoById(daoId: string): Promise<Dao> {
    const daoInfo = await this.sputnikService.getDaoInfo(daoId);
    const delegationAccounts =
      await this.daoService.getDelegationAccountsByDaoId(daoId);
    return this.daoService.create(
      castDaoById(daoId, daoInfo, delegationAccounts),
    );
  }

  public async aggregateDaoStatuses(): Promise<ReturnValue<Dao, Dao>> {
    const daos = await this.daoService.find();

    return PromisePool.withConcurrency(10)
      .for(daos)
      .handleError((err, dao) => {
        this.logger.error(
          `Failed dao status update for ${dao.id}: ${err} (${err.stack})`,
        );
      })
      .process((dao) => this.daoService.updateDaoStatus(dao));
  }

  public async aggregateDaoFunds(daoIds?: string[]) {
    const daos = await this.daoService.findByIds(daoIds);

    return PromisePool.withConcurrency(10)
      .for(daos)
      .handleError((err, dao) => {
        this.logger.error(
          `Failed dao funds update for (${dao.id}): ${err} (${err.stack})`,
        );
      })
      .process((dao) =>
        this.daoService.save(
          { id: dao.id, amount: dao.amount },
          { updateTotalDaoFunds: true, saveToDynamo: false },
        ),
      );
  }

  public async aggregateDaoAdditionalFields(dao: Dao): Promise<void> {
    const status = await this.daoService.getDaoStatus(dao);

    await this.daoService.save(
      {
        ...dao,
        status,
      },
      {
        updateProposalsCount: true,
        updateTotalDaoFunds: true,
        updateBountiesCount: true,
      },
    );
  }
}
