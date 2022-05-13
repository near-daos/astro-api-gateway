import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AccountVerificationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;
}
