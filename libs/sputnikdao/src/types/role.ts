import { RoleKindType } from '@sputnik-v2/dao/entities';
import { ApiProperty } from '@nestjs/swagger';

export class RoleKindMember {
  @ApiProperty()
  [RoleKindType.Member]: number | string;
}
export class RoleKindGroup {
  @ApiProperty()
  [RoleKindType.Group]: string[];
}

export type RoleKind = RoleKindType.Everyone | RoleKindMember | RoleKindGroup;
