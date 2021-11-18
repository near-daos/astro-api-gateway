import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { DatabaseValidationSchema } from './db.schema';

export class NearDatabaseValidationSchema extends DatabaseValidationSchema {
  @IsString()
  @IsNotEmpty()
  NEAR_INDEXER_DATABASE_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  NEAR_INDEXER_DATABASE_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  NEAR_INDEXER_DATABASE_NAME: string;

  @IsString()
  @IsNotEmpty()
  NEAR_INDEXER_DATABASE_HOST: string;

  @IsNumber()
  @IsNotEmpty()
  NEAR_INDEXER_DATABASE_PORT: number;
}
