import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDraftComment {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  message: string;
}
