import { Account, Contract } from 'near-api-js';
import camelcaseKeys from 'camelcase-keys';
import { Inject, Injectable, Logger } from '@nestjs/common';
import PromisePool from '@supercharge/promise-pool';
import { NEAR_TOKEN_FACTORY_PROVIDER } from '@sputnik-v2/common';
import { NearTokenFactoryProvider } from '@sputnik-v2/config/near-token-factory';
import { buildNFTTokenId } from '@sputnik-v2/utils';

import { TokenDto, TokenMetadataDto, NFTTokenDto } from './dto';

@Injectable()
export class TokenFactoryService {
  private readonly logger = new Logger(TokenFactoryService.name);

  private factoryContract!: Contract & any;

  private account!: Account;

  constructor(
    @Inject(NEAR_TOKEN_FACTORY_PROVIDER)
    private nearTokenFactoryProvider: NearTokenFactoryProvider,
  ) {
    const { factoryContract, account } = nearTokenFactoryProvider;

    this.factoryContract = factoryContract;
    this.account = account;
  }

  public async getTokens(tokenIds: string[]): Promise<TokenDto[]> {
    const tokens = await (tokenIds
      ? this.getTokensByIds(tokenIds)
      : this.getTokensList());

    return tokens.map((token: TokenDto) =>
      camelcaseKeys(token, { deep: true }),
    );
  }

  public async getToken(tokenId: string): Promise<TokenDto> {
    const token = await this.factoryContract.get_token({
      token_id: tokenId.toLowerCase(),
    });

    return { ...camelcaseKeys(token, { deep: true }) };
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
        let { ownerId, id, tokenId, metadata } = token;
        ownerId = ownerId instanceof Object ? ownerId?.Account : ownerId;

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
      limit: 1000, //TODO: magic number - no way to find out the limit now
    });

    return nfts.map((nft: object) => camelcaseKeys(nft, { deep: true }));
  }

  private async getTokensList(): Promise<TokenDto[]> {
    try {
      const numTokens = await this.factoryContract.get_number_of_tokens();

      const chunkSize = 50;
      const chunkCount = (numTokens - (numTokens % chunkSize)) / chunkSize + 1;
      const { results: tokens, errors } = await PromisePool.withConcurrency(1)
        .for([...Array(chunkCount).keys()])
        .process(
          async (offset) =>
            await this.factoryContract.get_tokens({
              from_index: offset * chunkSize,
              limit: chunkSize,
            }),
        );

      errors?.map((error) => this.logger.error(error));

      return tokens.reduce(
        (acc: TokenDto[], prop: TokenDto[]) => acc.concat(prop),
        [],
      );
    } catch (error) {
      this.logger.error(error);

      return Promise.reject(error);
    }
  }

  private async getTokensByIds(tokenIds: string[]): Promise<TokenDto[]> {
    try {
      const { results: tokens, errors } = await PromisePool.withConcurrency(5)
        .for(tokenIds)
        .process(
          async (tokenId) =>
            await this.factoryContract.get_token({
              token_id: tokenId.toLowerCase(),
            }),
        );

      errors?.map((error) => this.logger.error(error));

      return tokens.reduce(
        (acc: TokenDto[], prop: TokenDto[]) => acc.concat(prop),
        [],
      );
    } catch (error) {
      this.logger.error(error);

      return Promise.reject(error);
    }
  }

  private getFTContract(contractId: string): Contract & any {
    return new Contract(this.account, contractId, {
      viewMethods: ['ft_balance_of', 'ft_metadata'],
      changeMethods: [],
    });
  }

  private getNFTContract(contractId: string): Contract & any {
    return new Contract(this.account, contractId, {
      viewMethods: ['nft_tokens_for_owner', 'nft_metadata'],
      changeMethods: [],
    });
  }
}
