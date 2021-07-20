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

    this.account = await this.near.account('sputnik');

    this.factoryContract = new Contract(this.account, this.configService.get('near').contractName, {
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

  public async getProposals(
    contractId: string,
    offset = 0,
    limit = 50,
  ): Promise<CreateProposalDto[]> {
    try {
      const numProposals = await this.getNumProposals(contractId);
      const newOffset = numProposals - (offset + limit);
      const newLimit = newOffset < 0 ? limit + newOffset : limit;
      const fromIndex = Math.max(newOffset, 0);

      const proposals = await this.getContract(contractId).get_proposals({
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
    const daoEnricher = {
      amount: this.getDaoAmount(daoId),
      bond: this.getBond(daoId),
      purpose: this.getPurpose(daoId),
      votePeriod: this.getVotePeriod(daoId),
      numberOfProposals: this.getNumProposals(daoId),
      members: this.getCouncil(daoId),
    }

    const dao = new CreateDaoDto();

    const { errors } = await PromisePool
      .withConcurrency(3)
      .for(Object.keys(daoEnricher))
      .process(async detailKey => {
        dao[detailKey] = await daoEnricher[detailKey];

        return dao[detailKey];
      })

    //TODO: handle errors properly
    if (errors && errors.length) {
      return null;
    }

    return { ...dao, numberOfMembers: dao.members.length, id: daoId };
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
    const bond = await this.getContract(contractId).get_bond();

    return new Decimal(bond.toString()).div(yoktoNear).toString();
  }

  private async getVotePeriod(contractId: string): Promise<string> {
    const votePeriod = await this.getContract(contractId).get_vote_period();

    return formatTimestamp(votePeriod);
  }

  private async getNumProposals(contractId: string): Promise<number> {
    return this.getContract(contractId).get_num_proposals();
  }

  private async getPurpose(contractId: string): Promise<string> {
    return this.getContract(contractId).get_purpose();
  }

  private async getCouncil(contractId: string): Promise<string[]> {
    return this.getContract(contractId).get_council();
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
