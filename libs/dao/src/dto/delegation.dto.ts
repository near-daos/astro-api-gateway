import { ApiProperty } from '@nestjs/swagger';

export class DelegationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  daoId: string;

  @ApiProperty()
  balance: string;

  @ApiProperty()
  accountId: string;

  @ApiProperty()
  delegators: Record<string, any>;
}
