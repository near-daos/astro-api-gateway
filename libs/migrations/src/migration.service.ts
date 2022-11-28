import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { Migration } from './interfaces';
import { DynamoDataMigration } from './scripts/dynamo-data.migration';
import { OpensearchIndexMappingMigration } from './scripts/opensearch-index-mapping.migration';
import { OpensearchIndexMigration } from './scripts/opensearch-index.migration';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);
  private isInProgress: boolean = false;

  constructor(
    private dynamoDataMigration: DynamoDataMigration,
    private opensearchIndexMappingMigration: OpensearchIndexMappingMigration,
    private opensearchIndexMigration: OpensearchIndexMigration,
  ) {}

  async runMigration(
    name: string,
    options: Record<string, any>,
  ): Promise<boolean> {
    const migration = this.getMigration(name);

    if (!migration) {
      throw new BadRequestException(`Invalid migration name: ${name}`);
    }

    if (this.isInProgress) {
      throw new BadRequestException(`Migration is in progress`);
    }

    this.isInProgress = true;
    this.logger.log(`Running migration ${name}`);

    migration
      .migrate(options)
      .then(() => {
        this.isInProgress = false;
        this.logger.log(`Migration ${name} successfully finished`);
      })
      .catch((err) => {
        this.isInProgress = false;
        this.logger.error(`Migration ${name} failed: ${err}`);
      });

    return true;
  }

  private getMigration(name: string): Migration {
    switch (name) {
      case DynamoDataMigration.name:
        return this.dynamoDataMigration;
      case OpensearchIndexMappingMigration.name:
        return this.opensearchIndexMappingMigration;
      case OpensearchIndexMigration.name:
        return this.opensearchIndexMigration;
    }
  }
}
