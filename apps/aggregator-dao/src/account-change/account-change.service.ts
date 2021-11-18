import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { AccountChange } from '@sputnik-v2/near-indexer';

@Injectable()
export class AccountChangeService extends TypeOrmCrudService<AccountChange> {
  constructor(
    @InjectRepository(AccountChange)
    private readonly accountChangeRepository: Repository<AccountChange>,
  ) {
    super(accountChangeRepository);
  }

  create(accountChange: AccountChange): Promise<AccountChange> {
    return this.accountChangeRepository.save(accountChange);
  }

  lastAccountChange(): Promise<AccountChange> {
    return this.accountChangeRepository.findOne({
      order: { changedInBlockTimestamp: 'DESC' },
    });
  }
}
