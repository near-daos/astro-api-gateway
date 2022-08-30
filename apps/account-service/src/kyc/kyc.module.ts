import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DB_CONNECTION } from '../common/constants';

import { NearModule } from '../near';
import { KYCToken } from './entities/kyc-token.entity';
import { KYCNearService } from './kyc-near.service';
import { KYCService } from './kyc.service';

@Module({
  imports: [TypeOrmModule.forFeature([KYCToken], DB_CONNECTION), NearModule],
  providers: [KYCNearService, KYCService],
  exports: [KYCNearService, KYCService],
})
export class KYCModule {}
