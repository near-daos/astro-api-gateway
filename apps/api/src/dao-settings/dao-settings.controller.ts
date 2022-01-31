import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccountAccessGuard, FindOneParams } from '@sputnik-v2/common';
import { DaoSettingsDto, DaoSettingsService } from '@sputnik-v2/dao-settings';
import { PatchSettingsBodyDto } from './dto/patch-settings-body.dto';

@ApiTags('DAO')
@Controller('/daos')
export class DaoSettingsController {
  constructor(private readonly daoSettingsService: DaoSettingsService) {}

  @ApiParam({
    name: 'id',
    description: 'DAO Id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Get DAO settings',
    type: DaoSettingsDto,
  })
  @Get('/:id/settings')
  async getSettings(@Param() { id }: FindOneParams): Promise<DaoSettingsDto> {
    const entity = await this.daoSettingsService.getSettings(id);
    return entity?.settings || {};
  }

  @ApiParam({
    name: 'id',
    description: 'DAO Id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Save DAO settings',
    type: DaoSettingsDto,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature',
  })
  @UseGuards(AccountAccessGuard)
  @Patch('/:id/settings')
  async patchSettings(
    @Param() { id }: FindOneParams,
    @Body() { settings }: PatchSettingsBodyDto,
  ): Promise<DaoSettingsDto> {
    const entity = await this.daoSettingsService.saveSettings(id, settings);
    return entity.settings;
  }
}
