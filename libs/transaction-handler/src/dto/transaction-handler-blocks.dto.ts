import { ApiProperty } from '@nestjs/swagger';

export class TransactionHandlerBlock {
  @ApiProperty()
  height: number;

  @ApiProperty()
  timestamp: number | bigint;
}

export class TransactionHandlerBlocks {
  @ApiProperty({ type: TransactionHandlerBlock })
  lastBlock: TransactionHandlerBlock;

  @ApiProperty({ type: TransactionHandlerBlock })
  lastAstroBlock: TransactionHandlerBlock;

  @ApiProperty({ type: TransactionHandlerBlock })
  lastAggregatedBlock: TransactionHandlerBlock;

  @ApiProperty({ type: TransactionHandlerBlock })
  lastProcessedBlock: TransactionHandlerBlock;
}
