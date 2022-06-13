import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class AccountPhoneDto {
  @ApiProperty()
  @IsString()
  @Matches(/^\+1\d{10}$/, {
    message: 'Invalid phone number provided. Only US numbers supported',
  })
  @IsNotEmpty()
  phoneNumber: string;
}
