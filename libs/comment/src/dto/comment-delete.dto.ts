import { AccountBearer } from '@sputnik-v2/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CommentDeleteDto extends AccountBearer {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;
}
