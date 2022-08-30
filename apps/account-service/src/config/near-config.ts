import { registerAs } from '@nestjs/config';

export type NEAR_ENV = 'mainnet' | 'production' | 'testnet' | 'development';

export default registerAs('near', () => ({
  env: (process.env.NEAR_ENV as NEAR_ENV) || 'testnet',
  kycContractName: process.env.NEAR_KYC_CONTRACT_NAME,
  pagodaRpcApiKey: process.env.PAGODA_RPC_API_KEY,
  credentials: process.env.NEAR_CREDENTIALS_DIR || '.near-credentials',
}));
