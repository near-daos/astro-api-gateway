import { AccountBearer } from '@sputnik-v2/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AccountEmailDto extends AccountBearer {
  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
