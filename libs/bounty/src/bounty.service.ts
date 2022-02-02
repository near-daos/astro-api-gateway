import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Not, Repository } from 'typeorm';

import { BountyDto } from './dto';
import { Bounty, BountyClaim } from './entities';
import { getBlockTimestamp } from '@sputnik-v2/utils';

@Injectable()
export class BountyService extends TypeOrmCrudService<Bounty> {
  constructor(
    @InjectRepository(Bounty)
    private readonly bountyRepository: Repository<Bounty>,
  ) {
    super(bountyRepository);
  }

  async create(bountyDto: BountyDto): Promise<Bounty> {
    return this.bountyRepository.save(bountyDto);
  }

  async createMultiple(bountyDtos: BountyDto[]): Promise<Bounty[]> {
    return this.bountyRepository.save(bountyDtos);
  }

  async getDaoActiveBountiesCount(daoId: string): Promise<number> {
    return this.bountyRepository.count({
      daoId,
      times: Not('0'),
    });
  }

  async getLastBountyClaim(
    bountyId: string,
    accountId: string,
    untilTimestamp = getBlockTimestamp(),
  ): Promise<BountyClaim | null> {
    const bounty = await this.bountyRepository.findOne(bountyId, {
      relations: ['bountyClaims'],
    });
    return bounty.bountyClaims.reduce((lastClaim, currentClaim) => {
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
