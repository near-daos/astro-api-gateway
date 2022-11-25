import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { BountyDynamoService } from '@sputnik-v2/bounty/bounty-dynamo.service';
import { FindOneOptions, Not, Repository } from 'typeorm';
import { buildBountyId } from '@sputnik-v2/utils';
import { FeatureFlags, FeatureFlagsService } from '@sputnik-v2/feature-flags';
import { BountyClaimModel } from '@sputnik-v2/dynamodb';

import { BountyDto } from './dto';
import { Bounty, BountyClaim } from './entities';

@Injectable()
export class BountyService extends TypeOrmCrudService<Bounty> {
  constructor(
    @InjectRepository(Bounty)
    private readonly bountyRepository: Repository<Bounty>,
    private readonly bountyDynamoService: BountyDynamoService,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {
    super(bountyRepository);
  }

  async useDynamoDB() {
    return this.featureFlagsService.check(FeatureFlags.BountyDynamo);
  }

  async findById(daoId: string, bountyId: number, options?: FindOneOptions) {
    const id = buildBountyId(daoId, bountyId);
    if (await this.useDynamoDB()) {
      return (
        await this.bountyDynamoService.query(daoId, {
          FilterExpression: 'id = :id',
          ExpressionAttributeValues: { ':id': id },
        })
      )[0];
    } else {
      return this.findOne(id, options);
    }
  }

  async create(bountyDto: BountyDto) {
    await this.bountyDynamoService.saveBounty(bountyDto);
    await this.bountyRepository.save(bountyDto);
  }

  // TODO: deprecated
  async createMultiple(bountyDtos: BountyDto[]): Promise<Bounty[]> {
    return this.bountyRepository.save(bountyDtos);
  }

  async getDaoActiveBountiesCount(
    daoId: string,
    allowDynamo = true,
  ): Promise<number> {
    if (allowDynamo && (await this.useDynamoDB())) {
      return this.bountyDynamoService.count(daoId, {
        FilterExpression: 'times > :times',
        ExpressionAttributeValues: {
          ':times': 0,
        },
      });
    } else {
      return this.bountyRepository.count({
        daoId,
        times: Not('0'),
      });
    }
  }

  async getLastBountyClaim(
    daoId,
    bountyId,
    accountId: string,
    untilTimestamp: number,
  ): Promise<BountyClaim | BountyClaimModel | null> {
    if (await this.useDynamoDB()) {
      const bounty = await this.findById(daoId, bountyId);
      return this.findLastClaim(
        bounty?.bountyClaims || [],
        accountId,
        untilTimestamp,
      );
    } else {
      const bounty = await this.findById(daoId, bountyId, {
        relations: ['bountyClaims'],
      });
      return this.findLastClaim(
        bounty?.bountyClaims || [],
        accountId,
        untilTimestamp,
      );
    }
  }

  findLastClaim(
    claims: Array<BountyClaim | BountyClaimModel>,
    accountId: string,
    untilTimestamp,
  ): BountyClaim | BountyClaimModel | null {
    return claims.reduce((lastClaim, currentClaim) => {
      const currentClaimTimestamp = Number(currentClaim.startTime);
      const lastClaimTimestamp = Number(lastClaim?.startTime ?? 0);

      const isLastClaim = () =>
        currentClaimTimestamp < untilTimestamp &&
        currentClaimTimestamp > lastClaimTimestamp;

      return currentClaim.accountId === accountId && isLastClaim()
        ? currentClaim
        : lastClaim;
    }, null);
  }
}
