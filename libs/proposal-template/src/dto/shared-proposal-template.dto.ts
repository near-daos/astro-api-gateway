import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { GetManyDefaultResponse } from '@nestjsx/crud';

import { BaseResponse } from '@sputnik-v2/common';
import { BaseEntityResponseDto } from '@sputnik-v2/common/dto/BaseEntityResponse';
import { Dao } from '@sputnik-v2/dao/entities';
import { ProposalTemplateConfigDto } from '@sputnik-v2/proposal-template/dto';

import { SharedProposalTemplate } from '../entities';

export class BaseProposalTemplateDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty({ type: ProposalTemplateConfigDto })
  config: ProposalTemplateConfigDto;
}

export class CreateSharedProposalTemplateDto extends BaseProposalTemplateDto {
  @ApiProperty()
  daoId?: string;
}

export class SharedProposalTemplateResponseDto extends IntersectionType(
  BaseEntityResponseDto,
  BaseProposalTemplateDto,
) {
  @ApiProperty()
  id: string;

  @ApiProperty()
  daos?: Dao[];

  @ApiProperty()
  daoCount: number;
}

export class SharedProposalTemplatesResponse extends BaseResponse<SharedProposalTemplateResponseDto> {
  @ApiProperty({ type: [SharedProposalTemplateResponseDto] })
  data: SharedProposalTemplateResponseDto[];
}

export function sharedProposalTemplateManyResponseToDTO(
  templatesResponse:
    | GetManyDefaultResponse<SharedProposalTemplate>
    | SharedProposalTemplate[],
): SharedProposalTemplatesResponse | SharedProposalTemplateResponseDto[] {
  if (templatesResponse instanceof Array) {
    return [
      ...(templatesResponse || []).map((template) =>
        sharedProposalTemplateResponseToDTO(template),
      ),
    ];
  }

  return {
    ...templatesResponse,
    data: [
      ...(templatesResponse.data || []).map((card) =>
        sharedProposalTemplateResponseToDTO(card),
      ),
    ],
  };
}

export function sharedProposalTemplateResponseToDTO(
  template: SharedProposalTemplate,
): SharedProposalTemplateResponseDto {
  return {
    ...template,
  };
}
