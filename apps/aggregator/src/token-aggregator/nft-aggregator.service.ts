import { Injectable, Logger } from '@nestjs/common';

import { NearApiService } from '@sputnik-v2/near-api';
import { NFTTokenService, NFTTokenUpdateDto } from '@sputnik-v2/token';
import PromisePool from '@supercharge/promise-pool';

import { castNFT } from './types/nft';

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
    const nfts = await contract.nft_tokens_for_owner({
      account_id: daoId,
      from_index: '0',
      limit: 1000,
    });

    await this.nftTokenService.createMultiple(
      nfts.map((nft) => castNFT(nftContractId, metadata, nft, timestamp)),
    );
  }
}
