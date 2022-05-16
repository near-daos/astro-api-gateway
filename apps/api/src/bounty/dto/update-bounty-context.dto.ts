import { ApiProperty } from '@nestjs/swagger';

export class UpdateBountyContextDto {
  @ApiProperty()
  daoId: string;

  @ApiProperty()
  ids: string[];

  @ApiProperty()
  isArchived: boolean;
}
