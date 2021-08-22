import { ConfigService } from '@nestjs/config';
import { Account, Contract, Near } from 'near-api-js';

import { NEAR_PROVIDER, NEAR_SPUTNIK_PROVIDER } from 'src/common/constants';

export type NearSputnikProvider = {
  near: Near;
  account: Account;
  factoryContract: Contract & any;
};

export const nearSputnikProvider = {
  provide: NEAR_SPUTNIK_PROVIDER,
  inject: [ConfigService, NEAR_PROVIDER],
  useFactory: async (configService: ConfigService, near: Near) => {
    const config = configService.get('near');

    const { contractName } = config;

    const account = await near.account(contractName);

    const factoryContract = new Contract(account, contractName, {
      viewMethods: ['get_dao_list'],
      changeMethods: ['create'],
    });

    return { account, factoryContract, near };
  },
};
