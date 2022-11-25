import { OTP } from '@sputnik-v2/otp/entities/OTP.entity';
import { buildEntityId } from '@sputnik-v2/utils';
import { DynamoEntityType } from '../types';
import { BaseModel } from './base.model';

export class OtpModel extends BaseModel {
  key: string;
  hash: string;
  createdAt: number;
  ttl: number;
}

export function mapOtpToOtpModel(otp: OTP): OtpModel {
  return {
    partitionId: DynamoEntityType.Otp,
    entityId: buildEntityId(DynamoEntityType.Otp, otp.key),
    entityType: DynamoEntityType.Otp,
    isArchived: false,
    createTimestamp: Date.now(),
    processingTimeStamp: Date.now(),
    key: otp.key,
    hash: otp.hash,
    createdAt: otp.createdAt,
    ttl: otp.ttl,
  };
}
