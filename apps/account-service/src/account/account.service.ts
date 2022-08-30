import { Injectable } from '@nestjs/common';
import { MongoRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Account } from './entities';
import { SearchDto } from '../common/dto/search.dto';
import { AccountsResponse } from './dto/account.dto';
import { Order } from '../common/types/order';
import { DB_CONNECTION } from '../common/constants';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account, DB_CONNECTION)
    private accountRepository: MongoRepository<Account>,
  ) {}

  async getAll(params: SearchDto): Promise<AccountsResponse> {
    const {
      limit = 10,
      offset = 0,

      search,
      orderBy = 'createdAt',
      order = Order.DESC,
    } = params;
    const queries = [];

    if (search) {
      const searchRegExp = new RegExp(search.trim(), 'i');
      queries.push({
        $or: [
          { title: { $regex: searchRegExp } },
          { description: { $regex: searchRegExp } },
        ],
      });
    }

    const [data, total] = await this.accountRepository.findAndCount({
      where: queries.length ? { $and: queries } : {},
      order: { [orderBy]: order },
      take: limit,
      skip: offset,
    });
    return {
      limit,
      offset,
      total,
      data: data.map((item) => item), // TODO: add casting
    };
  }

  async findOne(id: string): Promise<Account | undefined> {
    return this.accountRepository.findOne(id);
  }
}
