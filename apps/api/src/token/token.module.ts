import { CacheModule, HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  TokenService,
  Token,
  NFTToken,
  NFTTokenService,
  NFTTokenMetadata,
  TokenFactoryService,
  TokenBalance,
} from '@sputnik-v2/token';
import { Dao } from '@sputnik-v2/dao/entities';
import { NearIndexerModule } from '@sputnik-v2/near-indexer';
import { NearApiModule } from '@sputnik-v2/near-api';
import { CacheConfigService } from '@sputnik-v2/config/api-config';

import { TokenController } from './token.controller';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    TypeOrmModule.forFeature([
      Token,
      TokenBalance,
      NFTToken,
      NFTTokenMetadata,
      Dao,
    ]),
    HttpModule,
    NearIndexerModule,
    NearApiModule,
  ],
  providers: [TokenService, NFTTokenService, TokenFactoryService],
  controllers: [TokenController],
  exports: [TokenService, NFTTokenService],
})
export class TokenModule {}
