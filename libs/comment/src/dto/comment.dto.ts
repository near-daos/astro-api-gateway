import { AccountBearer } from '@sputnik-v2/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CommentDto extends AccountBearer {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  proposalId: string;

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  @IsNotEmpty()
  message: string;
}
