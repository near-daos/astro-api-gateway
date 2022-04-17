import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { OtpService } from './otp.service';
import { OTP } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([OTP]), ScheduleModule.forRoot()],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
