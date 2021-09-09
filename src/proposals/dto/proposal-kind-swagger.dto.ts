import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { Bounty } from 'src/bounties/entities/bounty.entity';
import { PolicyDto } from 'src/daos/dto/policy.dto';
import { DaoConfig } from 'src/daos/types/dao-config';
import { ActionCall } from 'src/sputnikdao/types/action-call';
import { ProposalType } from '../types/proposal-type';

// Wrapper for Swagger spec
export class ProposalKindDto {
  @ApiProperty({
    enum: Object.keys(ProposalType),
  })
  type: ProposalType;

  @ApiProperty({
    type: DaoConfig,
    title: 'DaoConfig',
    description: `For type: ${ProposalType.ChangeConfig}`,
  })
  config: DaoConfig;

  @ApiProperty({
    type: PolicyDto,
    title: 'PolicyDto',
    description: `For type: ${ProposalType.ChangePolicy}`,
  })
  policy: PolicyDto | string[];

  @ApiProperty({
    description:
      `For type: ${ProposalType.AddMemberToRole}` +
      ` or ${ProposalType.RemoveMemberFromRole}`,
  })
  memberId: string;

  @ApiProperty({
    description:
      `For type: ${ProposalType.AddMemberToRole}` +
      ` or ${ProposalType.RemoveMemberFromRole}`,
  })
  role: string;

  @ApiProperty({
    description:
      `For type: ${ProposalType.FunctionCall}` +
      ` or ${ProposalType.UpgradeRemote}` +
      `or ${ProposalType.Transfer}` +
      `or ${ProposalType.BountyDone}`,
  })
  receiverId: string;

  @ApiProperty({
    type: [ActionCall],
    description: `For type: ${ProposalType.FunctionCall}`,
  })
  actions: ActionCall[];

  @ApiProperty({
    description:
      `For type: ${ProposalType.UpgradeSelf}` +
      `or ${ProposalType.UpgradeRemote}`,
  })
  hash: string;

  @ApiProperty({
    description: `For type: ${ProposalType.UpgradeRemote}`,
  })
  methodName: string;

  @ApiProperty({
    description: `For type: ${ProposalType.Transfer}`,
  })
  tokenId: string;

  @ApiProperty({
    description: `For type: ${ProposalType.Transfer}`,
  })
  msg: string;

  @ApiProperty({
    description: `For type: ${ProposalType.SetStakingContract}`,
  })
  stakingId: string;

  @ApiProperty({
    type: Bounty,
    description: `For type: ${ProposalType.AddBounty}`,
  })
  bounty: Bounty;

  @ApiProperty({
    description: `For type: ${ProposalType.BountyDone}`,
  })
  bountyId: string;
}
