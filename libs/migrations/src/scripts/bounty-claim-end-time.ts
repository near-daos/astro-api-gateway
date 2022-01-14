import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { calculateClaimEndTime } from '@sputnik-v2/utils';
import { BountyClaim } from '@sputnik-v2/bounty';

import { Migration } from '..';

@Injectable()
export class BountyClaimEndTimeMigration implements Migration {
  private readonly logger = new Logger(BountyClaimEndTimeMigration.name);

  constructor(
    @InjectRepository(BountyClaim)
    private readonly bountyClaimRepository: Repository<BountyClaim>,
  ) {}

  public async migrate(): Promise<void> {
    this.logger.log('Starting Bounty Claim End Time migration...');

    this.logger.log('Collecting bounty claims...');
    const bountyClaims = await this.bountyClaimRepository.find();

    this.logger.log('Setting endTime field...');
    await this.bountyClaimRepository.save(
      bountyClaims.map((bountyClaim) => {
        return {
          ...bountyClaim,
          endTime: calculateClaimEndTime(
            bountyClaim.startTime,
            bountyClaim.deadline,
          ),
        };
      }),
    );
  }
}
