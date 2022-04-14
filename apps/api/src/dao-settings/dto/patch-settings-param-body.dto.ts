import { AccountBearer } from '@sputnik-v2/common';
import { ApiProperty } from '@nestjs/swagger';

export class PatchSettingsParamBodyDto extends AccountBearer {
  @ApiProperty()
  value: any;
}
