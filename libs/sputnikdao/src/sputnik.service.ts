import { Injectable } from '@nestjs/common';
import { BlockId } from 'near-api-js/lib/providers/provider';
import { Bounty } from '@sputnik-v2/bounty/entities';

import {
  NearApiService,
  SputnikDaoBounty,
  SputnikDaoBountyOutput,
  SputnikDaoConfig,
  SputnikDaoFactoryContract,
  SputnikDaoPolicy,
  SputnikDaoProposal,
  SputnikDaoProposalKind,
  SputnikDaoProposalOutput,
} from '@sputnik-v2/near-api';
import PromisePool from '@supercharge/promise-pool';
import { castProposalKind, ProposalKind } from '@sputnik-v2/proposal/dto';

import { DaoInfo } from './types';
import {
  BOUNTY_REQUEST_CHUNK_SIZE,
  PROPOSAL_REQUEST_CHUNK_SIZE,
} from './constants';

@Injectable()
export class SputnikService {
  private factoryContract!: SputnikDaoFactoryContract;

  constructor(private readonly nearApiService: NearApiService) {
    this.factoryContract =
      nearApiService.getContract<SputnikDaoFactoryContract>(
        'sputnikDaoFactory',
      );
  }

  public async getDaoInfo(daoId: string, blockId?: BlockId): Promise<DaoInfo> {
    const config = await this.getConfig(daoId, blockId);
    const policy = await this.getPolicy(daoId, blockId);
    const stakingContract = await this.getStakingContract(daoId, blockId);
    const totalSupply = await this.getDelegationTotalSupply(daoId, blockId);
    const lastProposalId = await this.getLastProposalId(daoId, blockId);
    const lastBountyId = await this.getLastBountyId(daoId, blockId);
    const amount = await this.nearApiService.getAccountAmount(daoId);
    return {
      config,
      policy,
      stakingContract,
      totalSupply,
      lastProposalId,
      lastBountyId,
      amount,
    };
  }

  public async getConfig(
    daoId: string,
    blockId?: BlockId,
  ): Promise<SputnikDaoConfig> {
    return this.nearApiService.callContractRetry(
      daoId,
      'get_config',
      {},
      blockId,
    );
  }

  public async getPolicy(
    daoId: string,
    blockId?: BlockId,
  ): Promise<SputnikDaoPolicy> {
    return this.nearApiService.callContractRetry(
      daoId,
      'get_policy',
      {},
      blockId,
    );
  }

  public async getStakingContract(
    daoId: string,
    blockId?: BlockId,
  ): Promise<string> {
    return this.nearApiService.callContractRetry(
      daoId,
      'get_staking_contract',
      {},
      blockId,
    );
  }

  public async getDelegationTotalSupply(
    daoId: string,
    blockId?: BlockId,
  ): Promise<string> {
    return this.nearApiService.callContractRetry(
      daoId,
      'delegation_total_supply',
      {},
      blockId,
    );
  }

  public async getLastProposalId(
    daoId: string,
    blockId?: BlockId,
  ): Promise<number> {
    return this.nearApiService.callContractRetry(
      daoId,
      'get_last_proposal_id',
      {},
      blockId,
    );
  }

  public async getLastBountyId(
    daoId: string,
    blockId?: BlockId,
  ): Promise<number> {
    return this.nearApiService.callContractRetry(
      daoId,
      'get_last_bounty_id',
      {},
      blockId,
    );
  }

  public async getDelegationBalance(
    daoId: string,
    accountId: string,
    blockId?: BlockId,
  ) {
    return this.nearApiService.callContractRetry(
      daoId,
      'get_bounty_number_of_claims',
      {
        account_id: accountId,
      },
      blockId,
    );
  }

  public async getProposalsByDaoId(
    daoId: string,
    lastProposalId: number,
    blockId?: BlockId,
  ) {
    const chunkSize = PROPOSAL_REQUEST_CHUNK_SIZE;
    const chunkCount =
      (lastProposalId - (lastProposalId % chunkSize)) / chunkSize + 1;
    let proposals: SputnikDaoProposalOutput[] = [];

    // Load all proposals by chunks
    for (let i = 0; i < chunkCount; i++) {
      const proposalsChunk = await this.nearApiService.callContractRetry(
        daoId,
        'get_proposals',
        {
          from_index: chunkSize * i,
          limit: chunkSize,
        },
        blockId,
      );
      proposals = proposals.concat(proposalsChunk);
    }

    return proposals;
  }

