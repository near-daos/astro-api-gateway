import { BadRequestException, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { buildAccountNotificationSettingsId } from '@sputnik-v2/utils';
import { DaoService } from '@sputnik-v2/dao';
import { DynamodbService } from '@sputnik-v2/dynamodb/dynamodb.service';
import {
  AccountNotificationSettingsItemModel,
  AccountNotificationSettingsModel,
} from '@sputnik-v2/dynamodb/models';
import { DynamoEntityType } from '@sputnik-v2/dynamodb/types';
import PromisePool from '@supercharge/promise-pool';
import { FeatureFlagsService } from '@sputnik-v2/feature-flags/feature-flags.service';
import { FeatureFlags } from '@sputnik-v2/feature-flags/types';

import { CreateAccountNotificationSettingsDto } from './dto';
import { AccountNotificationSettings } from './entities';

@Injectable()
export class AccountNotificationSettingsService extends TypeOrmCrudService<AccountNotificationSettings> {
  constructor(
    @InjectRepository(AccountNotificationSettings)
    private readonly accountNotificationSettingsRepository: Repository<AccountNotificationSettings>,
    private readonly daoService: DaoService,
    private readonly dynamoDbService: DynamodbService,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {
    super(accountNotificationSettingsRepository);
  }

  async useDynamoDB() {
    return this.featureFlagsService.check(FeatureFlags.NotificationDynamo);
  }

  async create(
    accountId: string,
    dto: CreateAccountNotificationSettingsDto,
  ): Promise<AccountNotificationSettings> {
    const dao = await this.daoService.findById(dto.daoId);
    if (dto.daoId && !dao) {
      throw new BadRequestException(`Invalid DAO id ${dto.daoId}`);
    }

    const id = buildAccountNotificationSettingsId(accountId, dto.daoId);
    const entity = this.accountNotificationSettingsRepository.create({
      id,
      accountId,
      daoId: dto.daoId,
      types: dto.types,
      mutedUntilTimestamp: Number(dto.mutedUntilTimestamp),
      isAllMuted: dto.isAllMuted,
      enableSms: !!dto.enableSms,
      enableEmail: !!dto.enableEmail,
      actionRequiredOnly: !!dto.actionRequiredOnly,
      createdAt: new Date(),
    });
    await this.dynamoDbService.saveAccountNotificationSettings(entity);
    return this.accountNotificationSettingsRepository.save(entity);
  }

  async getAccountsNotificationSettings(
    accountIds: string[],
  ): Promise<
    Array<AccountNotificationSettings | AccountNotificationSettingsItemModel>
  > {
    if (await this.useDynamoDB()) {
      const { results } = await PromisePool.withConcurrency(5)
        .for(accountIds)
        .process(
          async (accountId) =>
            await this.dynamoDbService.getItemByType<AccountNotificationSettingsModel>(
              accountId,
              DynamoEntityType.AccountNotificationSettings,
              accountId,
            ),
        );
      return results.reduce(
        (arr, item) => (item ? [...arr, ...item.settings] : arr),
        [],
      );
    } else {
      return this.accountNotificationSettingsRepository.find({
        accountId: In(accountIds),
      });
    }
  }
}
