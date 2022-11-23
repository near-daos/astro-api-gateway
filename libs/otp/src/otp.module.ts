import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { FeatureFlagsModule } from '@sputnik-v2/feature-flags/feature-flags.module';
import { DynamodbModule } from '@sputnik-v2/dynamodb/dynamodb.module';

import { OtpService } from './otp.service';
import { OTP } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([OTP]),
    ScheduleModule.forRoot(),
    FeatureFlagsModule,
    DynamodbModule,
  ],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
