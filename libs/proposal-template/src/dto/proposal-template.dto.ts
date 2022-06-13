import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { ProposalTemplateConfigDto } from './proposal-template-config.dto';

export class ProposalTemplateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  daoId: string;

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
