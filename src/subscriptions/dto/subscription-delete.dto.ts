import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SubscriptionDeleteDto {

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  publicKey: string;
}
