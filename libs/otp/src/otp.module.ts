import { CacheModule, Module } from '@nestjs/common';
import { OTP_TTL } from '@sputnik-v2/common';

import { OtpService } from './otp.service';

@Module({
  imports: [CacheModule.register({ ttl: OTP_TTL })],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
