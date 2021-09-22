import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { Token } from './entities/token.entity';
import { CacheConfigService } from 'src/config/api-config';
import { NearSlimModule } from 'src/near/near-slim.module';
import { NFTToken } from './entities/nft-token.entity';
import { NFTTokenService } from './nft-token.service';
import { NFTTokenMetadata } from './entities/nft-token-metadata.entity';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    TypeOrmModule.forFeature([Token, NFTToken, NFTTokenMetadata]),
    NearSlimModule,
  ],
  providers: [TokenService, NFTTokenService],
  controllers: [TokenController],
  exports: [TokenService, NFTTokenService],
})
export class TokenModule {}
