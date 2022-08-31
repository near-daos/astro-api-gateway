import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { buildAccountNotificationSettingsId } from '@sputnik-v2/utils';
import { DaoService } from '@sputnik-v2/dao';

import { CreateAccountNotificationSettingsDto } from './dto';
import { AccountNotificationSettings } from './entities';

@Injectable()
export class AccountNotificationSettingsService extends TypeOrmCrudService<AccountNotificationSettings> {
  constructor(
    @InjectRepository(AccountNotificationSettings)
    private readonly accountNotificationSettingsRepository: Repository<AccountNotificationSettings>,
    private readonly daoService: DaoService,
  ) {
    super(accountNotificationSettingsRepository);
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
    return this.accountNotificationSettingsRepository.save({
      id,
      accountId,
      daoId: dto.daoId,
      types: dto.types,
      mutedUntilTimestamp: Number(dto.mutedUntilTimestamp),
      isAllMuted: dto.isAllMuted,
      enableSms: !!dto.enableSms,
      enableEmail: !!dto.enableEmail,
      actionRequiredOnly: !!dto.actionRequiredOnly,
    });
  }
}
