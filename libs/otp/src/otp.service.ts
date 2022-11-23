import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MoreThan, Repository, DeleteResult, LessThan } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { OTP_TTL } from '@sputnik-v2/common';
import { FeatureFlagsService } from '@sputnik-v2/feature-flags/feature-flags.service';
import { DynamodbService } from '@sputnik-v2/dynamodb/dynamodb.service';

import { OtpItem } from './types';
import { OTP } from './entities';
import {
  DynamoEntityType,
  mapOtpToOtpModel,
  OtpModel,
} from '@sputnik-v2/dynamodb';
import { FeatureFlags } from '@sputnik-v2/feature-flags/types';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(OTP)
    private readonly otpRepository: Repository<OTP>,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly dynamoDbService: DynamodbService,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {
    schedulerRegistry.addInterval(
      'clear_expired_otp',
      setInterval(() => this.deleteExpired(), OTP_TTL * 1000),
    );
  }

  async useDynamoDB() {
    return this.featureFlagsService.check(FeatureFlags.NotificationDynamo);
  }

  async createOtp(key: string, otpLength?: number): Promise<string> {
    const otp = OtpService.generateOtp(otpLength);
    const hash = await bcrypt.hash(otp, 10);
    const createdAt = Date.now();
    const entity = {
      key: OtpService.buildKey(key),
      hash,
      createdAt,
      ttl: Math.round(createdAt / 1000) + OTP_TTL,
    };

    await this.dynamoDbService.saveItem<OtpModel>(mapOtpToOtpModel(entity));
    await this.otpRepository.save(entity);
    return otp;
  }

  async getOtp(key: string): Promise<OtpItem> {
    const id = OtpService.buildKey(key);
    const expireTime = Date.now() - OTP_TTL;
    if (await this.useDynamoDB()) {
      const otp = await this.dynamoDbService.getItemByType<OtpModel>(
        DynamoEntityType.Otp,
        DynamoEntityType.Otp,
        id,
      );
      return otp?.createdAt > expireTime ? otp : null;
    } else {
      return this.otpRepository.findOne({
        key: id,
        createdAt: MoreThan(expireTime),
      });
    }
  }

  async verifyOtp(key: string, otpToVerify: string): Promise<boolean> {
    const otp = await this.getOtp(key);
    return !!otp && bcrypt.compare(otpToVerify, otp.hash);
  }

  async deleteExpired(): Promise<DeleteResult> {
    const expireTime = Date.now() - OTP_TTL * 1000;
    const expiredOtps = await this.dynamoDbService.queryItemsByType<OtpModel>(
      DynamoEntityType.Otp,
      DynamoEntityType.Otp,
      {
        FilterExpression: 'createdAt < :expireTime',
        ExpressionAttributeValues: {
          ':expireTime': expireTime,
        },
      },
    );
    await this.dynamoDbService.batchDelete(expiredOtps);
    return this.otpRepository.delete({
      createdAt: LessThan(expireTime),
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
