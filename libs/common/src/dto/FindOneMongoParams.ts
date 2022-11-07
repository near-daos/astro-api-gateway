import { IsNotEmpty, IsString } from 'class-validator';

export class FindOneMongoParams {
  @IsNotEmpty()
  id: string;
}

export class FindOneMongoDaoParams extends FindOneMongoParams {
  @IsString()
  @IsNotEmpty()
  daoId: string;
}
