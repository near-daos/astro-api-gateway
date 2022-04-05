import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { buildAccountNotificationSettingsId } from '@sputnik-v2/utils';

import { CreateAccountNotificationSettingsDto } from './dto';
import { AccountNotificationSettings } from './entities';

@Injectable()
export class AccountNotificationSettingsService extends TypeOrmCrudService<AccountNotificationSettings> {
  constructor(
    @InjectRepository(AccountNotificationSettings)
    private readonly accountNotificationSettingsRepository: Repository<AccountNotificationSettings>,
  ) {
    super(accountNotificationSettingsRepository);
  }

  async create(
    dto: CreateAccountNotificationSettingsDto,
  ): Promise<AccountNotificationSettings> {
    const id = buildAccountNotificationSettingsId(dto.accountId, dto.daoId);
    return this.accountNotificationSettingsRepository.save({
      id,
      accountId: dto.accountId,
      daoId: dto.daoId,
      types: dto.types,
      mutedUntilTimestamp: Number(dto.mutedUntilTimestamp),
      isAllMuted: dto.isAllMuted,
      enableSms: !!dto.enableSms,
      enableEmail: !!dto.enableEmail,
    });
  }
}
