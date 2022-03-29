import { AccountBearer } from '@sputnik-v2/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class AccountPhoneDto extends AccountBearer {
  @ApiProperty()
  @IsString()
  @IsPhoneNumber('US')
  @IsNotEmpty()
  phoneNumber: string;
}
