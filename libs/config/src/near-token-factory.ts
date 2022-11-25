import { ConfigService } from '@nestjs/config';
import { NearTokenFactoryContract } from '@sputnik-v2/near-api/types';
import { Account, Contract, Near } from 'near-api-js';

import { NEAR_PROVIDER, NEAR_TOKEN_FACTORY_PROVIDER } from '@sputnik-v2/common';

export type NearTokenFactoryProvider = {
  near: Near;
  account: Account;
  factoryContract: NearTokenFactoryContract;
};

export const nearTokenFactoryProvider = {
  provide: NEAR_TOKEN_FACTORY_PROVIDER,
  inject: [ConfigService, NEAR_PROVIDER],
  useFactory: async (configService: ConfigService, near: Near) => {
    const config = configService.get('near');

    const { tokenFactoryContractName } = config;

    const account = await near.account(tokenFactoryContractName);

    const factoryContract = new Contract(account, tokenFactoryContractName, {
      viewMethods: [
        'get_required_deposit',
        'get_number_of_tokens',
        'get_tokens',
        'get_token',
      ],
      changeMethods: ['create_token', 'storage_deposit'],
    }) as NearTokenFactoryContract;

    return { account, factoryContract, near };
  },
};
