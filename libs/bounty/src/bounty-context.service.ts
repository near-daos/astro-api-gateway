import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';

import { BountyContextDto } from './dto';
import { BountyContext } from './entities';

@Injectable()
export class BountyContextService extends TypeOrmCrudService<BountyContext> {
  constructor(
    @InjectRepository(BountyContext)
    private readonly bountyContextRepository: Repository<BountyContext>,
  ) {
    super(bountyContextRepository);
  }

  async create(bountyContextDto: BountyContextDto): Promise<BountyContext> {
    return this.bountyContextRepository.save(bountyContextDto);
  }

  async createMultiple(
    bountyContextDtos: BountyContextDto[],
  ): Promise<BountyContext[]> {
    return this.bountyContextRepository.save(bountyContextDtos);
  }
}
