import { ApiProperty } from '@nestjs/swagger';

export class StatsEntryDto {
  @ApiProperty()
  value: number | string;

  @ApiProperty()
  timestamp: number;
}
