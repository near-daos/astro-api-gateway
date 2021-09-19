import { IsNotEmpty, IsNumber } from 'class-validator';
import { NearDatabaseValidationSchema } from './near-db.schema';

export class AggregatorValidationSchema extends NearDatabaseValidationSchema {
  @IsNumber()
  @IsNotEmpty()
  AGGREGATOR_POLLING_INTERVAL: number;
}
