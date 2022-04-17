import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DaoSettingsDto } from './dto';
import { DaoSettings } from './entities';

@Injectable()
export class DaoSettingsService {
  constructor(
    @InjectRepository(DaoSettings)
    private readonly daoSettingsRepository: Repository<DaoSettings>,
  ) {}

  getSettings(daoId: string) {
    return this.daoSettingsRepository.findOne(daoId);
  }

  saveSettings(daoId: string, settings: DaoSettingsDto) {
    return this.daoSettingsRepository.save({
      daoId,
      settings,
    });
  }

  async saveSettingsParam(daoId: string, key: string, value: any) {
    const settings = (await this.getSettings(daoId))?.settings || {};
    return this.daoSettingsRepository.save({
      daoId,
      settings: {
        ...settings,
        [key]: value,
      },
    });
  }
}
