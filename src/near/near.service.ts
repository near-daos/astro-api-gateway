import {
  connect,
  Contract,
  Near,
  Account
} from 'near-api-js';
import { InMemoryKeyStore } from 'near-api-js/lib/key_stores';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Decimal from 'decimal.js';
import { yoktoNear } from './constants';
import { AccountView } from 'near-api-js/lib/providers/provider';
import { formatTimestamp } from '../utils';
import { Batcher } from "promise-batcher";
import { isNotNull } from 'src/utils/guards';
import { CreateDaoDto } from 'src/daos/dto/dao.dto';
import { CreateProposalDto } from 'src/proposals/dto/proposal.dto';

@Injectable()
export class NearService {
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

    //TODO: Improve batching
    const batcher = new Batcher({
      batchingFunction: (daoIds: string[]) => (Promise.all(daoIds.map(daoId => this.getDaoById(daoId)))),
      maxBatchSize: 5,
      queuingDelay: 500
    });

    const daos = await Promise.all(list.map((daoId: string) => batcher.getResult(daoId)));

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

      console.log('info: ', {
        from_index: fromIndex,
        limit: newLimit,
      });

      const proposals = await this.getContract(contractId).get_proposals({
        from_index: fromIndex,
        limit: newLimit,
      });

      return proposals.map((proposal, index) => ({ ...proposal, id: fromIndex + index, daoId: contractId }));
    } catch (err) {
      console.log(err);

      //TODO: handle properly
      return [];
    }
  }

  private async getDaoById(daoId: string): Promise<CreateDaoDto | null> {
    const daoDetails = await Promise.all([
      this.getDaoAmount(daoId),
      this.getBond(daoId),
      this.getPurpose(daoId),
      this.getVotePeriod(daoId),
      this.getNumProposals(daoId),
      this.getCouncil(daoId),
    ]).catch(() => null); //TODO: handle properly

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
