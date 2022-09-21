import { ApiProperty } from '@nestjs/swagger';

export class ProposalPermissions {
  @ApiProperty()
  canApprove: boolean;

  @ApiProperty()
  canReject: boolean;

  @ApiProperty()
  canDelete: boolean;

  @ApiProperty()
  isCouncil: boolean;

  @ApiProperty()
  canAdd: boolean;
}
