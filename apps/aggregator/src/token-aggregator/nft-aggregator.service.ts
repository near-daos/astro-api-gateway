import { Injectable, Logger } from '@nestjs/common';
import { DaoService } from '@sputnik-v2/dao';

import { NFTTokenService, NFTTokenUpdateDto } from '@sputnik-v2/token';
import PromisePool from '@supercharge/promise-pool';

@Injectable()
export class NFTAggregatorService {
  private readonly logger = new Logger(NFTAggregatorService.name);

  constructor(
    private readonly daoService: DaoService,
    private readonly nftTokenService: NFTTokenService,
  ) {}

  public async aggregateDaoNFTUpdates(
    tokenUpdates: NFTTokenUpdateDto[],
  ): Promise<void> {
    const { errors } = await PromisePool.withConcurrency(5)
      .for(tokenUpdates)
      .process(async ({ nft, account, timestamp }) =>
        this.nftTokenService.loadNFT(nft, account, timestamp),
      );

    const daoIds = [...new Set(tokenUpdates.map(({ account }) => account))];

    await PromisePool.withConcurrency(5)
      .for(daoIds)
      .process(async (id) =>
        this.daoService.save({ id }, { updateNftsCount: true }),
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
    timestamp?: string,
  ): Promise<void> {
    const { errors } = await PromisePool.withConcurrency(5)
      .for(nftIds)
      .process(async (nftId) =>
        this.nftTokenService.loadNFT(nftId, daoId, timestamp),
      );

    await this.daoService.save({ id: daoId }, { updateNftsCount: true });

    errors.forEach((error) => {
      this.logger.error(
        `Failed NFT aggregation ${error.item} with error: ${error}`,
      );
    });
  }
}
