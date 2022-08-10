import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { NearDatabaseValidationSchema } from './near-db.schema';

export class IndexerProcessorValidationSchema extends NearDatabaseValidationSchema {
  @IsString()
  @IsNotEmpty()
  INDEXER_REDIS_HOST: string;

  @IsNumber()
  @IsNotEmpty()
  INDEXER_REDIS_PORT: number;

  @IsNumber()
  @IsNotEmpty()
  INDEXER_REDIS_DATABASE: number;
}
