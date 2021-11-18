import { ApiProperty } from '@nestjs/swagger';

export class ActionCall {
  @ApiProperty()
  methodName: number;

  @ApiProperty()
  args: string;

  @ApiProperty()
  deposit: string;

  @ApiProperty()
  gas: string;
}
