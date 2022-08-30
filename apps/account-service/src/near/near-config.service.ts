import path from 'path';
import os from 'os';
import { ConnectConfig } from 'near-api-js';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type NearConfig = ConnectConfig & {
  explorerUrl: string;
  providerUrl: string;
};

@Injectable()
export class NearConfigService {
  constructor(private readonly configService: ConfigService) {}

  get env(): string {
    const { env } = this.configService.get('near');
    return env;
  }

  get connectConfig(): NearConfig {
    const env = this.env;

    switch (env) {
      case 'production':
      case 'mainnet':
        return {
          headers: {},
          networkId: 'mainnet',
          nodeUrl: 'https://rpc.mainnet.near.org',
          walletUrl: 'https://app.mynearwallet.com',
          helperUrl: 'https://api.kitwallet.app',
          explorerUrl: 'https://explorer.mainnet.near.org',
          providerUrl: 'https://archival-rpc.mainnet.near.org',
        };
      case 'development':
      case 'testnet':
        return {
          headers: {},
          networkId: 'testnet',
          nodeUrl: 'https://rpc.testnet.near.org',
          walletUrl: 'https://testnet.mynearwallet.com',
          helperUrl: 'https://testnet-api.kitwallet.app',
          explorerUrl: 'https://explorer.testnet.near.org',
          providerUrl: 'https://archival-rpc.testnet.near.org',
        };
      default:
        throw Error(`Invalid NEAR environment: ${env}.`);
    }
  }

  get credentialsDir(): string {
    const { credentials } = this.configService.get('near');

    return path.join(os.homedir(), credentials);
  }

  get kycSmartContract(): string {
    const { kycContractName } = this.configService.get('near');

    return kycContractName;
  }
}
