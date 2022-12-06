import { Injectable } from '@nestjs/common';
import {
  DynamodbService,
  DynamoEntityType,
  ErrorIdsModel,
  ErrorModel,
} from '@sputnik-v2/dynamodb';

import { ErrorStatus } from './types';
import { ErrorDto } from './dto';

@Injectable()
export class ErrorTrackerDynamoService {
  constructor(private readonly dynamoDbService: DynamodbService) {}

  async save(id: string, error: Partial<ErrorModel>) {
    return this.dynamoDbService.saveItemByType<ErrorModel>(
      DynamoEntityType.Error,
      DynamoEntityType.Error,
      id,
      error,
    );
  }

  async create(error: ErrorDto) {
    await this.save(error.id, {
      id: error.id,
      type: error.type,
      status: ErrorStatus.Open,
      reason: error.reason,
      metadata: error.metadata,
      isArchived: false,
    });
    await this.addOpenErrorId(error.id);
  }

  async getById(id: string) {
    return this.dynamoDbService.getItemByType<ErrorModel>(
      DynamoEntityType.Error,
      DynamoEntityType.Error,
      id,
    );
  }

  async getOpenErrorIds() {
    const errorIdsModel =
      await this.dynamoDbService.getItemByType<ErrorIdsModel>(
        DynamoEntityType.ErrorIds,
        DynamoEntityType.ErrorIds,
        '1',
      );
    return errorIdsModel?.openErrorIds || [];
  }

  async addOpenErrorId(id: string) {
    const errorIdsModel =
      await this.dynamoDbService.getItemByType<ErrorIdsModel>(
        DynamoEntityType.ErrorIds,
        DynamoEntityType.ErrorIds,
        '1',
      );
    if (!errorIdsModel.openErrorIds.includes(id)) {
      errorIdsModel.openErrorIds.push(id);
      await this.dynamoDbService.updateItem<ErrorIdsModel>(errorIdsModel);
    }
  }

  async removeOpenErrorId(id: string) {
    const errorIdsModel =
      await this.dynamoDbService.getItemByType<ErrorIdsModel>(
        DynamoEntityType.ErrorIds,
        DynamoEntityType.ErrorIds,
        '1',
      );
    if (errorIdsModel.openErrorIds.includes(id)) {
      errorIdsModel.openErrorIds = errorIdsModel.openErrorIds.filter(
        (errorId) => errorId !== id,
      );
      await this.dynamoDbService.updateItem<ErrorIdsModel>(errorIdsModel);
    }
  }
}
