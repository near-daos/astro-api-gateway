import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  BadRequestException,
  UseGuards,
  Get,
  Req,
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
  SubscriptionService,
  SubscriptionDto,
  Subscription,
} from '@sputnik-v2/subscription';
import {
  AccountAccessGuard,
  DB_FOREIGN_KEY_VIOLATION,
  FindAccountParams,
  ValidAccountGuard,
  AuthorizedRequest,
} from '@sputnik-v2/common';
import { DeleteSubscriptionParams } from '@sputnik-v2/common/dto/DeleteSubscriptionParams';

@Span()
@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @ApiResponse({
    status: 201,
    description: 'Created',
  })
  @ApiBadRequestResponse({
    description: `No DAO '<addSubscriptionDto.daoId>' and/or Account '<addSubscriptionDto.accountId>' found.`,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Post('/')
  async create(
    @Req() req: AuthorizedRequest,
    @Body() addSubscriptionDto: SubscriptionDto,
  ): Promise<Subscription> {
    try {
      return await this.subscriptionService.create(
        req.accountId,
        addSubscriptionDto,
      );
    } catch (error) {
      if (error.code === DB_FOREIGN_KEY_VIOLATION) {
        throw new BadRequestException(
          `No DAO '${addSubscriptionDto.daoId}' and/or Account '${req.accountId}' found.`,
        );
      }

      throw error;
    }
  }

  @ApiParam({
    name: 'accountId',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of Subscriptions by Account',
    type: Subscription,
  })
  @ApiNotFoundResponse({
    description: 'Account does not exist',
  })
  @UseGuards(ValidAccountGuard)
  @Get('/account-subscriptions/:accountId')
  async getAccountSubscriptions(
    @Param() { accountId }: FindAccountParams,
  ): Promise<Subscription[]> {
    return this.subscriptionService.getAccountSubscriptions(accountId);
  }

  @ApiParam({
    name: 'daoId',
    type: String,
  })
  @ApiParam({
    name: 'accountId',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'OK',
  })
  @ApiNotFoundResponse({
    description: 'Subscription with id <id> not found',
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Delete('/:daoId/:accountId')
  remove(
    @Param()
    { daoId, accountId }: DeleteSubscriptionParams,
  ): Promise<void> {
    return this.subscriptionService.remove(daoId, accountId);
  }
}
