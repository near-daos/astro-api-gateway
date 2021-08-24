import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AccountBearer } from 'src/common/dto/AccountBearer';

export class AccountDto extends AccountBearer {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
