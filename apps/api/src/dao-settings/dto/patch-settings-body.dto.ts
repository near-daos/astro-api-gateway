import { DaoSettingsDto } from '@sputnik-v2/dao-settings';
import { ApiProperty } from '@nestjs/swagger';

export class PatchSettingsBodyDto {
  @ApiProperty()
  settings: DaoSettingsDto;
}
