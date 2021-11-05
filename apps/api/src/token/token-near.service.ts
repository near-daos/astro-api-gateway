import { HttpService, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PromisePool from '@supercharge/promise-pool';
import Decimal from 'decimal.js';
import { lastValueFrom, map } from 'rxjs';
import { Token, TokenFactoryService, NFTTokenDto } from '@sputnik-v2/token';
import { NearIndexerService } from '@sputnik-v2/near-indexer';
import { SputnikDaoService, yoktoNear } from '@sputnik-v2/sputnikdao';

@Injectable()
export class TokenNearService {
  private readonly logger = new Logger(TokenNearService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly nearIndexerService: NearIndexerService,
    private readonly sputnikDaoService: SputnikDaoService,
    private readonly tokenFactoryService: TokenFactoryService,
  ) {}

  async tokensByAccount(accountId: string): Promise<Token[]> {
    const { helperUrl } = this.configService.get('near');

    const daoAmount = await this.sputnikDaoService.getAccountAmount(accountId);

    const nearToken = {
      tokenId: '',
      symbol: 'NEAR',
      balance: daoAmount,
      decimals: new Decimal(yoktoNear).toFixed().length - 1,
    } as any;

    let tokenIds = [];
    try {
      tokenIds = await this.nearIndexerService.findLikelyTokens(accountId);
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
      return [nearToken];
    }

    const { results: tokens } = await PromisePool.withConcurrency(2)
      .for(tokenIds)
      .process(async (tokenId) => ({
        tokenId,
        ...(await this.tokenFactoryService.getFTMetadata(tokenId)),
      }));

    const { results: enrichedTokens } = await PromisePool.withConcurrency(2)
      .for(tokens)
      .process(async (token) => ({
        ...token,
        balance: await this.tokenFactoryService.getFTBalance(
          token.tokenId,
          accountId,
        ),
      }));

    return [nearToken, ...enrichedTokens];
  }

  async nftsByAccount(accountId: string): Promise<NFTTokenDto[] | any[]> {
    const { helperUrl } = this.configService.get('near');

    let tokenIds = [];
    try {
      tokenIds = await this.nearIndexerService.findLikelyNFTs(accountId);
    } catch (e) {
      this.logger.error(e);

      // Falling back to Indexer Helper API request
      tokenIds = await lastValueFrom(
        this.httpService
          .get(`${helperUrl}/account/${accountId}/likelyNFTs`)
          .pipe(map((res) => res.data)),
      );
    }

    if (!tokenIds?.length) {
      return [];
    }

    const { results: tokens } = await PromisePool.withConcurrency(2)
      .for(tokenIds)
      .process(async (tokenId) => ({
        id: tokenId,
        ...(await this.tokenFactoryService.getNFTMetadata(tokenId)),
      }));

    const { results: nfts } = await PromisePool.withConcurrency(2)
      .for(tokens)
      .process(async (token) => {
        const nfts: NFTTokenDto[] =
          await this.tokenFactoryService.getNFTTokensForOwner(
            token.id,
            accountId,
          );

        return nfts.map((nft: NFTTokenDto) => ({
          ...token,
          ...nft,
        }));
      });

    return nfts.flat();
  }
}
