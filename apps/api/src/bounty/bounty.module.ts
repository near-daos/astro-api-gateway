import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BountyService,
  Bounty,
  BountyClaim,
  BountyContext,
  BountyContextService,
} from '@sputnik-v2/bounty';
import { ProposalModule } from '@sputnik-v2/proposal';
import { CacheConfigService } from '@sputnik-v2/config/api-config';
import { DaoModule } from '@sputnik-v2/dao';
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
    DynamodbModule,
  ],
  providers: [BountyService, BountyContextService],
  controllers: [BountyController],
  exports: [BountyService, BountyContextService],
})
export class BountyModule {}
