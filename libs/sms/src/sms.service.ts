import PromisePool from '@supercharge/promise-pool';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { Injectable, Logger } from '@nestjs/common';
import {
  AccountNotification,
  Notification,
  NotificationStatus,
  NotificationType,
} from '@sputnik-v2/notification';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendSmsNotification(
    notification: Notification,
    accountNotifications: AccountNotification[],
  ) {
    const phoneNumbers = [
      ...new Set(
        accountNotifications
          .filter(({ isMuted, phoneNumber }) => !isMuted && phoneNumber)
          .map(({ phoneNumber }) => phoneNumber),
      ),
    ];
    const message = this.getNotificationMessage(notification);

    const { errors } = await PromisePool.withConcurrency(1)
      .for(phoneNumbers)
      .process((phoneNumber) => {
        return this.sendSms(message, phoneNumber);
      });

    this.logger.log(
      `Send notification to phone numbers: ${phoneNumbers}. Errors: ${errors.length}`,
    );
  }

  sendSms(message: string, phoneNumber: string): Promise<MessageInstance> {
    const twilioClient = this.configService.get('twilio.client');
    const twilioPhoneNumber = this.configService.get('twilio.phoneNumber');
    return twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });
  }

  private getNotificationMessage({
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
