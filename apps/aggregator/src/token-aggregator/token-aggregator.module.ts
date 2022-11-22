import { HttpModule, Module } from '@nestjs/common';
import { DaoModule } from '@sputnik-v2/dao';

import { NearApiModule } from '@sputnik-v2/near-api';
import { TokenModule } from '@sputnik-v2/token';

import { TokenAggregatorService } from './token-aggregator.service';
import { NFTAggregatorService } from './nft-aggregator.service';

@Module({
  imports: [NearApiModule, HttpModule, TokenModule, DaoModule],
  providers: [TokenAggregatorService, NFTAggregatorService],
  exports: [TokenAggregatorService, NFTAggregatorService],
})
export class TokenAggregatorModule {}
