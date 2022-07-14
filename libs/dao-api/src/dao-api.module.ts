import { Module } from '@nestjs/common';
import { DaoApiService } from './dao-api.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [DaoApiService],
  exports: [DaoApiService],
})
export class DaoApiModule {}
