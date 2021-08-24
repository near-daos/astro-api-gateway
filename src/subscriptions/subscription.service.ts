import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dao } from 'src/daos/entities/dao.entity';
import { buildSubscriptionId } from '../utils';
import { Repository } from 'typeorm';
import { SubscriptionDto } from './dto/subscription.dto';
import { Subscription } from './entities/subscription.entity';
import { Account } from 'src/account/entities/account.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async create(addSubscriptionDto: SubscriptionDto): Promise<Subscription> {
    const { accountId, daoId } = addSubscriptionDto;

    const subscription = new Subscription();
    subscription.id = buildSubscriptionId(daoId, accountId);

    const dao = { id: daoId } as Dao;
    subscription.dao = dao;

    const account = { accountId } as Account;
    subscription.account = account;

    return this.subscriptionRepository.save(subscription);
  }

  async remove(id: string): Promise<void> {
    const deleteResponse = await this.subscriptionRepository.delete({ id });

    if (!deleteResponse.affected) {
      throw new NotFoundException(`Subscription with id ${id} not found`);
    }
  }
}
