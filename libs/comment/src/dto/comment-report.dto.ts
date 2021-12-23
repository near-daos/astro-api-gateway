import { AccountBearer } from '@sputnik-v2/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CommentReportDto extends AccountBearer {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  commentId: number;

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  @IsNotEmpty()
  reason: string;
}
