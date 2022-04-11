import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';
import { OTP_TTL } from '@sputnik-v2/common';

import { OtpItem } from './types';

@Injectable()
export class OtpService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async createOtp(key: string, otpLength?: number): Promise<string> {
    const otp = OtpService.generateOtp(otpLength);
    const hash = await bcrypt.hash(otp, 10);
    const createdAt = Date.now();
    await this.cacheManager.set<OtpItem>(OtpService.buildKey(key), {
      hash,
      createdAt,
      ttl: OTP_TTL,
    });
    return otp;
  }

  async getOtp(key: string): Promise<OtpItem> {
    return this.cacheManager.get<OtpItem>(OtpService.buildKey(key));
  }

  async verifyOtp(key: string, otpToVerify: string): Promise<boolean> {
    const otp = await this.getOtp(key);
    return !!otp && bcrypt.compare(otpToVerify, otp.hash);
  }

  private static generateOtp(otpLength = 6) {
    const digits = '0123456789';
    let otp = '';

    for (let i = 1; i <= otpLength; i++) {
      const index = Math.floor(Math.random() * digits.length);
      otp = otp + digits[index];
    }

    return otp;
  }

  private static buildKey(key: string): string {
    return `otp:${key}`;
  }
}
