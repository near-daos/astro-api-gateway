import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

import { AccountNotificationDto, UpdateAccountNotificationDto } from './dto';
import { AccountNotification } from './entities';

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
      throw new BadRequestException('Invalid Account Notification ID');
    }

    return this.accountNotificationRepository.save({
      ...accountNotification,
      isMuted: updateDto.isMuted,
      isRead: updateDto.isRead,
      isArchived: updateDto.isArchived,
    });
  }
}
