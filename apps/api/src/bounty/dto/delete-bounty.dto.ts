import { AccountBearer } from '@sputnik-v2/common';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteBountyBodyDto extends AccountBearer {
  @ApiProperty()
  daoId: string;
}
