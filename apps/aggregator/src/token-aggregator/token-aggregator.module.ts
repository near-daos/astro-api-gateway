import { HttpModule, Module } from '@nestjs/common';

import { TokenModule } from '@sputnik-v2/token';

import { TokenAggregatorService } from './token-aggregator.service';

@Module({
  imports: [HttpModule, TokenModule],
  providers: [TokenAggregatorService],
  exports: [TokenAggregatorService],
})
export class TokenAggregatorModule {}
