import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AccountBearer } from 'src/common/dto/AccountBearer';

export class SubscriptionDto extends AccountBearer {

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  daoId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
