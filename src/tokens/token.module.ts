import { CacheModule, HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { Token } from './entities/token.entity';
import { CacheConfigService } from 'src/config/api-config';
import { NearIndexerModule } from 'src/near-indexer/near-indexer.module';
import { NearApiModule } from 'src/near-api/near-api.module';
import { NFTToken } from './entities/nft-token.entity';
import { NFTTokenService } from './nft-token.service';
import { NFTTokenMetadata } from './entities/nft-token-metadata.entity';
import { TokenNearService } from './token-near.service';
import { SputnikDaoService } from 'src/sputnikdao/sputnik.service';
import { TokenFactoryService } from 'src/token-factory/token-factory.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    TypeOrmModule.forFeature([Token, NFTToken, NFTTokenMetadata]),
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
