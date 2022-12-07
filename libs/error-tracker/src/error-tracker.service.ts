import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ErrorEntity } from './entities';
import { ErrorStatus, ErrorType } from './types';

@Injectable()
export class ErrorTrackerService {
  constructor(
    @InjectRepository(ErrorEntity)
    private readonly errorRepository: Repository<ErrorEntity>,
  ) {}

  create(error: Partial<ErrorEntity>) {
    return this.errorRepository.save(error);
  }

  getOpenErrors(type: ErrorType) {
    return this.errorRepository.find({
      where: { type, status: ErrorStatus.Open },
      order: { timestamp: 'ASC' },
    });
  }

  setErrorStatus(id: string, status: ErrorStatus) {
    return this.errorRepository.update(id, { status });
  }

  getErrorById(id: string) {
    return this.errorRepository.findOne(id);
  }

  async getOpenErrorsIds() {
    return (
      await this.errorRepository.find({
        select: ['id'],
        where: { status: ErrorStatus.Open },
        order: { timestamp: 'ASC' },
      })
    ).map(({ id }) => id);
  }
}
