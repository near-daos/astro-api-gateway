import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { app } from 'firebase-admin';
import { Repository } from 'typeorm';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  private firebaseApp: app.App;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {
    this.firebaseApp = configService.get('firebase')
  }

  async notifyDaoSubscribers(daoId: string): Promise<string> {
    const subscriptions = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .where("subscription.dao_id = :daoId", { daoId})
      .getMany();

    if (!subscriptions.length) {
      return;
    }

    const messages = subscriptions.map(({ token }) =>
      ({
        notification: {
          title: `'${daoId}' update`
        },
        token
      }));

    this.logger.log('Sending notifications...');

    try {
      const response = await this.firebaseApp.messaging().sendAll(messages);

      const errors = response.responses
        .filter(({ success }) => !success)
        .map(({ error }) => error);

      if (errors.length) {
        errors.map(error => this.logger.error(error));
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
