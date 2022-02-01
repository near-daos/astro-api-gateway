import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dao, RoleKindType } from '@sputnik-v2/dao';

import { Migration } from '..';

@Injectable()
export class DaoGroupFieldsMigration implements Migration {
  private readonly logger = new Logger(DaoGroupFieldsMigration.name);

  constructor(
    @InjectRepository(Dao)
    private readonly daoRepository: Repository<Dao>,
  ) {}

  public async migrate(): Promise<void> {
    this.logger.log('Starting DAO Group Number migration...');

    this.logger.log('Collecting daos...');
    const daos = await this.daoRepository.find();

    this.logger.log('Set DAOs numberOfGroups and accountIds fields...');
    await this.daoRepository.save(
      daos.map((dao) => ({
        ...dao,
        numberOfGroups: dao.policy?.roles.filter(
          (role) => role.kind === RoleKindType.Group,
        ).length,
        accountIds: [
          ...new Set(dao.policy?.roles.map((role) => role.accountIds).flat()),
        ].filter((accountId) => accountId),
      })),
    );
  }
}
