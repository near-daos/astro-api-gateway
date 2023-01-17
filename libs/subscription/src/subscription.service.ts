import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dao } from '@sputnik-v2/dao';
import { buildSubscriptionId } from '@sputnik-v2/utils';
import {
  DaoModel,
  DynamodbService,
  DynamoEntityType,
} from '@sputnik-v2/dynamodb';

import { SubscriptionDto } from './dto';
import { Subscription } from './entities';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly dynamoDbService: DynamodbService,
  ) {}

  async create(
    accountId: string,
    addSubscriptionDto: SubscriptionDto,
  ): Promise<Subscription> {
    const { daoId } = addSubscriptionDto;

    const subscription = new Subscription();
    subscription.id = buildSubscriptionId(daoId, accountId);

    const dao = { id: daoId } as Dao;
    subscription.dao = dao;
    subscription.accountId = accountId;

    const daoModel = await this.dynamoDbService.getItemByType<DaoModel>(
      daoId,
      DynamoEntityType.Dao,
      daoId,
    );

    if (!daoModel) {
      throw new BadRequestException(
        `No DAO '${daoId}' and/or Account '${accountId}' found.`,
      );
    }

    const followers = daoModel.followers || [];

    await this.dynamoDbService.saveItem<DaoModel>({
      ...daoModel,
      followers: [...followers, accountId],
    });

    return this.subscriptionRepository.save(subscription);
  }

  async remove(daoId: string, accountId: string): Promise<void> {
    const daoModel = await this.dynamoDbService.getItemByType<DaoModel>(
      daoId,
      DynamoEntityType.Dao,
      daoId,
    );
    const followers = daoModel.followers || [];

    await this.dynamoDbService.saveItem<DaoModel>({
      ...daoModel,
      followers: followers.filter((item) => item !== accountId),
    });

    const deleteResponse = await this.subscriptionRepository.delete({
      daoId,
      accountId,
    });

    if (!deleteResponse.affected) {
      throw new NotFoundException(
        `Subscription with daoId ${daoId} and accountId ${accountId} not found`,
      );
    }
  }

  async getDaoSubscribers(daoId: string): Promise<string[]> {
    const subscriptions = await this.subscriptionRepository.find({ daoId });
    return subscriptions.map(({ accountId }) => accountId);
  }

  async getAccountSubscriptions(accountId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({ accountId });
  }
}
