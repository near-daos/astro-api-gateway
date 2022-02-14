import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '@sputnik-v2/common';

import { SearchMemberDto } from './search-member.dto';

export class SearchMemberResponse extends BaseResponse<SearchMemberDto> {
  @ApiProperty({ type: [SearchMemberDto] })
  data: SearchMemberDto[];
}
