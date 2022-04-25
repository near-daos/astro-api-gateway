import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AccountEmailDto,
  AccountPhoneDto,
  AccountResponse,
  AccountService,
  AccountVerificationDto,
  VerificationStatus,
} from '@sputnik-v2/account';
import {
  AccountAccessGuard,
  AccountBearer,
  FindAccountParams,
  HttpCacheInterceptor,
  ValidAccountGuard,
} from '@sputnik-v2/common';

@ApiTags('Account')
@Controller('/account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @ApiParam({
    name: 'accountId',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Account',
    type: AccountResponse,
  })
  @ApiNotFoundResponse({
    description: 'Account does not exist',
  })
  @UseInterceptors(HttpCacheInterceptor)
  @UseGuards(ValidAccountGuard)
  @Get('/:accountId')
  async accountById(
    @Param() { accountId }: FindAccountParams,
  ): Promise<AccountResponse> {
    return this.accountService.getAccount(accountId);
  }

  @ApiResponse({
    status: 201,
    description: 'Created',
    type: AccountResponse,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature',
  })
  @UseGuards(AccountAccessGuard)
  @Post('/email')
  async setAccountEmail(
    @Body() accountEmailDto: AccountEmailDto,
  ): Promise<AccountResponse> {
    return this.accountService.createAccountEmail(accountEmailDto);
  }

  @ApiResponse({
    status: 201,
    description: 'Email Verification Status',
    type: VerificationStatus,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature',
  })
  @ApiBadRequestResponse({
    description:
      'No email found for account / Email is already verified / Email verification already sent. Could be resend after 60 seconds',
  })
  @UseGuards(AccountAccessGuard)
  @Post('/email/send-verification')
  async accountEmailSendVerification(
    @Body() body: AccountBearer,
  ): Promise<VerificationStatus> {
    return this.accountService.sendEmailVerification(body.accountId);
  }

  @ApiResponse({
    status: 201,
    description: 'Verified',
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature',
  })
  @ApiBadRequestResponse({
    description: 'No email found for account / Invalid verification code',
  })
  @UseGuards(AccountAccessGuard)
  @Post('/email/verify')
  async verifyEmail(
    @Body() accountVerificationDto: AccountVerificationDto,
  ): Promise<void> {
    return this.accountService.verifyEmail(
      accountVerificationDto.accountId,
      accountVerificationDto.code,
    );
  }

  @ApiParam({
    name: 'accountId',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Email Verification Status',
    type: VerificationStatus,
  })
  @ApiNotFoundResponse({
    description: 'Account does not exist',
  })
  @ApiBadRequestResponse({
    description: 'No email found for account',
  })
  @UseGuards(ValidAccountGuard)
  @Get('/:accountId/email/verification-status')
  async accountEmailStatus(
    @Param() { accountId }: FindAccountParams,
  ): Promise<VerificationStatus> {
    return this.accountService.getEmailVerificationStatus(accountId);
  }

  @ApiResponse({
    status: 201,
    description: 'Created',
    type: AccountResponse,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature',
  })
  @UseGuards(AccountAccessGuard)
  @Post('/phone')
  async setAccountPhone(
    @Body() accountPhoneDto: AccountPhoneDto,
  ): Promise<AccountResponse> {
    return this.accountService.createAccountPhone(accountPhoneDto);
  }

  @ApiResponse({
    status: 201,
    description: 'Phone Verification Status',
    type: VerificationStatus,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature',
  })
  @ApiBadRequestResponse({
    description:
      'No phone number found for account / Phone is already verified / Phone verification already sent. Could be resend after 60 seconds',
  })
  @UseGuards(AccountAccessGuard)
  @Post('/phone/send-verification')
  async accountPhoneSendVerification(
    @Body() body: AccountBearer,
  ): Promise<VerificationStatus> {
    return this.accountService.sendPhoneVerification(body.accountId);
  }

  @ApiResponse({
    status: 201,
    description: 'Verified',
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature',
  })
  @ApiBadRequestResponse({
    description:
      'No phone number found for account / Invalid verification code',
  })
  @UseGuards(AccountAccessGuard)
  @Post('/phone/verify')
  async verifyPhone(
    @Body() accountVerificationDto: AccountVerificationDto,
  ): Promise<void> {
    return this.accountService.verifyPhone(
      accountVerificationDto.accountId,
      accountVerificationDto.code,
    );
  }

  @ApiParam({
    name: 'accountId',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Phone Verification Status',
    type: VerificationStatus,
  })
  @ApiNotFoundResponse({
    description: 'Account does not exist',
  })
  @ApiBadRequestResponse({
    description: 'No phone number found for account',
  })
  @UseGuards(ValidAccountGuard)
  @Get('/:accountId/phone/verification-status')
  async accountPhoneStatus(
    @Param() { accountId }: FindAccountParams,
  ): Promise<VerificationStatus> {
    return this.accountService.getPhoneVerificationStatus(accountId);
  }
}
