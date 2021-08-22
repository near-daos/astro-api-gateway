import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Dao } from 'src/daos/entities/dao.entity';
import { buildSubscriptionId } from '../utils';
import { Repository } from 'typeorm';
import { SubscriptionDto } from './dto/subscription.dto';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async create(addSubscriptionDto: SubscriptionDto): Promise<Subscription> {
    const { accountId, daoId, token } = addSubscriptionDto;

    const subscriptionId = buildSubscriptionId(daoId, accountId);
    const subscription = new Subscription();

    subscription.id = subscriptionId;
    const dao = { id: daoId } as Dao;
    subscription.dao = dao;

    subscription.accountId = accountId;
    subscription.token = token;

    return this.subscriptionRepository.save(subscription);
  }

  async remove(id: string): Promise<void> {
    const deleteResponse = await this.subscriptionRepository.delete({ id });

    if (!deleteResponse.affected) {
      throw new NotFoundException(`Subscription with id ${id} not found`);
    }
  }
}
