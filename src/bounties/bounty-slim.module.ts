import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BountyService } from './bounty.service';
import { Bounty } from './entities/bounty.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bounty])],
  providers: [BountyService],
  exports: [BountyService],
})
export class BountySlimModule {}
