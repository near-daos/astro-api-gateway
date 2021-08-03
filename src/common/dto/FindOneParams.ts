import { IsNotEmpty } from 'class-validator';

export class FindOneParams {
  @IsNotEmpty()
  id: string;
}
