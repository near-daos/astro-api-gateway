import { Contract } from 'near-api-js';
import { Injectable, Logger } from '@nestjs/common';
import { castProposalKind, ProposalDto } from '@sputnik-v2/proposal';
import PromisePool from '@supercharge/promise-pool';
import {
  PolicyDto,
  DaoConfig,
  SputnikDaoDto,
  RoleKindType,
} from '@sputnik-v2/dao';
import camelcaseKeys from 'camelcase-keys';
import { BountyDto, BountyClaimDto } from '@sputnik-v2/bounty';
import { NearApiService } from '@sputnik-v2/near-api';
import {
  buildBountyClaimId,
  buildBountyId,
  buildProposalId,
  buildRoleId,
} from '@sputnik-v2/utils';

import { castRolePermission, castVotePolicy } from './types';
import { PROPOSAL_REQUEST_CHUNK_SIZE } from './constants';

// Please note that SputnikDaoService is going to be removed in next iterations
@Injectable()
export class SputnikDaoService {
  private readonly logger = new Logger(SputnikDaoService.name);

  private factoryContract!: Contract & any;

  constructor(private readonly nearApiService: NearApiService) {
    this.factoryContract = nearApiService.getContract('sputnikDaoFactory');
  }

  public async getDaoIds(): Promise<string[]> {
    return await this.factoryContract.get_dao_list();
  }

