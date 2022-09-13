import { registerAs } from '@nestjs/config';

export type NEAR_ENV =
  | 'production'
  | 'development'
  | 'local'
  | 'test'
  | 'mainnet'
  | 'betanet'
  | 'testnet'
  | 'ci'
  | 'ci-betanet';

export type NEAR_CONFIG = {
  env: NEAR_ENV;
  contractName: string;
  tokenFactoryContractName: string;
  bridgeTokenFactoryContractName: string;
  nftWhitelistContracts: string[];
  tokenApiUrl: string;
  pagodaRpcApiKey: string;
  rpcApiProviderUrl?: string;
};

export type NearConfig = {
  walletFormat?: string;
  networkId: string;
  nodeUrl: string;
  contractName: string;
  tokenFactoryContractName: string;
  bridgeTokenFactoryContractName: string;
  nftWhitelistContracts: string[];
  nftFactoryContracts: string[];
  tokenApiUrl: string;
  masterAccount?: string;
  walletUrl?: string;
  helperUrl?: string;
  explorerUrl?: string;
  providerUrl?: string;
  providerHeaders?: Record<string, string>;
  keyPath?: string;
};

export const getNearConfig = (nearConfig: NEAR_CONFIG): NearConfig => {
  const {
    env,
    contractName,
    tokenFactoryContractName,
    bridgeTokenFactoryContractName,
    nftWhitelistContracts,
    tokenApiUrl,
    pagodaRpcApiKey,
    rpcApiProviderUrl,
  } = nearConfig;

  switch (env) {
    case 'production':
    case 'mainnet':
      return {
        walletFormat: '.near',
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        contractName,
        tokenFactoryContractName,
        bridgeTokenFactoryContractName,
        nftWhitelistContracts,
        nftFactoryContracts: ['mintbase1.near'],
        tokenApiUrl,
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
        explorerUrl: 'https://explorer.mainnet.near.org',
        providerUrl:
          rpcApiProviderUrl || 'https://archival-rpc.mainnet.near.org',
      };
    case 'development':
    case 'testnet':
      return {
        walletFormat: '.testnet',
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        contractName,
        tokenFactoryContractName,
        bridgeTokenFactoryContractName,
        nftWhitelistContracts,
        nftFactoryContracts: ['mintspace2.testnet'],
        tokenApiUrl,
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org',
        providerUrl: rpcApiProviderUrl || 'https://rpc.testnet.pagoda.co',
        providerHeaders: { 'x-api-key': pagodaRpcApiKey },
      };
    case 'betanet':
      return {
        walletFormat: '.betanet',
        networkId: 'betanet',
        nodeUrl: 'https://rpc.betanet.near.org',
        contractName,
        tokenFactoryContractName,
        bridgeTokenFactoryContractName,
        nftWhitelistContracts,
        nftFactoryContracts: [],
        tokenApiUrl,
        walletUrl: 'https://wallet.betanet.near.org',
        helperUrl: 'https://helper.betanet.near.org',
        explorerUrl: 'https://explorer.betanet.near.org',
        providerUrl:
          rpcApiProviderUrl || 'https://archival-rpc.betanet.near.org',
      };
    case 'local':
      return {
        networkId: 'local',
        nodeUrl: 'http://localhost:3030',
        keyPath: `${process.env.HOME}/.near/validator_key.json`,
        walletUrl: 'http://localhost:4000/wallet',
        contractName,
        tokenFactoryContractName,
        bridgeTokenFactoryContractName,
        nftWhitelistContracts,
        nftFactoryContracts: [],
        tokenApiUrl,
      };
    case 'test':
    case 'ci':
      return {
        networkId: 'shared-test',
        nodeUrl: 'https://rpc.ci-testnet.near.org',
        contractName,
        tokenFactoryContractName,
        bridgeTokenFactoryContractName,
        nftWhitelistContracts,
        nftFactoryContracts: [],
        tokenApiUrl,
        masterAccount: 'test.near',
      };
    case 'ci-betanet':
      return {
        networkId: 'shared-test-staging',
        nodeUrl: 'https://rpc.ci-betanet.near.org',
        contractName,
        tokenFactoryContractName,
        bridgeTokenFactoryContractName,
        nftWhitelistContracts,
        nftFactoryContracts: [],
        tokenApiUrl,
        masterAccount: 'test.near',
      };
    default:
      throw Error(
        `Unconfigured environment '${env}'. Can be configured in src/config.ts.`,
      );
  }
};

export default registerAs('near', () =>
  getNearConfig({
    env: (process.env.NEAR_ENV as NEAR_ENV) || 'development',
    contractName: process.env.NEAR_CONTRACT_NAME,
    tokenFactoryContractName: process.env.NEAR_TOKEN_FACTORY_CONTRACT_NAME,
    bridgeTokenFactoryContractName:
      process.env.NEAR_BRIDGE_TOKEN_FACTORY_CONTRACT_NAME,
    pollingInterval: process.env.AGGREGATOR_POLLING_INTERVAL,
    daoPollingInterval: process.env.DAO_POLLING_INTERVAL,
    nftWhitelistContracts:
      process.env.NEAR_NFT_WHITELIST_CONTRACTS?.split(',') || [],
    tokenApiUrl: process.env.NEAR_TOKEN_API_URL,
    pagodaRpcApiKey: process.env.PAGODA_RPC_API_KEY,
    rpcApiProviderUrl: process.env.RPC_API_PROVIDER_URL,
  } as NEAR_CONFIG),
);
