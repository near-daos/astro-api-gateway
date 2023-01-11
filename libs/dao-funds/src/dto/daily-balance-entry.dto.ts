import { ApiProperty } from '@nestjs/swagger';

export class DailyBalanceEntryDto {
  @ApiProperty()
  timestamp: number;

  @ApiProperty()
  value: string;
}
