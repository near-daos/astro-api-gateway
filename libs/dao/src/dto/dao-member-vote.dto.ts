import { ApiProperty } from '@nestjsx/crud/lib/crud';

export class DaoMemberVote {
  @ApiProperty()
  accountId: string;

  @ApiProperty()
  voteCount: number;
}
