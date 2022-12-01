import { ApiProperty, getSchemaPath } from '@nestjs/swagger';

import { RoleKindType } from '../entities';
import { VotePolicy } from '../types';
import {
  RoleKind,
  RoleKindMember,
  RoleKindGroup,
} from '@sputnik-v2/sputnikdao';

class RoleKindDto {
  @ApiProperty()
  group: string[];
}

class RoleBaseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  balance?: number;

  @ApiProperty()
  accountIds?: string[];

  @ApiProperty()
  permissions: string[];

  @ApiProperty()
  votePolicy: { [key: string]: VotePolicy };
}

export class RoleDtoV1 extends RoleBaseDto {
  @ApiProperty({ type: RoleKindDto })
  kind: RoleKindType;
}

export class RoleDtoV2 extends RoleBaseDto {
  @ApiProperty({
    type: [
      { type: RoleKindType.Everyone },
      { $ref: getSchemaPath(RoleKindMember) },
      { $ref: getSchemaPath(RoleKindGroup) },
    ],
  })
  kind: RoleKind;
}

export function castRoleDtoV2(role: RoleDtoV1): RoleDtoV2 {
  switch (role.kind) {
    case RoleKindType.Group:
      return {
        ...role,
        kind: { [RoleKindType.Group]: role.accountIds },
      };
    case RoleKindType.Member:
      return {
        ...role,
        kind: { [RoleKindType.Member]: role.balance },
      };
    case RoleKindType.Everyone:
      return {
        ...role,
        kind: RoleKindType.Everyone,
      };
  }
}
