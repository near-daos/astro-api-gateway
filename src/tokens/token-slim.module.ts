import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NearIndexerModule } from 'src/near-indexer/near-indexer.module';
import { NFTToken } from './entities/nft-token.entity';
import { NFTTokenMetadata } from './entities/nft-token-metadata.entity';
import { Token } from './entities/token.entity';
import { NFTTokenService } from './nft-token.service';
import { TokenService } from './token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Token, NFTToken, NFTTokenMetadata]),
    NearIndexerModule,
  ],
  providers: [TokenService, NFTTokenService],
  exports: [TokenService, NFTTokenService],
})
export class TokenSlimModule {}
