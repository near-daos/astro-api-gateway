import { IsNotEmpty, IsNumber } from 'class-validator';
import { NearDatabaseValidationSchema } from './near-db.schema';

export class ApiValidationSchema extends NearDatabaseValidationSchema {
  @IsNumber()
  @IsNotEmpty()
  PORT: number;

  @IsNumber()
  REDIS_HTTP_CACHE_TTL: number
}
