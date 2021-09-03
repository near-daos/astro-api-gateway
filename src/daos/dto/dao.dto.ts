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
  totalSupply: string;

  @ApiProperty()
  @IsNumber()
  lastBountyId: number;
  
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

  councilSeats: number;

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

  transactionHash: string;
  updateTransactionHash: string;
  createTimestamp: number;
  updateTimestamp: number;

  status: DaoStatus;
}