  public async getDaoList(daoIds: string[]): Promise<SputnikDaoDto[]> {
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

  public async getProposal(
    contractId: string,
    proposalId: number,
  ): Promise<ProposalDto> {
    const contract = this.nearApiService.getContract('sputnikDao', contractId);
    const proposal = await contract.get_proposal({ id: proposalId });

    return this.proposalResponseToDTO(contractId, proposal);
  }

  public async getProposalsByDao(contractId: string): Promise<ProposalDto[]> {
    try {
      const contract = this.nearApiService.getContract(
        'sputnikDao',
        contractId,
      );

      //TODO: check when no proposals
      // Taking into account that proposal ID is sequential,
      // considering that last proposal id is the proposal count
      // for the given DAO
      const lastProposalId = await contract.get_last_proposal_id();

      const chunkSize = PROPOSAL_REQUEST_CHUNK_SIZE;
      const chunkCount =
        (lastProposalId - (lastProposalId % chunkSize)) / chunkSize + 1;
      const { results: proposals, errors } = await PromisePool.withConcurrency(
        1,
      )
        .for([...Array(chunkCount).keys()])
        .process(
          async (offset) =>
            await contract.get_proposals({
              from_index: offset * chunkSize,
              limit: chunkSize,
            }),
        );

      return proposals
        .reduce((acc: any[], prop: any[]) => acc.concat(prop), [])
        .map((proposal: any) =>
          this.proposalResponseToDTO(contractId, proposal),
        );
    } catch (error) {
      this.logger.error(error);

      return Promise.reject(error);
    }
  }

  public async getBounties(
    daoIds: string[],
    accountIds: string[],
  ): Promise<BountyDto[]> {
    const ids: string[] = daoIds || (await this.factoryContract.getDaoIds());

    const { results: bounties, errors } = await PromisePool.withConcurrency(5)
      .for(ids)
      .process(async (daoId) => await this.getBountiesByDao(daoId, accountIds));

    return bounties.reduce((acc, prop) => acc.concat(prop), []);
  }

  public async getBountiesByDao(
    contractId: string,
    accountIds: string[],
  ): Promise<BountyDto[]> {
    try {
      const contract = this.nearApiService.getContract(
        'sputnikDao',
        contractId,
      );

      // Taking into account that bounty ID is sequential,
      // considering that last bounty id is the bounty count
      // for the given DAO
      const lastBountyId = await contract.get_last_bounty_id();

      const chunkSize = PROPOSAL_REQUEST_CHUNK_SIZE;
      const chunkCount =
        (lastBountyId - (lastBountyId % chunkSize)) / chunkSize + 1;
      const { results, errors } = await PromisePool.withConcurrency(1)
        .for([...Array(chunkCount).keys()])
        .process(
          async (offset) =>
            await contract.get_bounties({
              from_index: offset * chunkSize,
              limit: chunkSize,
            }),
        );

      const bounties = results.reduce(
        (acc: BountyDto[], prop: BountyDto[]) => acc.concat(prop),
        [],
      );

      const { results: numClaims } = await PromisePool.withConcurrency(5)
        .for(bounties.map(({ id }) => id))
        .process(async (bountyId) => {
          const numClaims = await contract.get_bounty_number_of_claims({
            id: bountyId,
          });

          return { numClaims, bountyId };
        });

      const { results: claims } = await PromisePool.withConcurrency(5)
        .for(accountIds)
        .process(async (accountId) => {
          const bountyClaims = await contract.get_bounty_claims({
            account_id: accountId,
          });

          return bountyClaims.map((claim) => ({
            ...camelcaseKeys(claim),
            accountId,
          }));
        });

      const bountyClaims = claims.reduce(
        (acc: BountyClaimDto[], prop: BountyClaimDto[]) => acc.concat(prop),
        [],
      );

      return bounties.map((bounty: BountyDto) => {
        return {
          ...camelcaseKeys(bounty),
          id: buildBountyId(contractId, bounty.id),
          bountyId: bounty.id,
          daoId: contractId,
          dao: { id: contractId },
          numberOfClaims: numClaims.find(
            ({ bountyId }) => bountyId === bounty.id,
          )?.numClaims,
          bountyClaims: bountyClaims
            .filter((claim) => bounty.id === claim.bountyId)
            .map((claim) => ({
              ...camelcaseKeys(claim),
              id: buildBountyClaimId(contractId, bounty.id, claim.startTime),
              bounty: {
                id: buildBountyId(contractId, bounty.id),
                bountyId: bounty.id,
              },
            })),
        };
      });
    } catch (error) {
      this.logger.error(error);

      return Promise.reject(error);
    }
  }

  public async getAccountAmount(accountId: string): Promise<string> {
    const state = await this.nearApiService.getAccountState(accountId);
    return state.amount;
  }

  public async getDaoById(daoId: string): Promise<SputnikDaoDto | null> {
    const contract = this.nearApiService.getContract('sputnikDao', daoId);

    const daoEnricher = {
      config: async (): Promise<DaoConfig> => contract.get_config(),
      policy: async (): Promise<PolicyDto> => contract.get_policy(),
      stakingContract: async (): Promise<string> =>
        contract.get_staking_contract(),
      amount: async (): Promise<string> => this.getAccountAmount(daoId),
      totalSupply: async (): Promise<string> =>
        contract.delegation_total_supply(),
      lastProposalId: async (): Promise<string> =>
        contract.get_last_proposal_id(),
      lastBountyId: async (): Promise<string> => contract.get_last_bounty_id(),
    };

    const dao = new SputnikDaoDto();

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

    const roles = dao.policy.roles.map((role) => ({
      ...castRolePermission(camelcaseKeys(role)),
      id: buildRoleId(daoId, role.name),
      policy: { daoId },
    }));

    const policy = camelcaseKeys(dao.policy, { deep: true });

    const council = roles
      .filter(
        ({ name, kind }) => 'council' === name && RoleKindType.Group === kind,
      )
      .map(({ accountIds }) => accountIds)
      .reduce((acc, val) => acc.concat(val), []);

    return {
      ...dao,
      id: daoId,
      policy: {
        ...policy,
        daoId,
        defaultVotePolicy: castVotePolicy(policy.defaultVotePolicy),
        roles,
      },
      council,
      councilSeats: council?.length,
    };
  }

  private proposalResponseToDTO(
    contractId: string,
    proposal: any,
  ): ProposalDto {
    const kind = castProposalKind(proposal.kind);
    return {
      ...camelcaseKeys(proposal),
      id: buildProposalId(contractId, proposal.id),
      proposalId: proposal.id,
      daoId: contractId,
      dao: { id: contractId },
      kind,
      type: kind.kind.type,
    };
  }
}
