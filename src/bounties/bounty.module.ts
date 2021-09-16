import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BountyController } from './bounty.controller';
import { BountyService } from './bounty.service';
import { CacheConfigService } from 'src/config/api-config';
import { NearSlimModule } from 'src/near/near-slim.module';
import { Bounty } from './entities/bounty.entity';
import { BountyClaim } from './entities/bounty-claim.entity';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    TypeOrmModule.forFeature([Bounty, BountyClaim]),
    NearSlimModule,
  ],
  providers: [BountyService],
  controllers: [BountyController],
  exports: [BountyService],
})
export class BountyModule {}
