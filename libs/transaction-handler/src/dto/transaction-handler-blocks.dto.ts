import { ApiProperty } from '@nestjs/swagger';

export class TransactionHandlerBlocks {
  @ApiProperty()
  lastBlock: number;

  @ApiProperty()
  lastAstroBlock: number;

  @ApiProperty()
  lastHandledBlock: number;
}
