import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BaseValidationSchema } from './base.schema';

export class DatabaseValidationSchema extends BaseValidationSchema {
  @IsString()
  @IsNotEmpty()
  DATABASE_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_NAME: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_HOST: string;

  @IsNumber()
  @IsNotEmpty()
  DATABASE_PORT: number;
}
