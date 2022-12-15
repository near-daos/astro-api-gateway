import { ApiProperty } from '@nestjs/swagger';
import { TransactionEntity } from '@sputnik-v2/common';

import { DaoConfig, DaoStatus } from '@sputnik-v2/dao/types';
import { DaoVersion, Policy } from '@sputnik-v2/dao/entities';

import { castPolicyDtoV2, PolicyDtoV2 } from './policy.dto';

class DaoBaseResponse extends TransactionEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: DaoConfig })
  config: DaoConfig;

  @ApiProperty()
  metadata: Record<string, any>;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  totalSupply: string;

  @ApiProperty()
  lastBountyId: number;

  @ApiProperty()
  lastProposalId: number;

  @ApiProperty()
  stakingContract: string;

  @ApiProperty({
    description:
      'How many accounts in total have interacted with the DAO (made proposals, voted, etc).',
  })
  numberOfAssociates: number;

  @ApiProperty({
    description: 'How many accounts are members of the DAO',
  })
  numberOfMembers: number;

  @ApiProperty({
    description: 'How many groups exist in the DAO',
  })
  numberOfGroups: number;

  @ApiProperty({
    description: 'List of accounts that can vote for various activity',
  })
  council: string[];

  @ApiProperty({
    description: 'List of all account ids that joined the DAO',
  })
  accountIds: string[];

  @ApiProperty({
    description: 'Council accounts count',
  })
  councilSeats: number;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  daoVersionHash: string;

  @ApiProperty()
  daoVersion: DaoVersion;

  @ApiProperty()
  status: DaoStatus;

  @ApiProperty()
  activeProposalCount: number;

  @ApiProperty()
  totalProposalCount: number;

  @ApiProperty()
  totalDaoFunds: number;
}

export class DaoResponseV1 extends DaoBaseResponse {
  @ApiProperty()
  policy: Policy;
}

export class DaoResponseV2 extends DaoBaseResponse {
  @ApiProperty()
  policy: PolicyDtoV2;
}

export function castDaoResponseV2(dao: DaoResponseV1): DaoResponseV2 {
  return {
    ...dao,
    policy: castPolicyDtoV2(dao.policy),
  };
}
