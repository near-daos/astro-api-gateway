import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

import { Migration } from '..';

@Injectable()
export class DynamoTableMigration implements Migration {
  private readonly logger = new Logger(DynamoTableMigration.name);

  private readonly tableName: string;

  constructor(private readonly configService: ConfigService) {
    const { tableName } = configService.get('dynamodb');

    this.tableName = tableName || 'entities_dev';
  }

  public async migrate(): Promise<void> {
    this.logger.log(`Starting DynamoDB ${this.tableName} Table migration...`);

    const { region, endpoint } = this.configService.get('dynamodb');
    const dynamodb = new AWS.DynamoDB({ region, endpoint });

    this.logger.log(`Creating ${this.tableName} table in DynamoDB...`);
    await dynamodb
      .createTable({
        TableName: this.tableName,
        KeySchema: [
          { AttributeName: 'partitionId', KeyType: 'HASH' },
          { AttributeName: 'entityId', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
          { AttributeName: 'partitionId', AttributeType: 'S' },
          { AttributeName: 'entityId', AttributeType: 'S' },
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 100,
          WriteCapacityUnits: 10,
        },
      })
      .promise();

    this.logger.log(`DynamoDB ${this.tableName} Table migration finished.`);
  }
}
