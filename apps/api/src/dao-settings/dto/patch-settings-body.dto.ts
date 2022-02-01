import { AccountBearer } from '@sputnik-v2/common';
import { DaoSettingsDto } from '@sputnik-v2/dao-settings';
import { ApiProperty } from '@nestjs/swagger';

export class PatchSettingsBodyDto extends AccountBearer {
  @ApiProperty()
  settings: DaoSettingsDto;
}
