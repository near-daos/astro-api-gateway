import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DaoModel,
  DynamodbService,
  DynamoEntityType,
} from '@sputnik-v2/dynamodb';
import { FeatureFlags, FeatureFlagsService } from '@sputnik-v2/feature-flags';
import { Repository } from 'typeorm';
import { DaoSettingsDto } from './dto';
import { DaoSettings } from './entities';

@Injectable()
export class DaoSettingsService {
  constructor(
    @InjectRepository(DaoSettings)
    private readonly daoSettingsRepository: Repository<DaoSettings>,
    private readonly dynamodbService: DynamodbService,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {}

  get useDynamoDB() {
    return this.featureFlagsService.check(FeatureFlags.DaoSettingsDynamo);
  }

  async getSettings(daoId: string) {
    if (this.useDynamoDB) {
      const dao = await this.dynamodbService.getItemByType<DaoModel>(
        daoId,
        DynamoEntityType.Dao,
        daoId,
      );
      return dao?.settings || {};
    } else {
      const entity = await this.daoSettingsRepository.findOne(daoId);
      return entity?.settings || {};
    }
  }

  async saveSettings(daoId: string, settings: DaoSettingsDto) {
    const entity = this.daoSettingsRepository.create({
      daoId,
      settings,
    });

    if (this.useDynamoDB) {
      await this.dynamodbService.saveDaoSettings(entity);
    } else {
      await this.daoSettingsRepository.save(entity);
    }

    return entity;
  }

  async saveSettingsParam(daoId: string, key: string, value: any) {
    const settings = (await this.getSettings(daoId)) || {};
    const entity = this.daoSettingsRepository.create({
      daoId,
      settings: {
        ...settings,
        [key]: value,
      },
    });

    if (this.useDynamoDB) {
      await this.dynamodbService.saveDaoSettings(entity);
    } else {
      await this.daoSettingsRepository.save(entity);
    }

    return entity;
  }
}
