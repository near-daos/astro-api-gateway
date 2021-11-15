import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AccountService,
  AccountDto,
  Account,
  AccountDeleteDto,
} from '@sputnik-v2/account';
import { AccountAccessGuard, DeleteOneParams } from '@sputnik-v2/common';

@ApiTags('Accounts')
@Controller('accounts')
@UseGuards(AccountAccessGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @ApiResponse({
    status: 201,
    description: 'Created',
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature',
  })
  @Post('/')
  async create(@Body() addAccountDto: AccountDto): Promise<Account> {
    return await this.accountService.create(addAccountDto);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'OK',
  })
  @ApiNotFoundResponse({
    description: 'Account with id <id> not found',
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature',
  })
  @Delete('/:id')
  remove(
    @Param() { id }: DeleteOneParams,
    @Body() accountDeleteDto: AccountDeleteDto,
  ): Promise<void> {
    return this.accountService.remove(id);
  }
}
