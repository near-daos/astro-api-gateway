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
  ApiForbiddenResponse,
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
  FindOneParams,
  HttpCacheInterceptor,
} from '@sputnik-v2/common';

@ApiTags('Account')
@Controller('/account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Account',
    type: AccountResponse,
  })
  @UseInterceptors(HttpCacheInterceptor)
  @Get('/:id')
  async accountById(@Param() { id }: FindOneParams): Promise<AccountResponse> {
    return this.accountService.getAccount(id);
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
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Email Verification Status',
    type: VerificationStatus,
  })
  @Get('/:id/email/verification-status')
  async accountEmailStatus(
    @Param() { id }: FindOneParams,
  ): Promise<VerificationStatus> {
    return this.accountService.getEmailVerificationStatus(id);
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
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Phone Verification Status',
    type: VerificationStatus,
  })
  @Get('/:id/phone/verification-status')
  async accountPhoneStatus(
    @Param() { id }: FindOneParams,
  ): Promise<VerificationStatus> {
    return this.accountService.getPhoneVerificationStatus(id);
  }
}
