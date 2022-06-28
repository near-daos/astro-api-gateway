import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from './pagination.dto';
import { Order } from '../types';
import { IsOptional, IsString } from 'class-validator';

export class SearchDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  orderBy: string;

  @ApiProperty({ required: false, enum: Order })
  order: Order;
}
