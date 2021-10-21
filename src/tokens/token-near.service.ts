import { HttpService, Injectable, Logger } from '@nestjs/common';
import { Token } from './entities/token.entity';
import { NearService } from 'src/near/near.service';
import { SputnikDaoService } from 'src/sputnikdao/sputnik.service';
import { ConfigService } from '@nestjs/config';
import PromisePool from '@supercharge/promise-pool';
import Decimal from 'decimal.js';
import { yoktoNear } from 'src/sputnikdao/constants';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class TokenNearService {
  private readonly logger = new Logger(TokenNearService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly nearService: NearService,
    private readonly sputnikDaoService: SputnikDaoService,
  ) {}

  async tokensByAccount(accountId: string): Promise<Token[]> {
    const { helperUrl } = this.configService.get('near');

    const daoAmount = await this.sputnikDaoService.getAccountAmount(accountId);

    const nearToken = {
      id: '',
      tokenId: '',
      symbol: 'NEAR',
      balance: daoAmount,
      decimals: new Decimal(yoktoNear).toFixed().length - 1,
    } as any;

    let tokenIds = [];
    try {
      tokenIds = await this.nearService.findLikelyTokens(accountId);
    } catch (e) {
      this.logger.error(e);

      // Falling back to Indexer Helper API request
      tokenIds = await lastValueFrom(
        this.httpService
          .get(`${helperUrl}/account/${accountId}/likelyTokens`)
          .pipe(map((res) => res.data)),
      );
    }

    if (!tokenIds?.length) {
      return [ nearToken ];
    }

    const { results: tokens } = await PromisePool.withConcurrency(2)
      .for(tokenIds)
      .process(async (tokenId) => ({
        tokenId,
        ...(await this.sputnikDaoService.getFTMetadata(tokenId)),
      }));

    const { results: enrichedTokens } = await PromisePool.withConcurrency(2)
      .for(tokens)
      .process(async (token) => ({
        ...token,
        balance: await this.sputnikDaoService.getFTBalance(
          token.tokenId,
          accountId,
        ),
      }));

    return [nearToken, ...enrichedTokens];
  }
}
