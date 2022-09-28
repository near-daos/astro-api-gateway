import { HttpService, Injectable, Logger } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { ConfigService } from '@nestjs/config';

import { Token, TokenService, castNearToken } from '@sputnik-v2/token';

@Injectable()
export class TokenAggregatorService {
  private readonly logger = new Logger(TokenAggregatorService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly httpService: HttpService,
  ) {}

  public async aggregateTokenPrices(): Promise<Token[]> {
    const { tokenApiUrl } = this.configService.get('near');
    const tokens = await this.tokenService.getAll();
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
