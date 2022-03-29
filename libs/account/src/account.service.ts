import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotifiClientService } from '@sputnik-v2/notifi-client';
import { OtpService } from '@sputnik-v2/otp';

import { AccountDto, AccountEmailDto, AccountPhoneDto } from './dto';
import { Account } from './entities';
import {
  AccountResponse,
  castAccountResponse,
  VerificationStatus,
} from './types';
import { AccountNotification } from '@sputnik-v2/notification';

@Injectable()
export class AccountService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly notifiClientService: NotifiClientService,
    private readonly otpService: OtpService,
  ) {}

  async create(addAccountDto: AccountDto): Promise<Account> {
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

  async getAccount(accountId: string): Promise<AccountResponse> {
    const account = await this.accountRepository.findOne(accountId);
    return castAccountResponse(accountId, account);
  }

  async createAccountEmail(
    accountEmailDto: AccountEmailDto,
  ): Promise<AccountResponse> {
    await this.accountRepository.save({
      ...accountEmailDto,
      isEmailVerified: false,
    });
    return this.getAccount(accountEmailDto.accountId);
  }

  async createAccountPhone(
    accountPhoneDto: AccountPhoneDto,
  ): Promise<AccountResponse> {
    await this.accountRepository.save({
      ...accountPhoneDto,
      isPhoneVerified: false,
    });
    return this.getAccount(accountPhoneDto.accountId);
  }

  // TODO: This is temporary workaround due to Notifi service limitations. Refactor this after Notifi updates
  async createNotifiAlert(
    accountId: string,
    isEmail: boolean,
    isPhone: boolean,
  ): Promise<Account> {
    let account = await this.accountRepository.findOne(accountId);

    if (!account.notifiUserId) {
      const notifiUserId = await this.notifiClientService.createUser(accountId);
      account = await this.accountRepository.save({
        ...account,
        notifiUserId,
      });
    }

    if (account.notifiAlertId) {
      await this.notifiClientService.deleteAlert(account.notifiAlertId);
      await this.accountRepository.save({
        ...account,
        notifiAlertId: '',
      });
    }

    const notifiAlertId = await this.notifiClientService.createAlert(
      account.notifiUserId,
      isEmail ? account.email : undefined,
      isPhone ? account.phoneNumber : undefined,
    );

    return this.accountRepository.save({
      ...account,
      notifiAlertId,
    });
  }

  async sendEmail(accountId: string, message: string): Promise<void> {
    const account = await this.createNotifiAlert(accountId, true, false);

    if (!account.email) {
      throw new BadRequestException(`No email found for account: ${accountId}`);
    }

    console.log(`Email: ${account.email} message: ${message}`);
    return;
    // return this.notifiClientService.sendMessage(accountId, message);
  }

  async sendSms(accountId: string, message: string): Promise<void> {
    const account = await this.createNotifiAlert(accountId, false, true);

    if (!account.phoneNumber) {
      throw new BadRequestException(
        `No phone number found for account: ${accountId}`,
      );
    }

    console.log(`Phone: ${account.phoneNumber} message: ${message}`);
    return;
    // return this.notifiClientService.sendMessage(accountId, message);
  }

  async sendNotification(
    accountNotification: AccountNotification,
    message: string,
  ) {
    const account = await this.accountRepository.findOne(
      accountNotification.accountId,
    );
    const isEmail = accountNotification.isEmail && account?.isEmailVerified;
    const isPhone = accountNotification.isPhone && account?.isPhoneVerified;

    if (isEmail || isPhone) {
      await this.createNotifiAlert(
        accountNotification.accountId,
        isEmail,
        isPhone,
      );
      console.log(isEmail ? `Email: ${account.email} message: ${message}` : '');
      console.log(
        isPhone ? `Phone: ${account.phoneNumber} message: ${message}` : '',
      );

      // await this.notifiClientService.sendMessage(
      //   accountNotification.accountId,
      //   message,
      // );
    }
  }

  async sendEmailVerification(accountId: string): Promise<VerificationStatus> {
    const account = await this.getAccount(accountId);

    if (!account.email) {
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

    await this.sendEmail(accountId, `Email verification code: ${code}`);

    return this.getEmailVerificationStatus(accountId);
  }

  async getEmailVerificationStatus(
    accountId: string,
  ): Promise<VerificationStatus> {
    const account = await this.accountRepository.findOne(accountId);

    if (!account.email) {
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
    const account = await this.accountRepository.findOne(accountId);

    if (!account.email) {
      throw new BadRequestException(`No email found for account: ${accountId}`);
    }

    const isVerified = await this.otpService.verifyOtp(account.email, code);

    if (!isVerified) {
      throw new BadRequestException(`Invalid verification code: ${code}`);
    }

    await this.accountRepository.save({
      ...account,
      isEmailVerified: isVerified,
    });
  }

  async sendPhoneVerification(accountId: string): Promise<VerificationStatus> {
    const account = await this.getAccount(accountId);

    if (!account.phoneNumber) {
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

    await this.sendSms(accountId, `Phone verification code: ${code}`);

    return this.getPhoneVerificationStatus(accountId);
  }

  async getPhoneVerificationStatus(
    accountId: string,
  ): Promise<VerificationStatus> {
    const account = await this.accountRepository.findOne(accountId);

    if (!account.phoneNumber) {
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
    const account = await this.accountRepository.findOne(accountId);

    if (!account.phoneNumber) {
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

    await this.accountRepository.save({
      ...account,
      isPhoneVerified: isVerified,
    });
  }
}
