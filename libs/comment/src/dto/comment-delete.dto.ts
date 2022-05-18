import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CommentDeleteDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;
}
