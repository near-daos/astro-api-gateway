import { Account, Contract } from 'near-api-js';
import {
  NearFTokenContract,
  NearNfTokenContract,
  NearTokenFactoryContract,
} from '@sputnik-v2/near-api';
import camelcaseKeys from 'camelcase-keys';
import { Inject, Injectable, Logger } from '@nestjs/common';
import PromisePool from '@supercharge/promise-pool';
import { NEAR_TOKEN_FACTORY_PROVIDER } from '@sputnik-v2/common';
import { NearTokenFactoryProvider } from '@sputnik-v2/config/near-token-factory';
import { buildNFTTokenId } from '@sputnik-v2/utils';

import { TokenMetadataDto, NFTTokenDto } from './dto';

@Injectable()
export class TokenFactoryService {
  private readonly logger = new Logger(TokenFactoryService.name);

  private factoryContract!: NearTokenFactoryContract;

  private account!: Account;

  constructor(
    @Inject(NEAR_TOKEN_FACTORY_PROVIDER)
    private nearTokenFactoryProvider: NearTokenFactoryProvider,
  ) {
    const { factoryContract, account } = nearTokenFactoryProvider;

    this.factoryContract = factoryContract;
    this.account = account;
  }

  public async getNFTs(tokenOwners: any): Promise<NFTTokenDto[]> {
    const { results: nfts, errors } = await PromisePool.withConcurrency(5)
      .for(tokenOwners)
      .process(
        async ({ contractId, accountId }) =>
          await this.getNFTTokensForOwner(contractId, accountId),
      );

    errors?.map((error) => this.logger.error(error));

    return nfts
      .reduce(
        (acc: NFTTokenDto[], token: NFTTokenDto[]) => acc.concat(token),
        [],
      )
      .map((token) => {
        const { ownerId: tokenOwnerId, id, tokenId, metadata } = token;
        const ownerId =
          tokenOwnerId instanceof Object ? tokenOwnerId?.Account : tokenOwnerId;

        return {
          ...token,
          id: buildNFTTokenId(ownerId, id || tokenId),
          ownerId,
          metadata: {
            ...metadata,
            tokenId,
          },
        };
      });
  }

  public async getFTBalance(
    contractName: string,
    accountId: string,
  ): Promise<string> {
    const contract = this.getFTContract(contractName);

    return await contract.ft_balance_of({ account_id: accountId });
  }

  public async getFTMetadata(tokenId: string): Promise<TokenMetadataDto> {
    const contract = this.getFTContract(tokenId);

    const metadata = await contract.ft_metadata();

    return camelcaseKeys(metadata, { deep: true });
  }

  public async getNFTMetadata(tokenId: string): Promise<TokenMetadataDto> {
    const contract = this.getNFTContract(tokenId);

    const metadata = await contract.nft_metadata();

    return camelcaseKeys(metadata, { deep: true });
  }

  public async getNFTTokensForOwner(
    tokenId: string,
    accountId: string,
  ): Promise<NFTTokenDto[] | any[]> {
    const contract = this.getNFTContract(tokenId);

    const nfts = await contract.nft_tokens_for_owner({
      account_id: accountId,
      from_index: '0',
      limit: 1000,
    });

    return nfts.map((nft: Record<string, unknown>) =>
      camelcaseKeys(nft, { deep: true }),
    );
  }

  private getFTContract(contractId: string): NearFTokenContract {
    return new Contract(this.account, contractId, {
      viewMethods: ['ft_balance_of', 'ft_metadata'],
      changeMethods: [],
    }) as NearFTokenContract;
  }

  private getNFTContract(contractId: string): NearNfTokenContract {
    return new Contract(this.account, contractId, {
      viewMethods: ['nft_tokens_for_owner', 'nft_metadata'],
      changeMethods: [],
    }) as NearNfTokenContract;
  }
}
