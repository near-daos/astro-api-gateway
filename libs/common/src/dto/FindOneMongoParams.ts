import { IsMongoId, IsNotEmpty } from 'class-validator';

export class FindOneMongoParams {
  @IsMongoId()
  @IsNotEmpty()
  id: string;
}
