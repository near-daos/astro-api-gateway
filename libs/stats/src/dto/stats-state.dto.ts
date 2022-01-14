import { ApiProperty } from '@nestjs/swagger';

export class StatsStateDto {
  @ApiProperty()
  value: number;

  @ApiProperty()
  growth: number;
}
