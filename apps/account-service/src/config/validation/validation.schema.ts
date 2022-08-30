import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BaseValidationSchema } from './base.schema';

export class AccountServiceValidationSchema extends BaseValidationSchema {
  @IsNumber()
  @IsNotEmpty()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  REDIS_CACHE_URL: string;

  @IsNumber()
  REDIS_HTTP_CACHE_TTL: number;

  @IsString()
  @IsNotEmpty()
  ACCOUNT_SERVICE_DATABASE_HOST: string;

  @IsNumber()
  @IsNotEmpty()
  ACCOUNT_SERVICE_DATABASE_PORT: number;

  @IsString()
  @IsNotEmpty()
  ACCOUNT_SERVICE_DATABASE_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  ACCOUNT_SERVICE_DATABASE_PASSWORD: string;
}
