import { connect, providers } from 'near-api-js';
import { UnencryptedFileSystemKeyStore } from 'near-api-js/lib/key_stores';

import { NearConfigService } from './near-config.service';
import { NEAR_PROVIDER, NEAR_RPC_PROVIDER } from './constants';

export const nearProvider = {
  provide: NEAR_PROVIDER,
  inject: [NearConfigService],
  useFactory: async (nearConfig: NearConfigService) => {
    return await connect({
      ...nearConfig.connectConfig,
      keyStore: new UnencryptedFileSystemKeyStore(nearConfig.credentialsDir),
    });
  },
};

export const nearRPCProvider = {
  provide: NEAR_RPC_PROVIDER,
  inject: [NearConfigService],
  useFactory: async (nearConfig: NearConfigService) => {
    return new providers.JsonRpcProvider({
      url: nearConfig.connectConfig.providerUrl,
    });
  },
};
