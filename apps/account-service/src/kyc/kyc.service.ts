import { MongoRepository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { KYCToken } from './entities/kyc-token.entity';
import { DB_CONNECTION } from '../common/constants';

@Injectable()
export class KYCService {
  constructor(
    @InjectRepository(KYCToken, DB_CONNECTION)
    private kycRepository: MongoRepository<KYCToken>,
  ) {}

  // TODO: use DTOs???
  async create(token: KYCToken): Promise<KYCToken> {
    return this.kycRepository.save(token);
  }

  async createMultiple(tokens: KYCToken[]): Promise<KYCToken[]> {
    return this.kycRepository.save(tokens);
  }

  async getCount(): Promise<number> {
    return this.kycRepository.count();
  }
}
