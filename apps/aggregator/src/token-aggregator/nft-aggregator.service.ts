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
    await PromisePool.withConcurrency(5)
      .for(tokenUpdates)
      .handleError((err, dto) => {
        this.logger.error(
          `Failed loading NFT for ${JSON.stringify(dto)}: ${err} (${
            err.stack
          })`,
        );
      })
      .process(async ({ nft, account, timestamp }) =>
        this.nftTokenService.loadNFT(nft, account, timestamp),
      );

    const daoIds = [...new Set(tokenUpdates.map(({ account }) => account))];

    await PromisePool.withConcurrency(5)
      .for(daoIds)
      .handleError((err, daoId) => {
        this.logger.error(
          `Failed update NFT count for ${daoId}: ${err} (${err.stack})`,
        );
      })
      .process(async (id) =>
        this.daoService.save({ id }, { updateNftsCount: true }),
      );
  }

  public async aggregateDaoNFTs(
    daoId: string,
    nftIds: string[],
    timestamp?: string,
  ): Promise<void> {
    await PromisePool.withConcurrency(5)
      .for(nftIds)
      .handleError((err, nftId) => {
        this.logger.error(
          `Failed loading NFT for ${nftId}, ${daoId}, ${timestamp}: ${err} (${err.stack})`,
        );
      })
      .process(async (nftId) =>
        this.nftTokenService.loadNFT(nftId, daoId, timestamp),
      );

    await this.daoService.save({ id: daoId }, { updateNftsCount: true });
  }
}
