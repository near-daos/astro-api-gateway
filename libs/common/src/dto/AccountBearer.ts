import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AccountBearer {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  publicKey: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  signature: string;
}
