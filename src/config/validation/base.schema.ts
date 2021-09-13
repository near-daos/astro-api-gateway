import { IsEnum, IsString } from 'class-validator';

enum Environment {
  development = 'development',
  production = 'production',
  test = 'test',
}

enum NearEnvironment {
  development = 'development',
  production = 'production',
  test = 'test',
  local = 'local',
  mainnet = 'mainnet',
  betanet = 'betanet',
  testnet = 'testnet',
}

export class BaseValidationSchema {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsEnum(NearEnvironment)
  NEAR_ENV: NearEnvironment;

  @IsString()
  RABBITMQ_URL: string;

  @IsString()
  NEAR_CREDENTIALS_DIR: string;
}
