import { IsNotEmpty, IsNumber } from 'class-validator';
import { AggregatorValidationSchema } from './aggregator.schema';

export class ApiValidationSchema extends AggregatorValidationSchema {
  @IsNumber()
  @IsNotEmpty()
  PORT: number;

  @IsNumber()
  REDIS_HTTP_CACHE_TTL: number
}
