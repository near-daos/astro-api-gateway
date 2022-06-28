import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BaseValidationSchema } from './base.schema';

export class DraftValidationSchema extends BaseValidationSchema {
  @IsNumber()
  @IsNotEmpty()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  REDIS_CACHE_URL: string;

  @IsString()
  @IsNotEmpty()
  REDIS_SOCKET_URL: string;

  @IsNumber()
  REDIS_HTTP_CACHE_TTL: number;

  @IsString()
  @IsNotEmpty()
  DRAFT_DATABASE_HOST: string;

  @IsNumber()
  @IsNotEmpty()
  DRAFT_DATABASE_PORT: number;

  @IsString()
  @IsNotEmpty()
  DRAFT_DATABASE_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  DRAFT_DATABASE_PASSWORD: string;
}
