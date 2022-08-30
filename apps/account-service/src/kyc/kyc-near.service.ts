import { Near } from 'near-api-js';

import { Inject, Injectable } from '@nestjs/common';

import { NearConfigService, NEAR_PROVIDER } from '../near';
import { getChunkCount } from '../utils';
import { KYCToken } from './entities/kyc-token.entity';
import { KYCContract } from './contracts';
import { toKYCToken } from './types/nt-nft-token';

@Injectable()
export class KYCNearService {
  constructor(
    private readonly nearConfigService: NearConfigService,

    @Inject(NEAR_PROVIDER)
    private near: Near,
  ) {}

  async *getAllTokens(chunkSize = 50): AsyncGenerator<KYCToken[]> {
    const contract = await this.getContract();

    const tokenSupply = await contract.getTotalSupply();
    const chunkCount = getChunkCount(tokenSupply, chunkSize);

    for (let i = 0; i < chunkCount; i++) {
      const chunk = await contract.getTokens(`${chunkSize * i}`, chunkSize);

      yield chunk.map((token) => toKYCToken(contract.contractId, token));
    }
  }

  private async getContract(): Promise<KYCContract> {
    const kycContract = this.nearConfigService.kycSmartContract;

    const account = await this.near.account(kycContract);
    return new KYCContract(account, kycContract);
  }
}
