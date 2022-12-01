import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { RunMigrationDto } from '@sputnik-v2/migrations/dto';
import { MigrationService } from '@sputnik-v2/migrations/migration.service';
import { AccountAccessGuard, AdminGuard } from '@sputnik-v2/common';
import { DynamoEntityType } from '@sputnik-v2/dynamodb/types';

@ApiTags('Migrations')
@Controller('/migrations')
export class MigrationsController {
  constructor(private readonly accountService: MigrationService) {}

  @ApiBody({
    type: RunMigrationDto,
    description: `The body contains 2 properties: name and options. Name - migration name. Options - contains properties to configure migration.`,
    examples: {
      a: {
        summary: 'OpenSearch Index Mapping',
        description:
          'Create OpenSearch Indexes with new mappings and re-index data',
        value: {
          name: 'OpensearchIndexMappingMigration',
        } as RunMigrationDto,
      },
      b: {
        summary: 'Dynamo Data Migration',
        description: 'Migrate DAOs and DAO IDs from Postgres to DynamoDB',
        value: {
          name: 'DynamoDataMigration',
          options: {
            entityTypes: [DynamoEntityType.Dao, DynamoEntityType.DaoIds],
          },
        } as RunMigrationDto,
      },
    },
  })
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
