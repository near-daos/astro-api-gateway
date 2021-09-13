import { IsNumber, IsString } from 'class-validator';
import { DatabaseValidationSchema } from './db.schema';

export class AggregatorValidationSchema extends DatabaseValidationSchema {
  @IsString()
  NEAR_INDEXER_DATABASE_USERNAME: string;

  @IsString()
  NEAR_INDEXER_DATABASE_PASSWORD: string;

  @IsString()
  NEAR_INDEXER_DATABASE_NAME: string;

  @IsString()
  NEAR_INDEXER_DATABASE_HOST: string;

  @IsNumber()
  NEAR_INDEXER_DATABASE_PORT: number;
}
