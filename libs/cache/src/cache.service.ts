import { Cache } from 'cache-manager';

import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';

import { TransactionAction } from '@sputnik-v2/transaction-handler';
import { ProposalDto } from '@sputnik-v2/proposal';

// List of API endpoints that are cached separately
const CACHE_API_WHITELIST = ['/api/v1/proposals'];

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async clearCacheSelectively(actions: TransactionAction[]): Promise<any> {
    return this.cacheManager.reset();
  }

  async handleProposalCache(
    proposal: ProposalDto,
    action?: TransactionAction,
  ): Promise<any> {
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

    await this.cacheManager.store.del([
      ...templateKeys,
      ...baseKeys,
      ...accountProposalsKeys,
      ...proposalIdKeys,
    ]);
  }

  async handleTokenMint(action: TransactionAction): Promise<any> {
    // TODO
  }

  async handleTokenMethods(action: TransactionAction): Promise<any> {
    // TODO
  }

  async handleTokenUpdate(action: TransactionAction): Promise<any> {
    // TODO: handle FT related cache only
  }

  async handleNftUpdate(action: TransactionAction): Promise<any> {
    // TODO: Clear NFT related cache only
  }

  async clearCache(): Promise<any> {
    const keys: string[] = await this.cacheManager.store.keys();

    // TODO: integrate with CACHE_API_WHITELIST
    const keysToClear = keys.filter(
      (key) => !key.startsWith('/api/v1/proposals'),
    );

    await this.cacheManager.store.del(keysToClear);
  }
}
