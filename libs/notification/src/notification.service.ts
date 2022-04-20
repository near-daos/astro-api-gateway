import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

import { Notification } from './entities';
import { NotificationDto } from './dto';
import { NotificationStatus, NotificationType } from './types';

@Injectable()
export class NotificationService extends TypeOrmCrudService<Notification> {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {
    super(notificationRepository);
  }

  async create(notificationDto: NotificationDto): Promise<Notification> {
    const { id } = await this.notificationRepository.save(notificationDto);
    return this.notificationRepository.findOne(id);
  }

  getNotificationMessage({
    type,
    status,
    signerId,
    daoId,
    metadata,
  }: Notification): string {
    const isDaoNotification = [
      NotificationType.CustomDao,
      NotificationType.ClubDao,
      NotificationType.FoundationDao,
      NotificationType.CorporationDao,
      NotificationType.CooperativeDao,
    ].includes(type);

    if (isDaoNotification) {
      return `New DAO "${daoId}" has been successfully created by ${signerId}`;
    }

    const proposerId = signerId ?? metadata?.proposal?.proposer ?? '';

    switch (status) {
      case NotificationStatus.Created:
        return `${proposerId} submitted new "${type}" proposal in the ${daoId} DAO`;
      case NotificationStatus.Rejected:
        return `${proposerId}'s "${type}" proposal was rejected in the ${daoId} DAO`;
      case NotificationStatus.Approved:
        return `${proposerId}'s "${type}" proposal was approved in the ${daoId} DAO`;
      case NotificationStatus.Removed:
        return `${proposerId}'s "${type}" proposal was removed in the ${daoId} DAO`;
      case NotificationStatus.VoteApprove:
        return `${signerId}'s voted to approve ${proposerId}'s "${type}" proposal in the ${daoId} DAO`;
      case NotificationStatus.VoteReject:
        return `${signerId}'s voted to reject ${proposerId}'s "${type}" proposal in the ${daoId} DAO`;
      case NotificationStatus.VoteRemove:
        return `${signerId}'s voted to remove ${proposerId}'s "${type}" proposal in the ${daoId} DAO`;
      default:
        return `Proposal updated in the ${daoId} DAO`;
    }
  }
}
