import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { AccountBearer } from 'src/common/dto/AccountBearer';
import { DaoConfig } from '../types/dao-config';
import { DaoStatus } from '../types/dao-status';
import { PolicyDto } from './policy.dto';

export class DaoDto extends AccountBearer {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty()
  @IsNotEmpty()
  config: DaoConfig;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  totalSupply: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  lastBountyId: number;
  
  @ApiProperty()
  @IsNumber()
  lastProposalId: number;

  @ApiProperty()
  @IsString()
  stakingContract: string;

  @ApiProperty()
  @IsNumber()
  numberOfMembers: number;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  council: string[];

  @ApiProperty()
  @IsNotEmpty()
  policy: PolicyDto;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  link: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  councilSeats: number;

  transactionHash: string;
  updateTransactionHash: string;
  createTimestamp: number;
  updateTimestamp: number;

  status: DaoStatus;
}
