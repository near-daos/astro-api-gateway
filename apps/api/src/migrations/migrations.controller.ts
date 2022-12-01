import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { RunMigrationDto } from '@sputnik-v2/migrations/dto';
import { MigrationService } from '@sputnik-v2/migrations/migration.service';
import { AccountAccessGuard, AdminGuard } from '@sputnik-v2/common';

@ApiTags('Migrations')
@Controller('/migrations')
export class MigrationsController {
  constructor(private readonly accountService: MigrationService) {}

  @ApiResponse({
    status: 200,
    description: 'Migration started',
  })
  @ApiBadRequestResponse({
    description: 'Failed to run migration',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard, AdminGuard)
  @Post('/run')
  async runMigration(
    @Body() { name, options }: RunMigrationDto,
  ): Promise<boolean> {
    return this.accountService.runMigration(name, options);
  }
}
