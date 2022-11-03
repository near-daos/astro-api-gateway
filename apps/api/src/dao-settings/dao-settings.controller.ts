import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AccountAccessGuard } from '@sputnik-v2/common';
import { DaoSettingsDto, DaoSettingsService } from '@sputnik-v2/dao-settings';
import { Span } from 'nestjs-ddtrace';
import { CouncilMemberGuard } from '../guards/council-member.guard';
import { PatchSettingsBodyDto } from './dto/patch-settings-body.dto';
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
  getSettings(@Param('daoId') daoId: string): Promise<DaoSettingsDto> {
    return this.daoSettingsService.getSettings(daoId);
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
  patchSettings(
    @Param('daoId') daoId: string,
    @Body() { settings }: PatchSettingsBodyDto,
  ): Promise<DaoSettingsDto> {
    return this.daoSettingsService.saveSettings(daoId, settings);
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
  patchSettingsParam(
    @Param('daoId') daoId: string,
    @Param('key') key: string,
    @Body() { value }: PatchSettingsParamBodyDto,
  ): Promise<DaoSettingsDto> {
    return this.daoSettingsService.saveSettingsParam(daoId, key, value);
  }
}
