import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { CrudRequest } from '@nestjsx/crud';

import { AssetsNftEvent, NearIndexerService } from '@sputnik-v2/near-indexer';

import { NFTToken } from './entities';
import { NFTTokenDto, NFTTokenResponse } from './dto';

@Injectable()
export class NFTTokenService extends TypeOrmCrudService<NFTToken> {
  constructor(
    @InjectRepository(NFTToken)
    private readonly nftTokenRepository: Repository<NFTToken>,
    private readonly nearIndexerService: NearIndexerService,
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

  async getTokenEvents(id: string): Promise<AssetsNftEvent[]> {
    const nftToken = await this.nftTokenRepository.findOne(id);

    if (!nftToken) {
      throw new NotFoundException(`NFT with id ${id} not found`);
    }

    return this.nearIndexerService.findNFTEvents(
      nftToken.contractId,
      nftToken.tokenId || '0',
    );
  }
}
