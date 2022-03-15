import { RoleKindType } from '@sputnik-v2/dao/entities/role.entity';
import { VotePolicy } from '@sputnik-v2/sputnikdao';
import { ApiProperty } from '@nestjs/swagger';

export class RoleDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
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
