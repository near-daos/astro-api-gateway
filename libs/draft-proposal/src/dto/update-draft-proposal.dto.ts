import { ApiProperty } from '@nestjs/swagger';
import { ProposalKindSwaggerDto, ProposalType } from '@sputnik-v2/proposal';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UpdateDraftProposal {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    enum: ProposalType,
    enumName: 'ProposalType',
  })
  @IsEnum(ProposalType)
  @IsNotEmpty()
  type: ProposalType;

  @ApiProperty({ type: ProposalKindSwaggerDto })
  @IsNotEmpty()
  kind: ProposalKindSwaggerDto;

  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  hashtags: string[];
}
