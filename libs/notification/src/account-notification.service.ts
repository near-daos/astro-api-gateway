import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

import {
  AccountNotificationDto,
  NotificationStatusResponse,
  UpdateAccountNotificationDto,
} from './dto';
import { AccountNotification } from './entities';
import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult';

@Injectable()
export class AccountNotificationService extends TypeOrmCrudService<AccountNotification> {
  constructor(
    @InjectRepository(AccountNotification)
    private readonly accountNotificationRepository: Repository<AccountNotification>,
  ) {
    super(accountNotificationRepository);
  }

  async createMultiple(
    accountNotificationsDto: AccountNotificationDto[],
  ): Promise<AccountNotification[]> {
    return this.accountNotificationRepository.save(accountNotificationsDto);
  }

  async updateAccountNotification(
    id: string,
    updateDto: UpdateAccountNotificationDto,
  ): Promise<AccountNotification> {
    const accountNotification =
      await this.accountNotificationRepository.findOne(id);

    if (!accountNotification) {
      throw new BadRequestException(`Account Notification ${id} not found`);
    }

    return this.accountNotificationRepository.save({
      ...accountNotification,
      isMuted: updateDto.isMuted,
      isRead: updateDto.isRead,
      isArchived: updateDto.isArchived,
    });
  }

  async readAccountNotifications(accountId: string): Promise<UpdateResult> {
    return this.accountNotificationRepository
      .createQueryBuilder()
      .update()
      .set({ isRead: true })
      .where({
        accountId,
        isRead: false,
      })
      .execute();
  }

  async archiveAccountNotifications(accountId: string): Promise<UpdateResult> {
    return this.accountNotificationRepository
      .createQueryBuilder()
      .update()
      .set({ isArchived: true })
      .where({
        accountId,
        isArchived: false,
      })
      .execute();
  }

  async getAccountNotificationStatus(
    accountId: string,
  ): Promise<NotificationStatusResponse> {
    const unreadCount = await this.accountNotificationRepository
      .createQueryBuilder()
      .where({
        accountId,
        isRead: false,
      })
      .getCount();
    return {
      accountId,
      unreadCount,
    };
  }
}
