import { ApiProperty } from '@nestjs/swagger';

export class StatsStateDto {
  @ApiProperty()
  value: number | string;

  @ApiProperty()
  growth: number;
}
