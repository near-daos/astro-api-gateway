import { AccountBearer } from '@sputnik-v2/common';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBountyContextDto extends AccountBearer {
  @ApiProperty()
  daoId: string;

  @ApiProperty()
  ids: string[];

  @ApiProperty()
  isArchived: boolean;
}
