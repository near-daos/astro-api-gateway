import { IsUUID } from 'class-validator';

export class FindOneParams {
  @IsUUID()
  id: string;
}
