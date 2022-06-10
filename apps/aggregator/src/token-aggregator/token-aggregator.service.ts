import { HttpService, Injectable, Logger } from '@nestjs/common';
import PromisePool from '@supercharge/promise-pool';
import { lastValueFrom, map } from 'rxjs';
import { ConfigService } from '@nestjs/config';

import { NearApiService } from '@sputnik-v2/near-api';
import {
  Token,
  TokenService,
  TokenUpdateDto,
  castNearToken,
} from '@sputnik-v2/token';

@Injectable()
export class TokenAggregatorService {
  private readonly logger = new Logger(TokenAggregatorService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly nearApiService: NearApiService,
    private readonly tokenService: TokenService,
    private readonly httpService: HttpService,
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
    await this.tokenService.loadTokenById(tokenId, timestamp);
  }

  public async aggregateTokenBalance(
    tokenId: string,
    accountId: string,
  ): Promise<void> {
    await this.tokenService.loadBalanceById(tokenId, accountId);
  }

  public async aggregateTokenPrices(): Promise<Token[]> {
    const { tokenApiUrl } = this.configService.get('near');
    const tokens = await this.tokenService.find();
    const tokenPrices = tokenApiUrl
      ? await lastValueFrom(
          this.httpService
            .get(`${tokenApiUrl}/last-tvl`)
            .pipe(map((res) => res.data)),
        ).catch((error) => {
          this.logger.error(`Failed to load token prices with error: ${error}`);
          return [];
        })
      : [];
    const updatedTokens = Array.isArray(tokenPrices)
      ? tokenPrices.reduce((updatedTokens, tokenPrice) => {
          const token = tokens.find(
            ({ id }) => tokenPrice?.ftInfo.token_account_id === id,
          );

          if (token) {
            token.price = tokenPrice.price;
            return updatedTokens.concat(token);
          }

          return updatedTokens;
        }, [])
      : [];
    const nearPrice = await lastValueFrom(
      this.httpService
        .get(
          `https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd`,
        )
        .pipe(map((res) => res.data)),
    );

    return this.tokenService.createMultiple([
      castNearToken(nearPrice.near?.usd),
      ...updatedTokens,
    ]);
  }
}
