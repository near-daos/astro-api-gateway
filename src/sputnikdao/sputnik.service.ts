import { Account, Contract, Near } from 'near-api-js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PROPOSAL_REQUEST_CHUNK_SIZE } from './constants';
import { DaoDto } from 'src/daos/dto/dao.dto';
import { castProposalKind, ProposalDto } from 'src/proposals/dto/proposal.dto';
import PromisePool from '@supercharge/promise-pool';
import { NearSputnikProvider } from 'src/config/sputnik';
import { NEAR_SPUTNIK_PROVIDER } from 'src/common/constants';
import { PolicyDto } from 'src/daos/dto/policy.dto';
import { DaoConfig } from 'src/daos/types/dao-config';
import { castWeighOrRatio } from './types/vote-policy';
import { castRoleKind, RoleKindType } from './types/role';
import camelcaseKeys from 'camelcase-keys';

@Injectable()
export class SputnikDaoService {
  private readonly logger = new Logger(SputnikDaoService.name);

  private near!: Near;

  private factoryContract!: Contract & any;

  private account!: Account;

  constructor(
    @Inject(NEAR_SPUTNIK_PROVIDER)
    private nearSputnikProvider: NearSputnikProvider,
  ) {
    const { near, factoryContract, account } = nearSputnikProvider;

    this.near = near;
    this.factoryContract = factoryContract;
    this.account = account;
  }

  public async getDaoIds(): Promise<string[]> {
    return await this.factoryContract.get_dao_list();
  }

  public async getDaoList(daoIds: string[]): Promise<DaoDto[]> {
    const list: string[] =
      daoIds || (await this.factoryContract.get_dao_list());

    const { results: daos, errors } = await PromisePool.withConcurrency(5)
      .for(list)
      .process(async (daoId) => await this.getDaoById(daoId));

    return daos;
  }

  public async getProposals(daoIds: string[]): Promise<ProposalDto[]> {
    const ids: string[] = daoIds || (await this.factoryContract.getDaoIds());

    const { results: proposals, errors } = await PromisePool.withConcurrency(5)
      .for(ids)
      .process(async (daoId) => await this.getProposalsByDao(daoId));

    return proposals.reduce((acc, prop) => acc.concat(prop), []);
  }

  public async getProposalsByDao(contractId: string): Promise<ProposalDto[]> {
    try {
      const contract = this.getContract(contractId);

      //TODO: check when no proposals
      // Taking into account that proposal ID is sequential,
      // considering that last proposal id is the proposal count
      // for the given DAO
      const lastProposalId = await contract.get_last_proposal_id();

      const chunkSize = PROPOSAL_REQUEST_CHUNK_SIZE;
      const chunkCount =
        (lastProposalId - (lastProposalId % chunkSize)) / chunkSize + 1;
      const { results, errors } = await PromisePool.withConcurrency(1)
        .for([...Array(chunkCount).keys()])
        .process(
          async (offset) =>
            await contract.get_proposals({
              from_index: offset * chunkSize,
              limit: chunkSize,
            }),
        );

      return results
        .reduce(
          (acc: ProposalDto[], prop: ProposalDto[]) => acc.concat(prop),
          [],
        )
        .map((proposal: ProposalDto, index: number) => {
          return {
            ...proposal,
            id: index,
            daoId: contractId,
            kind: castProposalKind(proposal.kind),
          };
        });
    } catch (error) {
      this.logger.error(error);

      return Promise.reject(error);
    }
  }

  private async getDaoById(daoId: string): Promise<DaoDto | null> {
    const contract = this.getContract(daoId);

    const daoEnricher = {
      config: async (): Promise<DaoConfig> => contract.get_config(),
      policy: async (): Promise<PolicyDto> => contract.get_policy(),
      stakingContract: async (): Promise<string> =>
        contract.get_staking_contract(),
      amount: async (): Promise<string> => contract.get_available_amount(),
      totalSupply: async (): Promise<string> =>
        contract.delegation_total_supply(),
      lastProposalId: async (): Promise<string> =>
        contract.get_last_proposal_id(),
      lastBountyId: async (): Promise<string> => contract.get_last_bounty_id(),
    };

    const dao = new DaoDto();

    const { errors } = await PromisePool.withConcurrency(3)
      .for(Object.keys(daoEnricher))
      .process(async (detailKey) => {
        dao[detailKey] = await daoEnricher[detailKey](daoId);

        return dao[detailKey];
      });

    if (errors && errors.length) {
      errors.map((error) => this.logger.error(error));

      return Promise.reject(`Unable to enrich DAO with id ${daoId}`);
    }

    const policy = camelcaseKeys(dao.policy, { deep: true });

    const roles = policy.roles.map((role) => ({
      ...role,
      kind: castRoleKind(role.kind),
    }));

    const council = roles
      .filter(
        ({ name, kind }) =>
          'council' === name && RoleKindType.Group === kind.type,
      )
      .map(({ kind }) => (kind as any).accountIds)
      .reduce((acc, val) => acc.concat(val), []);

    return {
      ...dao,
      id: daoId,
      policy: {
        ...policy,
        defaultVotePolicy: {
          ...policy.defaultVotePolicy,
          threshold: castWeighOrRatio(policy.defaultVotePolicy.threshold),
        },
        roles
      },
      council,
      councilSeats: council.length
    };
  }

  private getContract(contractId: string): Contract & any {
    return new Contract(this.account, contractId, {
      viewMethods: [
        'get_config',
        'get_policy',
        'get_staking_contract',
        'get_available_amount',
        'delegation_total_supply',
        'get_last_proposal_id',
        'get_last_bounty_id',
        'get_proposals',
      ],
      changeMethods: ['add_proposal', 'act_proposal'],
    });
  }
}
