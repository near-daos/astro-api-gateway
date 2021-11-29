import { Module } from '@nestjs/common';

import { NearApiModule } from '@sputnik-v2/near-api';
import { TokenModule } from '@sputnik-v2/token';

import { TokenAggregatorService } from './token-aggregator.service';

@Module({
  imports: [NearApiModule, TokenModule],
  providers: [TokenAggregatorService],
  exports: [TokenAggregatorService],
})
export class TokenAggregatorModule {}
