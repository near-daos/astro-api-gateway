import { IsNotEmpty, IsString } from 'class-validator';
import { NearDatabaseValidationSchema } from './near-db.schema';

export class IndexerProcessorValidationSchema extends NearDatabaseValidationSchema {
  @IsString()
  @IsNotEmpty()
  REDIS_CONNECTION_STRING: string;
}
