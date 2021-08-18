import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";
import { AccountBearer } from "src/common/dto/AccountBearer";
import { DaoStatus } from "../types/dao-status";

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
  @IsString()
  @IsNotEmpty()
  bond: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  purpose: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  votePeriod: string;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  council: string[];

  numberOfProposals: number;
  councilSeats: number;
  numberOfMembers: number;
  txHash: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  link: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  status: DaoStatus;
}
