import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { FindAccountParams } from './FindAccountParams';

export class AccountTokenParams extends FindAccountParams {
  @ApiProperty()
  @IsNotEmpty()
  tokenId: string;
}
