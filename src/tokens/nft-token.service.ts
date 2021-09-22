import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { NFTToken } from './entities/nft-token.entity';
import { NFTTokenDto } from './dto/nft-token.dto';

@Injectable()
export class NFTTokenService extends TypeOrmCrudService<NFTToken> {
  constructor(
    @InjectRepository(NFTToken)
    private readonly nftTokenRepository: Repository<NFTToken>,
  ) {
    super(nftTokenRepository);
  }

  async create(tokenDto: NFTTokenDto): Promise<NFTToken> {
    return this.nftTokenRepository.save(tokenDto);
  }
}
