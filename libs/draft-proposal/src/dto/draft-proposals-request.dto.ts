import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { SearchDto } from '@sputnik-v2/common';
import { DraftProposalState } from '../types';

export class DraftProposalsRequest extends SearchDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  daoId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  type: string;

  @ApiProperty({ required: false, enum: DraftProposalState })
  @IsOptional()
  state: DraftProposalState;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  accountId: string;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => (value ? value === 'true' : value))
  isRead: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => (value ? value === 'true' : value))
  isSaved: boolean;
}
