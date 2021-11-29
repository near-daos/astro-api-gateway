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
import { NearIndexerModule } from '@sputnik-v2/near-indexer';
import { NearApiModule } from '@sputnik-v2/near-api';
import { SputnikDaoService } from '@sputnik-v2/sputnikdao';
import { CacheConfigService } from '@sputnik-v2/config/api-config';

import { TokenController } from './token.controller';
import { TokenNearService } from './token-near.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    TypeOrmModule.forFeature([Token, TokenBalance, NFTToken, NFTTokenMetadata]),
    HttpModule,
    NearIndexerModule,
    NearApiModule,
  ],
  providers: [
    TokenService,
    NFTTokenService,
    TokenNearService,
    SputnikDaoService,
    TokenFactoryService,
  ],
  controllers: [TokenController],
  exports: [TokenService, NFTTokenService],
})
export class TokenModule {}
