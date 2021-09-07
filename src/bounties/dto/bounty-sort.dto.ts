import { FindManyOptions } from 'typeorm';
import { Bounty } from '../entities/bounty.entity';

export class BountySortParam implements FindManyOptions<Bounty> {}
