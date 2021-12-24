import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DaoService } from '@sputnik-v2/dao';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AccountNotificationSettings,
  NotificationType,
} from '@sputnik-v2/notification';
import { buildAccountNotificationSettingsId } from '@sputnik-v2/utils';

import { Migration } from '..';
import PromisePool from '@supercharge/promise-pool';

@Injectable()
export class NotificationSettingsMigration implements Migration {
  private readonly logger = new Logger(NotificationSettingsMigration.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly daoService: DaoService,
    @InjectRepository(AccountNotificationSettings)
    private readonly accountNotificationSettingsRepository: Repository<AccountNotificationSettings>,
  ) {}

  public async migrate(): Promise<void> {
    this.logger.log('Starting Notification Settings migration...');

    const allDaos = await this.daoService.find();
    const { errors } = await PromisePool.withConcurrency(50)
      .for(allDaos)
      .process(async (dao) => this.migrateDaoNotificationSettings(dao.id));

    if (errors && errors.length) {
      errors.map((error) => this.logger.error(error));
    }

    this.logger.log('Notification Settings migration finished.');
  }

  public async migrateDaoNotificationSettings(daoId: string): Promise<void> {
    const members = await this.daoService.getDaoMembers(daoId);

    const { errors } = await PromisePool.withConcurrency(10)
      .for(members)
      .process(async (member) =>
        this.migrateAccountNotificationSettings(member, daoId),
      );

    this.logger.log(
      `Successfully updated Notification Settings for members of DAO: ${daoId}. Errors: ${errors.length}`,
    );
  }

  public async migrateAccountNotificationSettings(
    accountId: string,
    daoId: string,
  ): Promise<void> {
    const defaultSettings =
      await this.accountNotificationSettingsRepository.findOne({
        accountId,
        daoId: null,
      });
    const daoSettings =
      await this.accountNotificationSettingsRepository.findOne({
        accountId,
        daoId,
      });

    if (!defaultSettings) {
      await this.accountNotificationSettingsRepository.save({
        id: buildAccountNotificationSettingsId(accountId),
        accountId,
        types: Object.values(NotificationType),
        mutedUntilTimestamp: null,
        isAllMuted: false,
      });
    }

    if (!daoSettings) {
      await this.accountNotificationSettingsRepository.save({
        id: buildAccountNotificationSettingsId(accountId, daoId),
        accountId,
        daoId,
        types: Object.values(NotificationType),
        mutedUntilTimestamp: null,
        isAllMuted: false,
      });
    }
  }
}
