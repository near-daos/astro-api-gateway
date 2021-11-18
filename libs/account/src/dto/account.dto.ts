import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AccountBearer } from '@sputnik-v2/common';

export class AccountDto extends AccountBearer {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
