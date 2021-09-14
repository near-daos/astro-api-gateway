import { IsNumber, IsString } from 'class-validator';
import { BaseValidationSchema } from './base.schema';

export class DatabaseValidationSchema extends BaseValidationSchema {
  @IsString()
  DATABASE_USERNAME: string;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsString()
  DATABASE_NAME: string;

  @IsString()
  DATABASE_HOST: string;

  @IsNumber()
  DATABASE_PORT: number;
}