  public async getProposal(
    daoId: string,
    proposalId: number,
    blockId?: BlockId,
  ) {
    try {
      return await this.nearApiService.callContractRetry(
        daoId,
        'get_proposal',
        { id: proposalId },
        blockId,
      );
    } catch (err) {
      if (err.message.includes('ERR_NO_PROPOSAL')) {
        return null;
      }
      throw err;
    }
  }

  public async findLastProposal(
    daoId: string,
    lastProposalId: number,
    proposalData,
  ) {
    const proposals = await this.getProposalsByDaoId(daoId, lastProposalId);

    for (let i = proposals.length - 1; i >= 0; i--) {
      if (this.compareProposals(proposals[i], proposalData)) {
        return proposals[i];
      }
    }

    return null;
  }

  public async getBounty(daoId: string, bountyId: number, blockId?: BlockId) {
    return await this.nearApiService.callContractRetry(
      daoId,
      'get_bounty',
      { id: bountyId },
      blockId,
    );
  }

  public async getBountiesByDaoId(
    daoId: string,
    lastBountyId: number,
    blockId?: BlockId,
  ): Promise<(SputnikDaoBountyOutput & { numberOfClaims: number })[]> {
    const chunkSize = BOUNTY_REQUEST_CHUNK_SIZE;
    const chunkCount =
      (lastBountyId - (lastBountyId % chunkSize)) / chunkSize + 1;
    let bounties: SputnikDaoBountyOutput[] = [];

    // Load all bounties by chunks
    for (let i = 0; i < chunkCount; i++) {
      const bountiesChunk = await this.nearApiService.callContractRetry(
        daoId,
        'get_bounties',
        {
          from_index: chunkSize * i,
          limit: chunkSize,
        },
        blockId,
      );
      bounties = bounties.concat(bountiesChunk);
    }

    const { results } = await PromisePool.withConcurrency(5)
      .for(bounties)
      .handleError((err) => {
        throw err;
      })
      .process(async (bounty) => {
        return {
          ...bounty,
          numberOfClaims: await this.getBountyNumberOfClaims(
            daoId,
            bounty.id,
            blockId,
          ),
        };
      });

    return results;
  }

  public async getBountyNumberOfClaims(
    daoId: string,
    bountyId: number,
    blockId?: BlockId,
  ) {
    return this.nearApiService.callContractRetry(
      daoId,
      'get_bounty_number_of_claims',
      {
        id: bountyId,
      },
      blockId,
    );
  }

  public async getBountyClaims(
    daoId: string,
    accountIds: string[],
    blockId?: BlockId,
  ) {
    const { results: claims } = await PromisePool.withConcurrency(2)
      .for(accountIds)
      .handleError((err) => {
        throw err;
      })
      .process(async (accountId) => {
        return this.getAccountBountyClaims(daoId, accountId, blockId);
      });

    return claims.flat();
  }

  public async getAccountBountyClaims(
    daoId: string,
    accountId: string,
    blockId?: BlockId,
  ) {
    const bountyClaims = await this.nearApiService.callContractRetry(
      daoId,
      'get_bounty_claims',
      {
        account_id: accountId,
      },
      blockId,
    );

    return bountyClaims.map((claim) => ({
      ...claim,
      accountId,
    }));
  }

  public async findLastBounty(
    daoId: string,
    lastBountyId: number,
    bountyData: Bounty,
    blockId?: BlockId,
  ) {
    const bounties = await this.getBountiesByDaoId(
      daoId,
      lastBountyId,
      blockId,
    );

    for (let i = bounties.length - 1; i >= 0; i--) {
      if (this.compareBounties(bounties[i], bountyData)) {
        return bounties[i];
      }
    }

    return null;
  }

  private compareProposals(proposal1: SputnikDaoProposal, proposal2): boolean {
    const hasSameKind = this.compareProposalKinds(
      proposal1.kind,
      proposal2.kind,
    );
    return (
      proposal1.description === proposal2.description &&
      proposal1.proposer === proposal2.proposer &&
      hasSameKind
    );
  }

  private compareBounties(bounty1: SputnikDaoBounty, bounty2: Bounty): boolean {
    return (
      bounty1.description === bounty2.description &&
      bounty1.token === bounty2.token &&
      bounty1.amount === bounty2.amount &&
      bounty1.times === bounty2.times &&
      bounty1.max_deadline === bounty2.maxDeadline
    );
  }

  private compareProposalKinds(
    kind1: ProposalKind | SputnikDaoProposalKind,
    kind2: ProposalKind | SputnikDaoProposalKind,
  ): boolean {
    const kindDto1 = castProposalKind(kind1);
    const kindDto2 = castProposalKind(kind2);
    return kindDto1.equals(kindDto2);
  }
}
