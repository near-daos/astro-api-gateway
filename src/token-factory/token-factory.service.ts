import { Contract } from 'near-api-js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import PromisePool from '@supercharge/promise-pool';
import { NEAR_TOKEN_FACTORY_PROVIDER } from 'src/common/constants';
import { NearTokenFactoryProvider } from 'src/config/near-token-factory';
import { TokenDto } from 'src/tokens/dto/token.dto';
import camelcaseKeys from 'camelcase-keys';

@Injectable()
export class TokenFactoryService {
  private readonly logger = new Logger(TokenFactoryService.name);

  private factoryContract!: Contract & any;

  constructor(
    @Inject(NEAR_TOKEN_FACTORY_PROVIDER)
    private nearTokenFactoryProvider: NearTokenFactoryProvider,
  ) {
    const { factoryContract } = nearTokenFactoryProvider;

    this.factoryContract = factoryContract;
  }

  public async getTokens(): Promise<TokenDto[]> {
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

      return tokens
        .reduce((acc: TokenDto[], prop: TokenDto[]) => acc.concat(prop), [])
        .map((token: TokenDto) => camelcaseKeys(token, { deep: true }));
    } catch (error) {
      this.logger.error(error);

      return Promise.reject(error);
    }
  }
}
