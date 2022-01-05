import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { NearDatabaseValidationSchema } from './near-db.schema';

export class ApiValidationSchema extends NearDatabaseValidationSchema {
  @IsNumber()
  @IsNotEmpty()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  REDIS_CACHE_URL: string;

  @IsString()
  @IsNotEmpty()
  REDIS_SOCKET_URL: string;

  @IsNumber()
  REDIS_HTTP_CACHE_TTL: number;

  @IsString()
  @IsNotEmpty()
  ADMIN_ACCOUNTS: string;
}
