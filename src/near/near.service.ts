import {
  connect,
  Contract,
  Near
} from 'near-api-js';
import { InMemoryKeyStore } from 'near-api-js/lib/key_stores';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Decimal from 'decimal.js';
import { yoktoNear } from './constants';
import { AccountView } from 'near-api-js/lib/providers/provider';
import { ContractPool } from './contract-pool';
import { formatTimestamp } from '../utils';
import { Batcher } from "promise-batcher";
import { isNotNull } from 'src/utils/guards';
import { CreateDaoDto } from 'src/daos/dto/dao.dto';

@Injectable()
export class NearService {
  private factoryContract!: Contract & any;

  private near!: Near;

  private contractPool!: ContractPool;

  constructor(private readonly configService: ConfigService) { }

  //TODO: move to async useFactory provider!!!
  public async init(): Promise<void> {
    this.near = await connect({
      deps: { keyStore: new InMemoryKeyStore() },
      ...this.configService.get('near'),
    });

    const account = await this.near.account('sputnik');

    this.factoryContract = new Contract(account, this.configService.get('near').contractName, {
      viewMethods: ['get_dao_list'],
      changeMethods: ['create'],
    });

    this.contractPool = new ContractPool(account);
  }

  public async getDaoList(): Promise<any[]> {
    const list: string[] = await this.factoryContract.get_dao_list();

    //TODO: Improve batching
    const batcher = new Batcher({
      batchingFunction: (daoIds: string[]) => {
        return Promise.all(daoIds.map(daoId => this.getDaoById(daoId)))
      },
      maxBatchSize: 5,
      queuingDelay: 500
    });

    const daos = await Promise.all(list.map((daoId: string) => batcher.getResult(daoId)));

    return daos;
  }

  private async getDaoById(daoId: string): Promise<CreateDaoDto | null> {
    const daoDetails = await Promise.all([
      this.getDaoAmount(daoId),
      this.getBond(daoId),
      this.getPurpose(daoId),
      this.getVotePeriod(daoId),
      this.getNumProposals(daoId),
      this.getCouncil(daoId),
    ]).catch(() => null);

    if (isNotNull(daoDetails)) {
      return {
        id: daoId,
        amount: daoDetails[0],
        bond: daoDetails[1],
        purpose: daoDetails[2],
        votePeriod: daoDetails[3],
        numberOfProposals: daoDetails[4],
        numberOfMembers: daoDetails[5].length,
        members: daoDetails[5],
      };
    }

    return null;
  }

  private async getDaoState(contractId: string): Promise<AccountView> {
    const account = await this.near.account(contractId);

    return account.state();
  }

  private async getDaoAmount(contractId: string): Promise<string> {
    const state = await this.getDaoState(contractId);
    const amountYokto = new Decimal(state.amount);

    return amountYokto.div(yoktoNear).toFixed(2);
  }

  private async getBond(contractId: string): Promise<string> {
    const bond = await this.contractPool.get(contractId).get_bond();

    return new Decimal(bond.toString()).div(yoktoNear).toString();
  }

  private async getVotePeriod(contractId: string): Promise<string> {
    const votePeriod = await this.contractPool
      .get(contractId)
      .get_vote_period();

    return formatTimestamp(votePeriod);
  }

  private async getNumProposals(contractId: string): Promise<number> {
    return this.contractPool.get(contractId).get_num_proposals();
  }

  private async getPurpose(contractId: string): Promise<string> {
    return this.contractPool.get(contractId).get_purpose();
  }

  private async getCouncil(contractId: string): Promise<string[]> {
    return this.contractPool.get(contractId).get_council();
  }
}
