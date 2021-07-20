import {
  connect,
  Contract,
  Near,
  Account
} from 'near-api-js';
import { InMemoryKeyStore } from 'near-api-js/lib/key_stores';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Decimal from 'decimal.js';
import { yoktoNear } from './constants';
import { AccountView } from 'near-api-js/lib/providers/provider';
import { formatTimestamp } from '../utils';
import { CreateDaoDto } from 'src/daos/dto/dao.dto';
import { CreateProposalDto } from 'src/proposals/dto/proposal.dto';
import PromisePool from '@supercharge/promise-pool';

@Injectable()
export class NearService {
  private readonly logger = new Logger(NearService.name);

  private factoryContract!: Contract & any;

  private near!: Near;

  private account!: Account;

  constructor(private readonly configService: ConfigService) { }

  //TODO: move to async useFactory provider!!!
  public async init(): Promise<void> {
    this.near = await connect({
      deps: { keyStore: new InMemoryKeyStore() },
      ...this.configService.get('near'),
    });

    const { contractName } = this.configService.get('near');

    this.account = await this.near.account(contractName);

    this.factoryContract = new Contract(this.account, contractName, {
      viewMethods: ['get_dao_list'],
      changeMethods: ['create'],
    });
  }

  public async getDaoIds(): Promise<string[]> {
    return await this.factoryContract.get_dao_list();
  }

  public async getDaoList(daoIds: string[]): Promise<any[]> {
    const list: string[] = daoIds || await this.factoryContract.get_dao_list();

    const { results: daos, errors } = await PromisePool
      .withConcurrency(5)
      .for(list)
      .process(async daoId => (await this.getDaoById(daoId)))

    //TODO: handle properly
    if (errors && errors.length) {
      this.logger.error(errors);
    }

    return daos;
  }

  public async getProposals(daoIds: string[]): Promise<any[]> {
    const ids: string[] = daoIds || await this.factoryContract.getDaoIds();

    const { results: proposals, errors } = await PromisePool
      .withConcurrency(5)
      .for(ids)
      .process(async daoId => (await this.getProposalsByDao(daoId)));

    return proposals;
  }

  public async getProposalsByDao(
    contractId: string,
    offset = 0,
    limit = 50,
  ): Promise<CreateProposalDto[]> {
    try {
      const contract = this.getContract(contractId);

      const numProposals = await contract.get_num_proposals();
      const newOffset = numProposals - (offset + limit);
      const newLimit = newOffset < 0 ? limit + newOffset : limit;
      const fromIndex = Math.max(newOffset, 0);

      const proposals = await contract.get_proposals({
        from_index: fromIndex,
        limit: newLimit,
      });

      return proposals.map((proposal, index) => ({ ...proposal, id: fromIndex + index, daoId: contractId }));
    } catch (err) {
      this.logger.error(err);

      //TODO: handle properly
      return [];
    }
  }

  private async getDaoById(daoId: string): Promise<CreateDaoDto | null> {
    const contract = this.getContract(daoId);

    const getDaoAmount = async (): Promise<string> => {
      const account = await this.near.account(daoId);
      const state = await account.state();
      const amountYokto = new Decimal(state.amount);
  
      return amountYokto.div(yoktoNear).toFixed(2);
    }

    const daoEnricher = {
      amount: getDaoAmount,
      bond: async (): Promise<string> => (new Decimal((await contract.get_bond()).toString()).div(yoktoNear).toString()),
      purpose: async (): Promise<string> => (contract.get_purpose()),
      votePeriod: async (): Promise<string> => (formatTimestamp(await contract.get_vote_period())),
      numberOfProposals: async (): Promise<number> => (contract.get_num_proposals()),
      members: async (): Promise<string[]> => (contract.get_council()),
    }

    const dao = new CreateDaoDto();

    const { errors } = await PromisePool
      .withConcurrency(3)
      .for(Object.keys(daoEnricher))
      .process(async detailKey => {
        dao[detailKey] = await daoEnricher[detailKey](daoId);

        return dao[detailKey];
      })

    if (errors && errors.length) {
      return null;
    }

    return { ...dao, numberOfMembers: dao.members.length, id: daoId };
  }

  private getContract(contractId: string): Contract & any {
    return new Contract(this.account, contractId, {
      viewMethods: [
        'get_council',
        'get_bond',
        'get_proposal',
        'get_num_proposals',
        'get_proposals',
        'get_vote_period',
        'get_purpose',
      ],
      changeMethods: ['vote', 'add_proposal', 'finalize'],
    });
  }
}
