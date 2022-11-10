import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Bounty,
  BountyClaim,
  BountyContext,
  BountyModule as MainBountyModule,
} from '@sputnik-v2/bounty';
import { ProposalModule } from '@sputnik-v2/proposal';
import { CacheConfigService } from '@sputnik-v2/config/api-config';
import { DaoModule } from '@sputnik-v2/dao';
import { FeatureFlagsModule } from '@sputnik-v2/feature-flags';
import { DynamodbModule } from '@sputnik-v2/dynamodb';

import { NearModule } from '../near/near.module';
import { BountyController } from './bounty.controller';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    TypeOrmModule.forFeature([Bounty, BountyClaim, BountyContext]),
    DaoModule,
    ProposalModule,
    NearModule,
    FeatureFlagsModule,
    DynamodbModule,
    MainBountyModule,
  ],
  controllers: [BountyController],
})
export class BountyModule {}
