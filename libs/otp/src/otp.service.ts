import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MoreThan, Repository, DeleteResult, LessThan } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { OTP_TTL } from '@sputnik-v2/common';

import { OtpItem } from './types';
import { OTP } from './entities';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(OTP)
    private readonly otpRepository: Repository<OTP>,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    schedulerRegistry.addInterval(
      'clear_expired_otp',
      setInterval(() => this.deleteExpired(), OTP_TTL),
    );
  }

  async createOtp(key: string, otpLength?: number): Promise<string> {
    const otp = OtpService.generateOtp(otpLength);
    const hash = await bcrypt.hash(otp, 10);
    const createdAt = Date.now();

    await this.otpRepository.save({
      key: OtpService.buildKey(key),
      hash,
      createdAt,
      ttl: OTP_TTL,
    });
    return otp;
  }

  async getOtp(key: string): Promise<OtpItem> {
    return this.otpRepository.findOne({
      key: OtpService.buildKey(key),
      createdAt: MoreThan(Date.now() - OTP_TTL),
    });
  }

  async verifyOtp(key: string, otpToVerify: string): Promise<boolean> {
    const otp = await this.getOtp(key);
    return !!otp && bcrypt.compare(otpToVerify, otp.hash);
  }

  async deleteExpired(): Promise<DeleteResult> {
    return this.otpRepository.delete({
      createdAt: LessThan(Date.now() - OTP_TTL),
    });
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
