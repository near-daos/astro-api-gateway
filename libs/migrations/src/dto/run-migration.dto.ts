import { ApiProperty } from '@nestjs/swagger';
import { DynamoDataOptionsDto } from './dynamo-data-options.dto';

export class RunMigrationDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  options?: DynamoDataOptionsDto;
}
