import { ConfigService } from '@nestjs/config';
import { Account, Contract, Near, providers } from 'near-api-js';
import { Provider } from 'near-api-js/lib/providers';

import { NEAR_PROVIDER, NEAR_SPUTNIK_PROVIDER } from 'src/common/constants';

export type NearSputnikProvider = {
  near: Near;
  account: Account;
  factoryContract: Contract & any;
  provider: Provider;
};

export const nearSputnikProvider = {
  provide: NEAR_SPUTNIK_PROVIDER,
  inject: [ConfigService, NEAR_PROVIDER],
  useFactory: async (configService: ConfigService, near: Near) => {
    const config = configService.get('near');

    const { contractName, providerUrl } = config;

    const account = await near.account(contractName);

    const factoryContract = new Contract(account, contractName, {
      viewMethods: ['get_dao_list', 'tx_status'],
      changeMethods: [],
    });

    const provider = new providers.JsonRpcProvider(providerUrl);

    return { account, factoryContract, near, provider };
  },
};
