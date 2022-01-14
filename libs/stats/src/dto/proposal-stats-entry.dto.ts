import { ApiProperty } from '@nestjs/swagger';

export class ProposalStatsEntryDto {
  @ApiProperty()
  active: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  timestamp: number;
}
