import { ApiProperty } from '@nestjs/swagger';

export class StatsEntryDto {
  @ApiProperty({
    type: Number,
  })
  value: number | string;

  @ApiProperty()
  timestamp: number;
}
