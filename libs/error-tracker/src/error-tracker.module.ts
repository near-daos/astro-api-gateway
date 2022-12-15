import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureFlagsModule } from '@sputnik-v2/feature-flags/feature-flags.module';
import { DynamodbModule } from '@sputnik-v2/dynamodb/dynamodb.module';
import { ErrorTrackerService } from './error-tracker.service';
import { ErrorTrackerDynamoService } from './error-tracker-dynamo.service';
import { ErrorEntity } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([ErrorEntity]),
    FeatureFlagsModule,
    DynamodbModule,
  ],
  providers: [ErrorTrackerService, ErrorTrackerDynamoService],
  exports: [ErrorTrackerService, ErrorTrackerDynamoService],
})
export class ErrorTrackerModule {}
