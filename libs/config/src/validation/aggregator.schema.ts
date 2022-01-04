import { IsNotEmpty, IsNumber } from 'class-validator';
import { NearDatabaseValidationSchema } from './near-db.schema';

export class AggregatorValidationSchema extends NearDatabaseValidationSchema {
  @IsNumber()
  @IsNotEmpty()
  AGGREGATOR_POLLING_INTERVAL: number;

  @IsNumber()
  @IsNotEmpty()
  AGGREGATOR_TOKEN_POLLING_INTERVAL: number;

  @IsNumber()
  @IsNotEmpty()
  AGGREGATOR_TOKEN_PRICES_POLLING_INTERVAL: number;

  @IsNumber()
  @IsNotEmpty()
  AGGREGATOR_DAO_STATUS_POLLING_INTERVAL: number;
}
