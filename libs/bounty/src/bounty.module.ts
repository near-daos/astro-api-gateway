import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BountyService } from './bounty.service';
import { BountyContextService } from './bounty-context.service';
import { Bounty, BountyContext } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Bounty, BountyContext])],
  providers: [BountyService, BountyContextService],
  exports: [BountyService, BountyContextService],
})
export class BountyModule {}
