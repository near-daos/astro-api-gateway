import { Injectable, Logger } from '@nestjs/common';

import { NearApiService } from '@sputnik-v2/near-api';
import { castNFT, NFTTokenService, NFTTokenUpdateDto } from '@sputnik-v2/token';
import PromisePool from '@supercharge/promise-pool';

@Injectable()
export class NFTAggregatorService {
  private readonly logger = new Logger(NFTAggregatorService.name);

  constructor(
    private readonly nearApiService: NearApiService,
    private readonly nftTokenService: NFTTokenService,
  ) {}

  public async aggregateDaoNFTUpdates(
    tokenUpdates: NFTTokenUpdateDto[],
  ): Promise<void> {
    const { errors } = await PromisePool.withConcurrency(5)
      .for(tokenUpdates)
      .process(async ({ nft, account, timestamp }) =>
        this.aggregateDaoNFT(nft, account, timestamp),
      );

    errors.forEach((error) => {
      this.logger.error(
        `Failed NFT aggregation ${error.item.nft} with error: ${error}`,
      );
    });
  }

  public async aggregateDaoNFTs(
    daoId: string,
    nftIds: string[],
    timestamp?: number,
  ): Promise<void> {
    const { errors } = await PromisePool.withConcurrency(5)
      .for(nftIds)
      .process(async (nftId) => this.aggregateDaoNFT(nftId, daoId, timestamp));

    errors.forEach((error) => {
      this.logger.error(
        `Failed NFT aggregation ${error.item} with error: ${error}`,
      );
    });
  }

  public async aggregateDaoNFT(
    nftContractId: string,
    daoId: string,
    timestamp?: number,
  ): Promise<void> {
    const contract = this.nearApiService.getContract('nft', nftContractId);
    const metadata = await contract.nft_metadata();
    const nfts = await this.getNfts(nftContractId, daoId);
    const tokenDtos = nfts.map((nft) =>
      castNFT(nftContractId, daoId, metadata, nft, timestamp),
    );
    const tokenIds = tokenDtos.map(({ id }) => id);
    await this.nftTokenService.createMultiple(tokenDtos);
    await this.nftTokenService.purge(daoId, nftContractId, tokenIds);
  }

  private async getNfts(
    nftContractId: string,
    daoId: string,
  ): Promise<Array<any>> {
    const contract = this.nearApiService.getContract('nft', nftContractId);
    const chunkSize = 50;
    let nfts = [];
    let chunk = [];
    let fromIndex = 0;

    do {
      try {
        chunk = await contract.nft_tokens_for_owner({
          account_id: daoId,
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
