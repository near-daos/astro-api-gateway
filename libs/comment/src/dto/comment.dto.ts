import { AccountBearer } from '@sputnik-v2/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CommentContextType } from '@sputnik-v2/comment';

export class CommentDto extends AccountBearer {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contextId: string;

  @ApiProperty()
  @IsEnum(CommentContextType)
  @IsNotEmpty()
  contextType: CommentContextType;

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  @IsNotEmpty()
  message: string;
}
