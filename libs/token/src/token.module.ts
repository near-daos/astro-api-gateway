import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NearIndexerModule } from '@sputnik-v2/near-indexer';

import { Token, NFTToken, NFTTokenMetadata } from './entities';
import { NFTTokenService } from './nft-token.service';
import { TokenService } from './token.service';
import { TokenFactoryService } from './token-factory.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Token, NFTToken, NFTTokenMetadata]),
    NearIndexerModule,
  ],
  providers: [TokenFactoryService, TokenService, NFTTokenService],
  exports: [TokenFactoryService, TokenService, NFTTokenService],
})
export class TokenModule {}
