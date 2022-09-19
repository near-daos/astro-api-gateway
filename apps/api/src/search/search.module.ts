import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dao, DaoModule } from '@sputnik-v2/dao';
import { Proposal, ProposalModule } from '@sputnik-v2/proposal';
import { CacheConfigService } from '@sputnik-v2/config/api-config';

import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    TypeOrmModule.forFeature([Proposal]),
    TypeOrmModule.forFeature([Dao]),
    DaoModule,
    ProposalModule,
  ],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule {}
