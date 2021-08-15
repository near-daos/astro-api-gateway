import { Account, Contract, Near } from 'near-api-js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import Decimal from 'decimal.js';
import { PROPOSAL_REQUEST_CHUNK_SIZE, yoktoNear } from './constants';
import { formatTimestamp } from '../utils';
import { CreateDaoDto } from 'src/daos/dto/dao.dto';
import { CreateProposalDto } from 'src/proposals/dto/proposal.dto';
import PromisePool from '@supercharge/promise-pool';
import { NearSputnikProvider } from 'src/config/sputnik';
import { NEAR_SPUTNIK_PROVIDER } from 'src/common/constants';

@Injectable()
export class SputnikDaoService {
  private readonly logger = new Logger(SputnikDaoService.name);

  private near!: Near;

  private factoryContract!: Contract & any;
  
  private account!: Account;

  constructor(
    @Inject(NEAR_SPUTNIK_PROVIDER)
    private nearSputnikProvider: NearSputnikProvider
  ) {
    const { near, factoryContract, account } = nearSputnikProvider;

    this.near = near;
    this.factoryContract = factoryContract;
    this.account = account;
  }

  public async getDaoIds(): Promise<string[]> {
    return await this.factoryContract.get_dao_list();
  }

  public async getDaoList(daoIds: string[]): Promise<CreateDaoDto[]> {
    const list: string[] = daoIds || await this.factoryContract.get_dao_list();

    const { results: daos, errors } = await PromisePool
      .withConcurrency(5)
      .for(list)
      .process(async daoId => (await this.getDaoById(daoId)));

    return daos;
  }

  public async getProposals(daoIds: string[]): Promise<CreateProposalDto[]> {
    const ids: string[] = daoIds || await this.factoryContract.getDaoIds();

    const { results: proposals, errors } = await PromisePool
      .withConcurrency(5)
      .for(ids)
      .process(async daoId => (await this.getProposalsByDao(daoId)));

    return proposals.reduce((acc, prop) => acc.concat(prop), []);
  }

  public async getProposalsByDao(contractId: string): Promise<CreateProposalDto[]> {
    try {
      const contract = this.getContract(contractId);

      const numProposals = await contract.get_num_proposals();

      const chunkSize = PROPOSAL_REQUEST_CHUNK_SIZE;
      const chunkCount = (numProposals - numProposals % chunkSize) / chunkSize + 1;
      const { results, errors } = await PromisePool
        .withConcurrency(1)
        .for([ ...Array(chunkCount).keys() ])
        .process(async (offset) => (await contract.get_proposals({ from_index: offset * chunkSize, limit: chunkSize })));

      return results
        .reduce((acc: CreateProposalDto[], prop: CreateProposalDto[]) => acc.concat(prop), [])
        .map((proposal: CreateProposalDto, index: number) => ({ ...proposal, id: index, daoId: contractId }));
    } catch (error) {
      this.logger.error(error);

      return Promise.reject(error); 
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
      council: async (): Promise<string[]> => (contract.get_council()),
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
      errors.map(error => this.logger.error(error));

      return Promise.reject(`Unable to enrich DAO with id ${daoId}`);
    }

    return { ...dao, councilSeats: dao.council.length, id: daoId };
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
