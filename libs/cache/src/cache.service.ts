import { Cache } from 'cache-manager';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { ProposalDto } from '@sputnik-v2/proposal';

// Cache invalidation is managed separately for the list of API endpoints below
const CACHE_API_WHITELIST = ['/api/v1/proposals', '/api/v1/tokens'];

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async handleProposalCache(proposal: ProposalDto): Promise<any> {
    this.logger.log('Clearing Proposals Cache...');

    const { id } = proposal;

    const keys: string[] = await this.cacheManager.store.keys(
      '/api/v1/proposals*',
    );

    const templateKeys = [];
    const baseKeys = [];
    const accountProposalsKeys = [];
    const proposalIdKeys = [];
    for (const key of keys) {
      // TODO: re-visit template keys - should be cleared depending on the template API
      if (key.startsWith('/api/v1/proposals/templates')) {
        templateKeys.push(key);

        continue;
      }

      if (key.startsWith('/api/v1/proposals?')) {
        baseKeys.push(key);

        continue;
      }

      if (key.startsWith('/api/v1/proposals/account-proposals?')) {
        accountProposalsKeys.push(key);

        continue;
      }

      if (key.startsWith(`/api/v1/proposals/${id}`)) {
        proposalIdKeys.push(key);

        continue;
      }
    }

    const keysToClear = [
      ...templateKeys,
      ...baseKeys,
      ...accountProposalsKeys,
      ...proposalIdKeys,
    ];

    await this.clearKeysChunked(keysToClear);

    this.logger.log(
      `Cleared Proposals Cache. Total Keys: ${keysToClear.length}`,
    );
  }

  async handleTokenCache(): Promise<any> {
    this.logger.log('Clearing FT Cache...');

    const keys: string[] = await this.cacheManager.store.keys(
      '/api/v1/tokens*',
    );

    const keysToClear = keys.filter(
      (key) => !key.startsWith('/api/v1/tokens/nfts'),
    );

    await this.clearKeysChunked(keysToClear);

    this.logger.log(`Cleared FT Cache. Total Keys: ${keysToClear.length}`);
  }

  async handleNFTCache(): Promise<any> {
    this.logger.log('Clearing NFT Cache...');

    const keysToClear: string[] = await this.cacheManager.store.keys(
      '/api/v1/tokens/nfts*',
    );

    await this.clearKeysChunked(keysToClear);

    this.logger.log(`Cleared NFT Cache. Total Keys: ${keysToClear.length}`);
  }

  async clearCache(): Promise<any> {
    this.logger.log('Clearing Cache...');

    const keys: string[] = await this.cacheManager.store.keys();

    const keysToClear = keys.filter(
      (key) => !CACHE_API_WHITELIST.some((path) => key.startsWith(path)),
    );

    await this.clearKeysChunked(keysToClear);

    this.logger.log(`Cleared Cache. Total Keys: ${keysToClear.length}`);
  }

  private async clearKeysChunked(keys: string[], chunkSize: number = 10) {
    for (let i = 0; i < keys.length; i += chunkSize) {
      await this.cacheManager.store.del(keys.slice(i, i + chunkSize));
    }
  }
}
