import { HttpService, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PromisePool from '@supercharge/promise-pool';
import { lastValueFrom, map } from 'rxjs';
import { TokenFactoryService, NFTTokenDto } from '@sputnik-v2/token';
import { NearIndexerService } from '@sputnik-v2/near-indexer';
import { SputnikDaoService } from '@sputnik-v2/sputnikdao';

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
