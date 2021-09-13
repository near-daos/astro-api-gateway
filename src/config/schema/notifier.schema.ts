import { IsString } from 'class-validator';
import { DatabaseValidationSchema } from './db.schema';

export class NotifierValidationSchema extends DatabaseValidationSchema {
  @IsString()
  FIREBASE_PROJECT_ID: string;

  @IsString()
  FIREBASE_CLIENT_EMAIL: string;

  @IsString()
  FIREBASE_PRIVATE_KEY: string;
}
