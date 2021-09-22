import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NearModule } from 'src/near/near.module';
import { NFTToken } from './entities/nft-token.entity';
import { NFTTokenMetadata } from './entities/nft-token-metadata.entity';
import { Token } from './entities/token.entity';
import { NFTTokenService } from './nft-token.service';
import { TokenService } from './token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Token, NFTToken, NFTTokenMetadata]),
    NearModule,
  ],
  providers: [TokenService, NFTTokenService],
  exports: [TokenService, NFTTokenService],
})
export class TokenSlimModule {}
