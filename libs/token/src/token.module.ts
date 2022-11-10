import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NearIndexerModule } from '@sputnik-v2/near-indexer';
import { NearApiModule } from '@sputnik-v2/near-api';
import { Dao } from '@sputnik-v2/dao/entities';
import { FeatureFlagsModule } from '@sputnik-v2/feature-flags';
import { DynamodbModule } from '@sputnik-v2/dynamodb/dynamodb.module';
import { NFTTokenDynamoService } from '@sputnik-v2/token/nft-token-dynamo.service';

import { Token, NFTToken, NFTTokenMetadata, TokenBalance } from './entities';
import { NFTTokenService } from './nft-token.service';
import { TokenService } from './token.service';
import { TokenFactoryService } from './token-factory.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Token,
      TokenBalance,
      NFTToken,
      NFTTokenMetadata,
      Dao,
    ]),
    NearIndexerModule,
    NearApiModule,
    FeatureFlagsModule,
    DynamodbModule,
  ],
  providers: [
    TokenFactoryService,
    TokenService,
    NFTTokenService,
    NFTTokenDynamoService,
  ],
  exports: [
    TokenFactoryService,
    TokenService,
    NFTTokenService,
    NFTTokenDynamoService,
  ],
})
export class TokenModule {}
