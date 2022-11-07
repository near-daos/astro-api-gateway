import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { NearApiService } from '@sputnik-v2/near-api';
import {
  DynamodbService,
  DynamoEntityType,
  mapNftTokenToNftModel,
  NftModel,
} from '@sputnik-v2/dynamodb';
import { FeatureFlags, FeatureFlagsService } from '@sputnik-v2/feature-flags';

import { AssetsNftEvent, NearIndexerService } from '@sputnik-v2/near-indexer';

import { NFTToken } from './entities';
import { NFTTokenDto, NFTTokenResponse } from './dto';
import { castNFT } from './types';

@Injectable()
export class NFTTokenService extends TypeOrmCrudService<NFTToken> {
  constructor(
    @InjectRepository(NFTToken)
    private readonly nftTokenRepository: Repository<NFTToken>,
    private readonly nearIndexerService: NearIndexerService,
    private readonly nearApiService: NearApiService,
    private readonly dynamodbService: DynamodbService,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {
    super(nftTokenRepository);
  }

  async useDynamoDB() {
    return this.featureFlagsService.check(FeatureFlags.TokenDynamo);
  }

  async create(tokenDto: NFTTokenDto): Promise<NFTToken> {
    return this.nftTokenRepository.save(tokenDto);
  }

  async createMultiple(nftDtos: NFTTokenDto[]) {
    if (await this.useDynamoDB()) {
      await this.dynamodbService.batchPut(
        nftDtos.map((nft) => mapNftTokenToNftModel(nft)),
      );
    } else {
      await this.nftTokenRepository.save(nftDtos);
    }
  }

  async purge(accountId: string, contractId: string, ids: string[]) {
    if (await this.useDynamoDB()) {
      const nftsToDelete = await this.dynamodbService.getItemsByType<NftModel>(
        accountId,
        DynamoEntityType.Nft,
        {
          expression: 'contractId = :contractId and not contains(:ids, id)',
          variables: { ':contractId': contractId, ':ids': ids },
        },
      );
      await this.dynamodbService.batchDelete(nftsToDelete);
    } else {
      await this.nftTokenRepository.delete({
        accountId,
        contractId,
        id: Not(In(ids)),
      });
    }
  }

  async lastToken(): Promise<NFTToken> {
    return this.nftTokenRepository.findOne({
      where: { updateTimestamp: Not(IsNull()) },
      order: { updateTimestamp: 'DESC' },
    });
  }

  async getMany(req: CrudRequest): Promise<NFTTokenResponse | NFTToken[]> {
    req.options.query.join.contract = { eager: true };
    return super.getMany(req);
  }

  async getAccountTokenCount(accountId: string): Promise<number> {
    return this.nftTokenRepository.count({ accountId });
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

  async loadNFT(nftContractId: string, accountId: string, timestamp?: number) {
    const contract = this.nearApiService.getContract('nft', nftContractId);
    const metadata = await contract.nft_metadata();
    const nfts = await this.getNfts(nftContractId, accountId);
    const tokenDtos = nfts.map((nft) =>
      castNFT(nftContractId, accountId, metadata, nft, timestamp),
    );
    const tokenIds = tokenDtos.map(({ id }) => id);
    await this.createMultiple(tokenDtos);
    await this.purge(accountId, nftContractId, tokenIds);
  }

  private async getNfts(
    nftContractId: string,
    accountId: string,
  ): Promise<Array<any>> {
    const contract = this.nearApiService.getContract('nft', nftContractId);
    const chunkSize = 50;
    let nfts = [];
    let chunk = [];
    let fromIndex = 0;

    do {
      try {
        chunk = await contract.nft_tokens_for_owner({
          account_id: accountId,
          from_index: fromIndex.toString(),
          limit: chunkSize,
        });
        fromIndex += chunkSize;
        nfts = nfts.concat(chunk);
      } catch (err) {
        break;
      }
    } while (chunk.length === chunkSize);

    return nfts;
  }
}
