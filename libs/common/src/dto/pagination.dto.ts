import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationDto {
  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  offset: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  limit: number;
}
