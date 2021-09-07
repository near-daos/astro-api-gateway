import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Proposal } from './entities/proposal.entity';

@Injectable()
export class ProposalOrmService extends TypeOrmCrudService<Proposal> {
  constructor(
    @InjectRepository(Proposal) proposalRepository: Repository<Proposal>,
  ) {
    super(proposalRepository);
  }
}
