import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { app, messaging } from 'firebase-admin';
import { In, Repository } from 'typeorm';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';
import { Account } from 'src/account/entities/account.entity';
import { Dao } from 'src/daos/entities/dao.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  private firebaseApp: app.App;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Dao)
    private readonly daoRepository: Repository<Dao>,
  ) {
    this.firebaseApp = configService.get('firebase');
  }

  async notifyDaoCouncelors(daoId: string): Promise<messaging.BatchResponse> {
    const dao: Dao = await this.daoRepository.findOne(daoId);
    if (!dao) {
      return;
    }

    const accounts = await this.accountRepository.find({
      accountId: In(dao.council),
    });

    if (!accounts || !accounts.length) {
      return;
    }

    const messages = accounts.map(({ token }) => ({
      notification: {
        title: `'${daoId}' update`,
      },
      token,
    }));

    this.logger.log('Sending notifications to Dao councelors...');

    return this.sendNotifications(messages);
  }

  async notifyDaoSubscribers(daoId: string): Promise<messaging.BatchResponse> {
    const subscriptions = await this.subscriptionRepository.find({
      where: {
        dao: {
          id: daoId,
        },
      },
    });

    if (!subscriptions.length) {
      return;
    }

    const messages = subscriptions.map(({ account }) => ({
      notification: {
        title: `'${daoId}' update`,
      },
      token: account.token,
    }));

    this.logger.log('Sending notifications to Dao subscribers...');

    return this.sendNotifications(messages);
  }

  private async sendNotifications(
    messages: any[],
  ): Promise<messaging.BatchResponse> {
    try {
      const response = await this.firebaseApp.messaging().sendAll(messages);

      const errors = response.responses
        .filter(({ success }) => !success)
        .map(({ error }) => error);

      if (errors.length) {
        errors.map((error) => this.logger.error(error));
      }

      return response;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
