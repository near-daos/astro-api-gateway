import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FindOneParams {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
}
