import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { DynamoTableName } from '@sputnik-v2/dynamodb';

import { Migration } from '..';

@Injectable()
export class DynamoDaoTableMigration implements Migration {
  private readonly logger = new Logger(DynamoDaoTableMigration.name);

  constructor(private readonly configService: ConfigService) {}

  public async migrate(): Promise<void> {
    this.logger.log('Starting DynamoDB AstroDao Table migration...');

    const { region, endpoint } = this.configService.get('dynamodb');
    const dynamodb = new AWS.DynamoDB({ region, endpoint });

    this.logger.log('Creating AstroDao table in DynamoDB...');
    await dynamodb
      .createTable({
        TableName: DynamoTableName.AstroDao,
        KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
        ProvisionedThroughput: {
          ReadCapacityUnits: 100,
          WriteCapacityUnits: 10,
        },
      })
      .promise();

    this.logger.log('DynamoDB AstroDao Table migration finished.');
  }
}
