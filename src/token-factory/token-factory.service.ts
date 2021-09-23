import { Account, Contract } from 'near-api-js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import PromisePool from '@supercharge/promise-pool';
import { NEAR_TOKEN_FACTORY_PROVIDER } from 'src/common/constants';
import { NearTokenFactoryProvider } from 'src/config/near-token-factory';
import { TokenDto } from 'src/tokens/dto/token.dto';
import camelcaseKeys from 'camelcase-keys';
import { NFTTokenDto } from 'src/tokens/dto/nft-token.dto';
import { buildNFTTokenId } from 'src/utils';

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
    let tokens = await (tokenIds
      ? this.getTokensByIds(tokenIds)
      : this.getTokensList());

    return tokens.map((token: TokenDto) =>
      camelcaseKeys(token, { deep: true }),
    );
  }

  public async getNFTs(tokenOwners: any): Promise<NFTTokenDto[]> {
    const { results: nfts, errors } = await PromisePool.withConcurrency(5)
      .for(tokenOwners)
      .process(
        async ({ contractId, accountId }) =>
          await this.getContract(contractId)?.nft_tokens_for_owner({
            account_id: accountId,
            from_index: "0",
            limit: 1000 //TODO: magic number - no way to find out the limit now
          }),
      );

    errors?.map((error) => this.logger.error(error));

    return nfts
      .reduce((acc: TokenDto[], token: TokenDto[]) => acc.concat(token), [])
      .map((token) => {
        const { owner_id, id, token_id, metadata } = token;
        const ownerId =
          owner_id instanceof Object
            ? owner_id?.Account
            : owner_id;
        const tokenId = buildNFTTokenId(ownerId, id || token_id);

        return {
          ...camelcaseKeys(token, { deep: true }),
          id: tokenId,
          ownerId,
          metadata: {
            ...camelcaseKeys(metadata),
            tokenId
          }
        };
      });
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

  private getContract(contractId: string): Contract & any {
    return new Contract(this.account, contractId, {
      viewMethods: ['nft_tokens_for_owner', 'nft_metadata'],
      changeMethods: [],
    });
  }
}
