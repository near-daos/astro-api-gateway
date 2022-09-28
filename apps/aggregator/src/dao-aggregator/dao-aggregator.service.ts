import { Injectable } from '@nestjs/common';
import PromisePool from '@supercharge/promise-pool';
import { ReturnValue } from '@supercharge/promise-pool/dist/return-value';

import { SputnikService } from '@sputnik-v2/sputnikdao';
import { Dao, DaoService } from '@sputnik-v2/dao';

import { castDaoById } from './types/dao';

@Injectable()
export class DaoAggregatorService {
  constructor(
    private readonly sputnikService: SputnikService,
    private readonly daoService: DaoService,
  ) {}

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

    return PromisePool.withConcurrency(1)
      .for(daos)
      .process((dao) => this.daoService.updateDaoStatus(dao));
  }

  public async aggregateDaoFunds(
    daoIds?: string[],
  ): Promise<ReturnValue<Dao, Dao>> {
    const daos = await this.daoService.findByIds(daoIds);

    return PromisePool.withConcurrency(10)
      .for(daos)
      .process((dao) => this.daoService.saveWithFunds(dao));
  }

  public async aggregateDaoAdditionalFields(dao: Dao): Promise<void> {
    await this.daoService.saveWithAdditionalFields({
      ...dao,
      status: await this.daoService.getDaoStatus(dao),
    });
  }
}
