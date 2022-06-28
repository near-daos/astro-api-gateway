import { ApiProperty } from '@nestjsx/crud/lib/crud';

export class ProposalTemplateConfigDto {
  @ApiProperty()
  smartContractAddress: string;

  @ApiProperty()
  methodName: string;

  @ApiProperty()
  deposit: string;

  @ApiProperty()
  actionsGas: string;

  @ApiProperty()
  json: string;
}
