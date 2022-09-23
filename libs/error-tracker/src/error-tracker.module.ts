import { Module } from '@nestjs/common';
import { ErrorTrackerService } from './error-tracker.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorEntity } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([ErrorEntity])],
  providers: [ErrorTrackerService],
  exports: [ErrorTrackerService],
})
export class ErrorTrackerModule {}
