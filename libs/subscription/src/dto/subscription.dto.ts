import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AccountBearer } from '@sputnik-v2/common';

export class SubscriptionDto extends AccountBearer {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  daoId: string;
}
