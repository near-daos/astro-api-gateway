import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class FindOneMongoParams {
  @IsMongoId()
  @IsNotEmpty()
  id: string;
}

export class FindOneMongoDaoParams extends FindOneMongoParams {
  @IsString()
  @IsNotEmpty()
  daoId: string;
}
