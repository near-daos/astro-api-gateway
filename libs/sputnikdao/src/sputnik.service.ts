import { Injectable, Logger } from '@nestjs/common';
import { Bounty } from '@sputnik-v2/bounty/entities';

import {
  NearApiService,
  SputnikDaoBounty,
  SputnikDaoBountyOutput,
  SputnikDaoContract,
  SputnikDaoFactoryContract,
} from '@sputnik-v2/near-api';
import PromisePool from '@supercharge/promise-pool';
import { castProposalKind } from '@sputnik-v2/proposal/dto';

import { DaoInfo } from './types';
import {
  BOUNTY_REQUEST_CHUNK_SIZE,
  PROPOSAL_REQUEST_CHUNK_SIZE,
} from './constants';

@Injectable()
export class SputnikService {
  private readonly logger = new Logger(SputnikService.name);

  private factoryContract!: SputnikDaoFactoryContract;

  constructor(private readonly nearApiService: NearApiService) {
    this.factoryContract =
      nearApiService.getContract<SputnikDaoFactoryContract>(
        'sputnikDaoFactory',
      );
  }

  public async getDaoInfo(daoId: string): Promise<DaoInfo> {
    const daoContract = this.nearApiService.getContract<SputnikDaoContract>(
      'sputnikDao',
      daoId,
    );
    const config = await daoContract.get_config();
    const policy = await daoContract.get_policy();
    const stakingContract = await daoContract.get_staking_contract();
    const totalSupply = await daoContract.delegation_total_supply();
    const lastProposalId = await daoContract.get_last_proposal_id();
    const lastBountyId = await daoContract.get_last_bounty_id();
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

  public async getProposalsByDaoId(daoId: string, lastProposalId: number) {
    const daoContract = this.nearApiService.getContract<SputnikDaoContract>(
      'sputnikDao',
      daoId,
    );
    const chunkSize = PROPOSAL_REQUEST_CHUNK_SIZE;
    const chunkCount =
      (lastProposalId - (lastProposalId % chunkSize)) / chunkSize + 1;
    let proposals = [];

    // Load all proposals by chunks
    for (let i = 0; i < chunkCount; i++) {
      const proposalsChunk = await daoContract.get_proposals({
        from_index: chunkSize * i,
        limit: chunkSize,
      });
      proposals = proposals.concat(proposalsChunk);
    }

    return proposals;
  }

  public async getProposal(daoId: string, proposalId: number) {
    const daoContract = this.nearApiService.getContract<SputnikDaoContract>(
      'sputnikDao',
      daoId,
    );
    try {
      return await daoContract.get_proposal({ id: proposalId });
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

  public async getBountiesByDaoId(
    daoId: string,
  ): Promise<(SputnikDaoBountyOutput & { numberOfClaims: number })[]> {
    const daoContract = this.nearApiService.getContract<SputnikDaoContract>(
      'sputnikDao',
      daoId,
    );
    const lastBountyId = await daoContract.get_last_bounty_id();
    const chunkSize = BOUNTY_REQUEST_CHUNK_SIZE;
    const chunkCount =
      (lastBountyId - (lastBountyId % chunkSize)) / chunkSize + 1;
    let bounties: SputnikDaoBountyOutput[] = [];

    // Load all bounties by chunks
    for (let i = 0; i < chunkCount; i++) {
      const bountiesChunk = await daoContract.get_bounties({
        from_index: chunkSize * i,
        limit: chunkSize,
      });
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
          numberOfClaims: await daoContract.get_bounty_number_of_claims({
            id: bounty.id,
          }),
        };
      });

    return results;
  }

  public async getBountyClaims(daoId: string, accountIds: string[]) {
    const daoContract = this.nearApiService.getContract<SputnikDaoContract>(
      'sputnikDao',
      daoId,
    );
    const { results: claims } = await PromisePool.withConcurrency(2)
      .for(accountIds)
      .process(async (accountId) => {
        const bountyClaims = await daoContract.get_bounty_claims({
          account_id: accountId,
        });

        return bountyClaims.map((claim) => ({
          ...claim,
          accountId,
        }));
      });

    return claims.flat();
  }

  public async findLastBounty(daoId: string, bountyData: Bounty) {
    const bounties = await this.getBountiesByDaoId(daoId);

    for (let i = bounties.length - 1; i >= 0; i--) {
      if (this.compareBounties(bounties[i], bountyData)) {
        return bounties[i];
      }
    }

    return null;
  }

  private compareProposals(proposal1, proposal2): boolean {
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

  private compareProposalKinds(kind1, kind2): boolean {
    const kindDto1 = castProposalKind(kind1);
    const kindDto2 = castProposalKind(kind2);
    return kindDto1.equals(kindDto2);
  }
}
