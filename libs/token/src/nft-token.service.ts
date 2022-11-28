import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { CrudRequest } from '@nestjsx/crud';
import {
  NearApiService,
  NFTokenContract,
  NFTokenOutput,
} from '@sputnik-v2/near-api';
import { FeatureFlags, FeatureFlagsService } from '@sputnik-v2/feature-flags';
import { AssetsNftEvent, NearIndexerService } from '@sputnik-v2/near-indexer';

import { NFTTokenDynamoService } from './nft-token-dynamo.service';
import { NFTToken } from './entities';
import { NFTTokenDto, NFTTokenResponse } from './dto';
import { castNFT } from './types';

@Injectable()
export class NFTTokenService extends TypeOrmCrudService<NFTToken> {
  constructor(
    @InjectRepository(NFTToken)
    private readonly nftTokenRepository: Repository<NFTToken>,
    @Inject(forwardRef(() => NearIndexerService))
    private readonly nearIndexerService: NearIndexerService,
    private readonly nearApiService: NearApiService,
    private readonly nftTokenDynamoService: NFTTokenDynamoService,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {
    super(nftTokenRepository);
  }

  async useDynamoDB() {
    return this.featureFlagsService.check(FeatureFlags.NftTokenDynamo);
  }

  async create(tokenDto: NFTTokenDto): Promise<NFTToken> {
    await this.nftTokenDynamoService.save(tokenDto);
    return await this.nftTokenRepository.save(tokenDto);
  }

  async createMultiple(nftDtos: NFTTokenDto[]) {
    await this.nftTokenDynamoService.saveMultiple(nftDtos);
    await this.nftTokenRepository.save(nftDtos);
  }

  async purge(accountId: string, contractId: string, ids: string[]) {
    const nftsToDelete = await this.nftTokenDynamoService.query(accountId, {
      FilterExpression: 'contractId = :contractId and not contains(:ids, id)',
      ExpressionAttributeValues: {
        ':contractId': contractId,
        ':ids': ids,
      },
    });
    await this.nftTokenDynamoService.delete(nftsToDelete);
    await this.nftTokenRepository.delete({
      accountId,
      contractId,
      id: Not(In(ids)),
    });
  }

  // TODO: dynamo
  async lastToken(): Promise<NFTToken> {
    return this.nftTokenRepository.findOne({
      where: { updateTimestamp: Not(IsNull()) },
      order: { updateTimestamp: 'DESC' },
    });
  }

  // TODO: dynamo
  async getMany(req: CrudRequest): Promise<NFTTokenResponse | NFTToken[]> {
    req.options.query.join.contract = { eager: true };
    return super.getMany(req);
  }

  async getAccountTokenCount(
    accountId: string,
    allowDynamo = true,
  ): Promise<number> {
    if (allowDynamo && (await this.useDynamoDB())) {
      return this.nftTokenDynamoService.count(accountId);
    } else {
      return this.nftTokenRepository.count({ accountId });
    }
  }

  // TODO: dynamo
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

  async loadNFT(nftContractId: string, accountId: string, timestamp: number) {
    const contract = this.nearApiService.getContract<NFTokenContract>(
      'nft',
      nftContractId,
    );
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
  ): Promise<NFTokenOutput[]> {
    const contract = this.nearApiService.getContract<NFTokenContract>(
      'nft',
      nftContractId,
    );
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
