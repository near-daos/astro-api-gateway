import { ApiProperty } from '@nestjs/swagger';

export class StatsEntryDto {
  @ApiProperty()
  value: number;

  @ApiProperty()
  timestamp: number;
}
