import { ApiProperty } from '@nestjs/swagger';

export class PatchSettingsParamBodyDto {
  @ApiProperty()
  value: any;
}
