import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

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
  @IsString()
  NODE_ENV: Environment;

  @IsEnum(NearEnvironment)
  @IsNotEmpty()
  NEAR_ENV: NearEnvironment;

  @IsString()
  @IsNotEmpty()
  NEAR_CONTRACT_NAME: string;
  
  @IsString()
  @IsNotEmpty()
  NEAR_TOKEN_FACTORY_CONTRACT_NAME: string;

  @IsString()
  @IsNotEmpty()
  RABBITMQ_URL: string;

  @IsString()
  @IsNotEmpty()
  NEAR_CREDENTIALS_DIR: string;

  @IsString()
  @IsNotEmpty()
  LOG_LEVELS: string;
}
