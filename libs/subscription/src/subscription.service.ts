import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dao } from '@sputnik-v2/dao';
import { buildSubscriptionId } from '@sputnik-v2/utils';

import { SubscriptionDto } from './dto';
import { Subscription } from './entities';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
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

    return this.subscriptionRepository.save(subscription);
  }

  async remove(id: string): Promise<void> {
    const deleteResponse = await this.subscriptionRepository.delete({ id });

    if (!deleteResponse.affected) {
      throw new NotFoundException(`Subscription with id ${id} not found`);
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
