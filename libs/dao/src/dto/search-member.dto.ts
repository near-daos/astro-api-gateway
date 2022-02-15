import { ApiProperty } from '@nestjs/swagger';
import { RoleKindType } from '../entities/role.entity';

export class SearchMemberRoleDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ enum: RoleKindType })
  kind: RoleKindType;

  @ApiProperty()
  permissions: string;
}

export class SearchMemberDto {
  @ApiProperty()
  accountId: string;

  @ApiProperty()
  daos: Record<string, SearchMemberRoleDto[]>;

  @ApiProperty()
  voteCount: number;
}
