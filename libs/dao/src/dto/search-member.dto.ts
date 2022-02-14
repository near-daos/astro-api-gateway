import { ApiProperty } from '@nestjs/swagger';
import { RoleKindType } from '../entities/role.entity';

export class SearchMemberDto {
  @ApiProperty()
  accountId: string;

  @ApiProperty()
  daoId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: RoleKindType })
  kind: RoleKindType;

  @ApiProperty()
  permissions: string;

  @ApiProperty()
  voteCount: number;
}
