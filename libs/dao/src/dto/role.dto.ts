import { RoleKindType } from '@sputnik-v2/dao/entities/role.entity';
import { VotePolicy } from '@sputnik-v2/sputnikdao';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@sputnik-v2/common';

export class RoleDto extends BaseEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    oneOf: [
      { type: 'string' },
      {
        type: 'object',
        properties: {
          group: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    ],
  })
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
