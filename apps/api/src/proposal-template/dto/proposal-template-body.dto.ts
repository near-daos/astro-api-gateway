import { AccountBearer } from '@sputnik-v2/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { ProposalTemplateConfigDto } from '@sputnik-v2/proposal-template';

export class ProposalTemplateBodyDto extends AccountBearer {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsBoolean()
  isEnabled: boolean;

  @ApiProperty()
  config: ProposalTemplateConfigDto;
}
