import { Injectable, Logger } from '@nestjs/common';
import PromisePool from '@supercharge/promise-pool';

import { NearApiService } from '@sputnik-v2/near-api';
import { TokenService, TokenUpdateDto } from '@sputnik-v2/token';

import { castToken } from './types/token';
import { castTokenBalance } from './types/token-balance';

@Injectable()
export class TokenAggregatorService {
  private readonly logger = new Logger(TokenAggregatorService.name);

  constructor(
    private readonly nearApiService: NearApiService,
    private readonly tokenService: TokenService,
  ) {}

  public async aggregateDaoTokenUpdates(
    tokenUpdates: TokenUpdateDto[],
  ): Promise<void> {
    const tokenIds = [...new Set(tokenUpdates.map(({ token }) => token))];

    const { errors: tokenErrors } = await PromisePool.withConcurrency(5)
      .for(tokenIds)
      .process(async (tokenId) => {
        const timestamp = tokenUpdates.find(
          ({ token }) => token === tokenId,
        )?.timestamp;
        return this.aggregateToken(tokenId, timestamp);
      });

    tokenErrors.forEach((error) => {
      this.logger.error(
        `Failed to token aggregation ${error.item} with error: ${error}`,
      );
    });

    const { errors: balanceErrors } = await PromisePool.withConcurrency(5)
      .for(tokenUpdates)
      .process(async ({ token, account }) =>
        this.aggregateTokenBalance(token, account),
      );

    balanceErrors.forEach((error) => {
      this.logger.error(
        `Failed to token balance aggregation ${error.item.token} with error: ${error}`,
      );
    });
  }

  public async aggregateDaoTokens(
    daoId: string,
    tokenIds: string[],
    timestamp?: number,
  ): Promise<void> {
    const { errors: tokenErrors } = await PromisePool.withConcurrency(5)
      .for(tokenIds)
      .process(async (tokenId) => this.aggregateToken(tokenId, timestamp));

    tokenErrors.forEach((error) => {
      this.logger.error(
        `Failed to token aggregation ${error.item} with error: ${error}`,
      );
    });

    const { errors: balanceErrors } = await PromisePool.withConcurrency(5)
      .for(tokenIds)
      .process(async (tokenId) => this.aggregateTokenBalance(tokenId, daoId));

    balanceErrors.forEach((error) => {
      this.logger.error(
        `Failed to token balance aggregation ${error.item} with error: ${error}`,
      );
    });
  }

  public async aggregateToken(
    tokenId: string,
    timestamp?: number,
  ): Promise<void> {
    const contract = this.nearApiService.getContract('fToken', tokenId);
    const metadata = await contract.ft_metadata();
    const totalSupply = await contract.ft_total_supply();
    await this.tokenService.create(
      castToken(tokenId, metadata, totalSupply, timestamp),
    );
  }

  public async aggregateTokenBalance(
    tokenId: string,
    accountId: string,
  ): Promise<void> {
    const contract = this.nearApiService.getContract('fToken', tokenId);
    const balance = await contract.ft_balance_of({ account_id: accountId });
    await this.tokenService.createBalance(
      castTokenBalance(tokenId, accountId, balance),
    );
  }
}
