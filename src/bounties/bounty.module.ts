import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BountyController } from './bounty.controller';
import { BountyService } from './bounty.service';
import { CacheConfigService } from 'src/config';
import { NearModule } from 'src/near/near.module';
import { Bounty } from './entities/bounty.entity';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    TypeOrmModule.forFeature([Bounty]),
    NearModule,
  ],
  providers: [BountyService],
  controllers: [BountyController],
  exports: [BountyService],
})
export class BountyModule {}
