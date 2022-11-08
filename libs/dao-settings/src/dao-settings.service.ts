import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DaoDynamoService } from '@sputnik-v2/dynamodb';
import { FeatureFlags, FeatureFlagsService } from '@sputnik-v2/feature-flags';
import { Repository } from 'typeorm';
import { DaoSettingsDto } from './dto';
import { DaoSettings } from './entities';

@Injectable()
export class DaoSettingsService {
  constructor(
    @InjectRepository(DaoSettings)
    private readonly daoSettingsRepository: Repository<DaoSettings>,
    private readonly daoDynamoService: DaoDynamoService,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {}

  async useDynamoDB() {
    return this.featureFlagsService.check(FeatureFlags.DaoSettingsDynamo);
  }

  async getSettings(daoId: string) {
    if (await this.useDynamoDB()) {
      const dao = await this.daoDynamoService.get(daoId);
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

    if (await this.useDynamoDB()) {
      await this.daoDynamoService.saveDaoSettings(entity);
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

    if (await this.useDynamoDB()) {
      await this.daoDynamoService.saveDaoSettings(entity);
    } else {
      await this.daoSettingsRepository.save(entity);
    }

    return entity;
  }
}
