import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FindAccountParams {
  @ApiProperty()
  @IsNotEmpty()
  accountId: string;
}
