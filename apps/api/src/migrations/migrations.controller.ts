import { Body, Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

import { RunMigrationDto } from '@sputnik-v2/migrations/dto';
import { MigrationService } from '@sputnik-v2/migrations/migration.service';

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
  @Post('/run')
  async runMigration(
    @Body() { name, options }: RunMigrationDto,
  ): Promise<boolean> {
    return this.accountService.runMigration(name, options);
  }
}
