import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Span } from 'nestjs-ddtrace';

import { AccountAccessGuard } from '@sputnik-v2/common';
import { DaoSettingsDto, DaoSettingsService } from '@sputnik-v2/dao-settings';
import { PatchSettingsBodyDto } from './dto/patch-settings-body.dto';
import { CouncilMemberGuard } from '../guards/council-member.guard';
import { PatchSettingsParamBodyDto } from './dto/patch-settings-param-body.dto';

@Span()
@ApiTags('DAO')
@Controller('/daos')
export class DaoSettingsController {
  constructor(private readonly daoSettingsService: DaoSettingsService) {}

  @ApiParam({
    name: 'daoId',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Get DAO settings',
    type: DaoSettingsDto,
  })
  @Get('/:daoId/settings')
  async getSettings(@Param('daoId') daoId: string): Promise<DaoSettingsDto> {
    const entity = await this.daoSettingsService.getSettings(daoId);
    return entity?.settings || {};
  }

  @ApiResponse({
    status: 200,
    description: 'Save DAO settings',
    type: DaoSettingsDto,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard, CouncilMemberGuard)
  @Patch('/:daoId/settings')
  async patchSettings(
    @Param('daoId') daoId: string,
    @Body() { settings }: PatchSettingsBodyDto,
  ): Promise<DaoSettingsDto> {
    const entity = await this.daoSettingsService.saveSettings(daoId, settings);
    return entity.settings;
  }

  @ApiResponse({
    status: 200,
    description: 'Save DAO settings param',
    type: DaoSettingsDto,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard, CouncilMemberGuard)
  @Patch('/:daoId/settings/:key')
  async patchSettingsParam(
    @Param('daoId') daoId: string,
    @Param('key') key: string,
    @Body() { value }: PatchSettingsParamBodyDto,
  ): Promise<DaoSettingsDto> {
    const entity = await this.daoSettingsService.saveSettingsParam(
      daoId,
      key,
      value,
    );
    return entity.settings;
  }
}
