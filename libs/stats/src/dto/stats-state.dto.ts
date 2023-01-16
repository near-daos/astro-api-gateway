import { ApiProperty } from '@nestjs/swagger';

export class StatsStateDto {
  @ApiProperty({
    type: Number,
  })
  value: number | string;

  @ApiProperty()
  growth: number;
}
