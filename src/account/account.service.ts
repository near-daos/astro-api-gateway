import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountDto } from './dto/account.dto';
import { Account } from './entities/Account.entity';

@Injectable()
export class AccountService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async create(addAccountDto: AccountDto): Promise<Account> {
    return this.accountRepository.save(addAccountDto);
  }

  async remove(accountId: string): Promise<void> {
    const deleteResponse = await this.accountRepository.delete({ accountId });

    if (!deleteResponse.affected) {
      throw new NotFoundException(
        `Account with accountId ${accountId} not found`,
      );
    }
  }
}
