import { ApiProperty } from '@nestjs/swagger';

export class TransactionHandlerBlock {
  @ApiProperty()
  height: string;

  @ApiProperty()
  timestamp: string;
}

export class TransactionHandlerBlocks {
  @ApiProperty({ type: TransactionHandlerBlock })
  lastBlock: TransactionHandlerBlock;

  @ApiProperty({ type: TransactionHandlerBlock })
  lastAstroBlock: TransactionHandlerBlock;

  @ApiProperty({ type: TransactionHandlerBlock })
  lastHandledBlock: TransactionHandlerBlock;

  @ApiProperty({ type: TransactionHandlerBlock })
  lastProcessedBlock: TransactionHandlerBlock;
}
