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

  async createBountyContext(
    bountyContextDto: BountyContextDto,
  ): Promise<BountyContext> {
    return this.bountyContextRepository.save(bountyContextDto);
  }

  async createBountyContextMultiple(
    bountyContextDtos: BountyContextDto[],
  ): Promise<BountyContext[]> {
    return this.bountyContextRepository.save(bountyContextDtos);
  }
}
