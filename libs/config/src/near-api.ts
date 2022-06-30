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
  contracts: Record<string, NearApiContract>;
  provider: Provider;
  near: Near;
  account: Account;
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
      contracts: {
        sputnikDaoFactory: {
          contractId: contractName,
          viewMethods: [
            'get_dao_list',
            'get_number_daos',
            'get_daos',
            'tx_status',
            'get_contracts_metadata',
          ],
          changeMethods: [],
        },
        sputnikDao: {
          viewMethods: [
            'get_config',
            'get_policy',
            'get_staking_contract',
            'get_available_amount',
            'delegation_total_supply',
            'get_last_proposal_id',
            'get_proposals',
            'get_proposal',
            'get_last_bounty_id',
            'get_bounties',
            'get_bounty',
            'get_bounty_claims',
            'get_bounty_number_of_claims',
          ],
          changeMethods: ['add_proposal', 'act_proposal'],
        },
        fToken: {
          viewMethods: ['ft_balance_of', 'ft_metadata', 'ft_total_supply'],
        },
        nft: {
          viewMethods: ['nft_tokens_for_owner', 'nft_metadata'],
        },
      },
    };
  },
};
