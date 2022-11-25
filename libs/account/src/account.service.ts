import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotifiClientService,
  NotifiTemplate,
  NotifiTemplateMessageDto,
} from '@sputnik-v2/notifi-client';
import { OtpService } from '@sputnik-v2/otp';

import { AccountDto, AccountEmailDto, AccountPhoneDto } from './dto';
import { Account } from './entities';
import {
  AccountResponse,
  castAccountResponse,
  VerificationStatus,
} from './types';
import { AccountNotification } from '@sputnik-v2/notification';
import { DynamodbService } from '@sputnik-v2/dynamodb/dynamodb.service';
import { DynamoEntityType } from '@sputnik-v2/dynamodb/types';
import {
  AccountModel,
  mapAccountDtoToAccountModel,
} from '@sputnik-v2/dynamodb/models';
import { FeatureFlagsService } from '@sputnik-v2/feature-flags/feature-flags.service';
import { FeatureFlags } from '@sputnik-v2/feature-flags/types';

@Injectable()
export class AccountService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly notifiClientService: NotifiClientService,
    private readonly otpService: OtpService,
    private readonly dynamoDbService: DynamodbService,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {}

  async useDynamoDB() {
    return this.featureFlagsService.check(FeatureFlags.NotificationDynamo);
  }

  async create(addAccountDto: AccountDto): Promise<Account> {
    await this.dynamoDbService.saveItem<AccountModel>(
      mapAccountDtoToAccountModel(addAccountDto),
    );
    return this.accountRepository.save(addAccountDto);
  }

  async remove(accountId: string): Promise<void> {
    const deleteResponse = await this.accountRepository.delete({ accountId });

    if (!deleteResponse.affected) {
      throw new NotFoundException(
        `Account with accountId ${accountId} not found`,
      );
    }
  }

  async findById(accountId: string): Promise<Account | AccountModel> {
    if (await this.useDynamoDB()) {
      return (await this.dynamoDbService.getItemByType<AccountModel>(
        accountId,
        DynamoEntityType.Account,
        accountId,
      )) as AccountModel;
    } else {
      return this.accountRepository.findOne(accountId);
    }
  }

  async getAccount(accountId: string): Promise<AccountResponse> {
    const account = await this.findById(accountId);
    return castAccountResponse(accountId, account);
  }

  async createAccountEmail(
    accountId: string,
    accountEmailDto: AccountEmailDto,
  ): Promise<AccountResponse> {
    await this.create({
      ...accountEmailDto,
      accountId,
      isEmailVerified: false,
    });
    await this.createNotifiAlert(accountId);
    return this.getAccount(accountId);
  }

  async createAccountPhone(
    accountId: string,
    accountPhoneDto: AccountPhoneDto,
  ): Promise<AccountResponse> {
    await this.create({
      ...accountPhoneDto,
      accountId,
      isPhoneVerified: false,
    });
    await this.createNotifiAlert(accountId);
    return this.getAccount(accountId);
  }

  async createNotifiAlert(accountId: string): Promise<Account> {
    let account = await this.accountRepository.findOne(accountId);

    if (!account?.notifiUserId) {
      const notifiUserId = await this.notifiClientService.createUser(accountId);
      account = await this.create({
        ...account,
        notifiUserId,
      });
    }

    if (account.notifiAlertId) {
      await this.notifiClientService.deleteAlert(account.notifiAlertId);
      await this.create({
        ...account,
        notifiAlertId: '',
      });
    }

    const notifiAlertId = await this.notifiClientService.createAlert(
      account.notifiUserId,
      account.email,
      account.phoneNumber,
    );

    return this.create({
      ...account,
      notifiAlertId,
    });
  }

  async sendNotification(
    accountNotification: AccountNotification,
    template: NotifiTemplateMessageDto,
  ) {
    const account = await this.findById(accountNotification.accountId);
    const isEmail = accountNotification.isEmail && account?.isEmailVerified;
    const isPhone = accountNotification.isPhone && account?.isPhoneVerified;

    if (isEmail || isPhone) {
      await this.notifiClientService.sendTemplateMessage(
        accountNotification.accountId,
        accountNotification.notificationId,
        {
          emailTemplate: isEmail ? template.emailTemplate : undefined,
          smsTemplate: isPhone ? template.smsTemplate : undefined,
          variables: template.variables,
        },
      );
    }
  }

  async sendEmailVerification(accountId: string): Promise<VerificationStatus> {
    const account = await this.findById(accountId);

    if (!account?.email) {
      throw new BadRequestException(`No email found for account: ${accountId}`);
    }

    if (account.isEmailVerified) {
      throw new BadRequestException(`Email is already verified`);
    }

    const otp = await this.otpService.getOtp(account.email);

    if (otp && Date.now() - otp.createdAt < 60000) {
      throw new BadRequestException(
        `Email verification already sent. Could be resend after 60 seconds`,
      );
    }

    const code = await this.otpService.createOtp(account.email);

    await this.notifiClientService.sendTemplateMessage(accountId, code, {
      emailTemplate: NotifiTemplate.Verification,
      variables: { code },
    });

    return this.getEmailVerificationStatus(accountId);
  }

  async getEmailVerificationStatus(
    accountId: string,
  ): Promise<VerificationStatus> {
    const account = await this.findById(accountId);

    if (!account?.email) {
      throw new BadRequestException(`No email found for account: ${accountId}`);
    }

    if (account.isEmailVerified) {
      return { isVerified: true };
    }

    const otp = await this.otpService.getOtp(account.email);

    return {
      isVerified: false,
      isSend: !!otp,
      createdAt: otp?.createdAt,
      ttl: otp?.ttl,
    };
  }

  async verifyEmail(accountId: string, code: string): Promise<void> {
    const account = await this.findById(accountId);

    if (!account?.email) {
      throw new BadRequestException(`No email found for account: ${accountId}`);
    }

    const isVerified = await this.otpService.verifyOtp(account.email, code);

    if (!isVerified) {
      throw new BadRequestException(`Invalid verification code: ${code}`);
    }

    await this.create({
      ...account,
      isEmailVerified: isVerified,
    });
  }

  async sendPhoneVerification(accountId: string): Promise<VerificationStatus> {
    const account = await this.findById(accountId);

    if (!account?.phoneNumber) {
      throw new BadRequestException(
        `No phone number found for account: ${accountId}`,
      );
    }

    if (account.isPhoneVerified) {
      throw new BadRequestException(`Phone is already verified`);
    }

    const otp = await this.otpService.getOtp(account.phoneNumber);

    if (otp && Date.now() - otp.createdAt < 60000) {
      throw new BadRequestException(
        `Phone verification already sent. Could be resend after 60 seconds`,
      );
    }

    const code = await this.otpService.createOtp(account.phoneNumber);

    await this.notifiClientService.sendTemplateMessage(accountId, otp.hash, {
      smsTemplate: NotifiTemplate.Verification,
      variables: { code },
    });

    return this.getPhoneVerificationStatus(accountId);
  }

  async getPhoneVerificationStatus(
    accountId: string,
  ): Promise<VerificationStatus> {
    const account = await this.findById(accountId);

    if (!account?.phoneNumber) {
      throw new BadRequestException(
        `No phone number found for account: ${accountId}`,
      );
    }

    if (account.isPhoneVerified) {
      return { isVerified: true };
    }

    const otp = await this.otpService.getOtp(account.phoneNumber);

    return {
      isVerified: false,
      isSend: !!otp,
      createdAt: otp?.createdAt,
      ttl: otp?.ttl,
    };
  }

  async verifyPhone(accountId: string, code: string): Promise<void> {
    const account = await this.findById(accountId);

    if (!account?.phoneNumber) {
      throw new BadRequestException(
        `No phone number found for account: ${accountId}`,
      );
    }

    const isVerified = await this.otpService.verifyOtp(
      account.phoneNumber,
      code,
    );

    if (!isVerified) {
      throw new BadRequestException(`Invalid verification code: ${code}`);
    }

    await this.create({
      ...account,
      isPhoneVerified: isVerified,
    });
  }
}
