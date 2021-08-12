import { ConfigService } from "@nestjs/config";
import { Account, connect, Contract, Near } from "near-api-js";
import { InMemoryKeyStore } from "near-api-js/lib/key_stores";
import { NEAR_PROVIDER } from "src/common/constants";

export type NearProvider = {
  near: Near,
  account: Account,
  factoryContract: Contract & any
}

export const nearProvider = {
  provide: NEAR_PROVIDER,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const config = configService.get('near');

    const { contractName } = config;

    const near = await connect({
      deps: { keyStore: new InMemoryKeyStore() },
      ...config,
    });

    const account = await near.account(contractName);

    const factoryContract = new Contract(account, contractName, {
      viewMethods: ['get_dao_list'],
      changeMethods: ['create'],
    });

    return { near, account, factoryContract };
  }
};
