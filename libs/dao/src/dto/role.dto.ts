import { RoleKindType } from '@sputnik-v2/dao/entities/role.entity';
import { VotePolicy } from '@sputnik-v2/sputnikdao';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@sputnik-v2/common';

class RoleKindDto {
  @ApiProperty()
  group: string[];
}

export class RoleDto extends BaseEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: RoleKindDto })
  kind: RoleKindType;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  accountIds: string[];

  @ApiProperty()
  permissions: string[];

  @ApiProperty()
  votePolicy: { [key: string]: VotePolicy };
}
