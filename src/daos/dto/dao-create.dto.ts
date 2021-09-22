import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { AccountBearer } from "src/common/dto/AccountBearer";
import { DaoConfig } from "../types/dao-config";
import { DaoStatus } from "../types/dao-status";
import { DaoDto } from "./dao.dto";
import { PolicyDto } from "./policy.dto";

export class CreateDaoDto extends AccountBearer implements DaoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  council: string[];

  councilSeats: number;

  @ApiProperty()
  config: DaoConfig;

  @ApiProperty()
  @IsString()
  totalSupply: string;
  
  @ApiProperty()
  stakingContract: string;

  @ApiProperty()
  policy: PolicyDto;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  link: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  status: DaoStatus;

  createdBy: string;

  transactionHash: string;
  updateTransactionHash: string;
  createTimestamp: number;
  updateTimestamp: number;
}
