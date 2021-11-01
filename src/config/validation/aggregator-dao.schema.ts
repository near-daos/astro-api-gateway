import { IsNotEmpty, IsNumber } from 'class-validator';
import { NearDatabaseValidationSchema } from './near-db.schema';

export class AggregatorDaoValidationSchema extends NearDatabaseValidationSchema {
  @IsNumber()
  @IsNotEmpty()
  DAO_POLLING_INTERVAL: number;
}
