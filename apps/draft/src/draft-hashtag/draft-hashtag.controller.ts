import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { BaseResponseDto, SearchDto } from '@sputnik-v2/common';
import { DraftHashtag, DraftHashtagService } from '@sputnik-v2/draft-hashtag';

@ApiTags('Draft Hashtags')
@Controller('/draft-hashtags')
export class DraftHashtagController {
  constructor(private readonly draftHashtagService: DraftHashtagService) {}

  @ApiResponse({
    status: 200,
    description: 'List of Draft Hashtags',
    type: DraftHashtag,
  })
  @Get('/')
  getDraftHashtags(
    @Query() query: SearchDto,
  ): Promise<BaseResponseDto<DraftHashtag>> {
    return this.draftHashtagService.getAll(query);
  }
}
