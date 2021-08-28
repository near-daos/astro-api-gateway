import { FindManyOptions } from 'typeorm';
import { Proposal } from '../entities/proposal.entity';

export class ProposalSortParam implements FindManyOptions<Proposal> {}
