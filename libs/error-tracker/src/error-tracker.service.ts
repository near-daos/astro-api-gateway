import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureFlags, FeatureFlagsService } from '@sputnik-v2/feature-flags';
import { ErrorModel, PartialEntity } from '@sputnik-v2/dynamodb';

import { ErrorEntity } from './entities';
import { ErrorStatus } from './types';
import { ErrorDto } from './dto';
import { ErrorTrackerDynamoService } from './error-tracker-dynamo.service';

@Injectable()
export class ErrorTrackerService {
  constructor(
    @InjectRepository(ErrorEntity)
    private readonly errorRepository: Repository<ErrorEntity>,
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly errorTrackerDynamoService: ErrorTrackerDynamoService,
  ) {}

  async useDynamoDB() {
    return this.featureFlagsService.check(FeatureFlags.ErrorDynamo);
  }

  async create(error: ErrorDto) {
    await this.errorTrackerDynamoService.create(error);
    await this.errorRepository.save(error);
  }

  async getErrorById(
    id: string,
  ): Promise<ErrorEntity | PartialEntity<ErrorModel> | undefined> {
    if (await this.useDynamoDB()) {
      return this.errorTrackerDynamoService.getById(id);
    }

    return this.errorRepository.findOne(id);
  }

  async getOpenErrorsIds() {
    if (await this.useDynamoDB()) {
      return this.errorTrackerDynamoService.getOpenErrorIds();
    }

    return (
      await this.errorRepository.find({
        select: ['id'],
        where: { status: ErrorStatus.Open },
        order: { timestamp: 'ASC' },
      })
    ).map(({ id }) => id);
  }

  async setErrorStatus(id: string, status: ErrorStatus) {
    if (status === ErrorStatus.Open) {
      await this.errorTrackerDynamoService.addOpenErrorId(id);
    } else {
      await this.errorTrackerDynamoService.removeOpenErrorId(id);
    }
    await this.errorTrackerDynamoService.save(id, { status });
    return this.errorRepository.update(id, { status });
  }
}
