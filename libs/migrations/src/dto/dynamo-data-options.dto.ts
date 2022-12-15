import { ApiProperty } from '@nestjs/swagger';
import { DynamoEntityType } from '@sputnik-v2/dynamodb/types';

export class DynamoDataOptionsDto {
  @ApiProperty()
  entityTypes?: DynamoEntityType[];
}
