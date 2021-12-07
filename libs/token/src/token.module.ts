import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NearIndexerModule } from '@sputnik-v2/near-indexer';
import { NearApiModule } from '@sputnik-v2/near-api';

import { Token, NFTToken, NFTTokenMetadata, TokenBalance } from './entities';
import { NFTTokenService } from './nft-token.service';
import { TokenService } from './token.service';
import { TokenFactoryService } from './token-factory.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Token, TokenBalance, NFTToken, NFTTokenMetadata]),
    NearIndexerModule,
    NearApiModule,
  ],
  providers: [TokenFactoryService, TokenService, NFTTokenService],
  exports: [TokenFactoryService, TokenService, NFTTokenService],
})
export class TokenModule {}
