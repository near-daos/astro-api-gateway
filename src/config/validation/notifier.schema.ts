import { IsNotEmpty, IsString } from 'class-validator';
import { DatabaseValidationSchema } from './db.schema';

export class NotifierValidationSchema extends DatabaseValidationSchema {
  @IsString()
  @IsNotEmpty()
  FIREBASE_PROJECT_ID: string;

  @IsString()
  @IsNotEmpty()
  FIREBASE_CLIENT_EMAIL: string;

  @IsString()
  @IsNotEmpty()
  FIREBASE_PRIVATE_KEY: string;
}
