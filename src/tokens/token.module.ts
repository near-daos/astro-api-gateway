import { CacheModule, HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { Token } from './entities/token.entity';
import { CacheConfigService } from 'src/config/api-config';
import { NearModule } from 'src/near/near.module';
import { NFTToken } from './entities/nft-token.entity';
import { NFTTokenService } from './nft-token.service';
import { NFTTokenMetadata } from './entities/nft-token-metadata.entity';
import { TokenNearService } from './token-near.service';
import { SputnikDaoService } from 'src/sputnikdao/sputnik.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    TypeOrmModule.forFeature([Token, NFTToken, NFTTokenMetadata]),
    HttpModule,
    NearModule,
  ],
  providers: [
    TokenService,
    NFTTokenService,
    TokenNearService,
    SputnikDaoService,
  ],
  controllers: [TokenController],
  exports: [TokenService, NFTTokenService],
})
export class TokenModule {}
