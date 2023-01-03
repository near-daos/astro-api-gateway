import { ConfigService } from '@nestjs/config';
import { Account, Near, providers } from 'near-api-js';
import { Provider } from 'near-api-js/lib/providers';
import { NEAR_PROVIDER, NEAR_API_PROVIDER } from '@sputnik-v2/common';

export type NearApiContract = {
  contractId?: string;
  viewMethods: string[];
  changeMethods: string[];
};

export type NearApiProvider = {
  provider: Provider;
  near: Near;
  account: Account;
  sputnikDaoFactoryContractName: string;
};

export const nearApiProvider = {
  provide: NEAR_API_PROVIDER,
  inject: [ConfigService, NEAR_PROVIDER],
  useFactory: async (configService: ConfigService, near: Near) => {
    const config = configService.get('near');
    const { contractName, providerUrl, providerHeaders } = config;

    const account = await near.account(contractName);
    const provider = new providers.JsonRpcProvider({
      url: providerUrl,
      headers: providerHeaders,
    });

    return {
      near,
      account,
      provider,
      sputnikDaoFactoryContractName: contractName,
    };
  },
};
