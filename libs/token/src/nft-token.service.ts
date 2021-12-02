import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';

import { NFTToken } from './entities';
import { NFTTokenDto, NFTTokenResponse } from './dto';
import { CrudRequest } from '@nestjsx/crud';

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

  async createMultiple(tokenDtos: NFTTokenDto[]): Promise<NFTToken[]> {
    return this.nftTokenRepository.save(tokenDtos);
  }

  async lastToken(): Promise<NFTToken> {
    return this.nftTokenRepository.findOne({
      order: { updateTimestamp: 'DESC' },
    });
  }

  async getMany(req: CrudRequest): Promise<NFTTokenResponse | NFTToken[]> {
    req.options.query.join.contract = { eager: true };
    return super.getMany(req);
  }
}
