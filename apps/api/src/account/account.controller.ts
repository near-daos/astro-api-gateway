import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Span } from 'nestjs-ddtrace';

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
  AuthorizedRequest,
  FindAccountParams,
  HttpCacheInterceptor,
  ValidAccountGuard,
} from '@sputnik-v2/common';

@Span()
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
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiBadRequestResponse({
    description: 'Invalid email provided',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Post('/email')
  async setAccountEmail(
    @Req() req: AuthorizedRequest,
    @Body() accountEmailDto: AccountEmailDto,
  ): Promise<AccountResponse> {
    return this.accountService.createAccountEmail(
      req.accountId,
      accountEmailDto,
    );
  }

  @ApiResponse({
    status: 201,
    description: 'Email Verification Status',
    type: VerificationStatus,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiBadRequestResponse({
    description:
      'No email found for account / Email is already verified / Email verification already sent. Could be resend after 60 seconds',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Post('/email/send-verification')
  async accountEmailSendVerification(
    @Req() req: AuthorizedRequest,
  ): Promise<VerificationStatus> {
    return this.accountService.sendEmailVerification(req.accountId);
  }

  @ApiResponse({
    status: 201,
    description: 'Verified',
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiBadRequestResponse({
    description: 'No email found for account / Invalid verification code',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Post('/email/verify')
  async verifyEmail(
    @Req() req: AuthorizedRequest,
    @Body() accountVerificationDto: AccountVerificationDto,
  ): Promise<void> {
    return this.accountService.verifyEmail(
      req.accountId,
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
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiBadRequestResponse({
    description: 'Invalid phone provided',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Post('/phone')
  async setAccountPhone(
    @Req() req: AuthorizedRequest,
    @Body() accountPhoneDto: AccountPhoneDto,
  ): Promise<AccountResponse> {
    return this.accountService.createAccountPhone(
      req.accountId,
      accountPhoneDto,
    );
  }

  @ApiResponse({
    status: 201,
    description: 'Phone Verification Status',
    type: VerificationStatus,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiBadRequestResponse({
    description:
      'No phone number found for account / Phone is already verified / Phone verification already sent. Could be resend after 60 seconds',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Post('/phone/send-verification')
  async accountPhoneSendVerification(
    @Req() req: AuthorizedRequest,
  ): Promise<VerificationStatus> {
    return this.accountService.sendPhoneVerification(req.accountId);
  }

  @ApiResponse({
    status: 201,
    description: 'Verified',
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiBadRequestResponse({
    description:
      'No phone number found for account / Invalid verification code',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Post('/phone/verify')
  async verifyPhone(
    @Req() req: AuthorizedRequest,
    @Body() accountVerificationDto: AccountVerificationDto,
  ): Promise<void> {
    return this.accountService.verifyPhone(
      req.accountId,
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
