import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { SubscriptionService } from './subscription.service';
import { SubscriptionDto } from './dto/subscription.dto';
import { AccountAccessGuard, DeleteOneParams } from 'src/common';
import { Subscription } from './entities/subscription.entity';
import { DB_FOREIGN_KEY_VIOLATION } from 'src/common/constants';
import { SubscriptionDeleteDto } from './dto/subscription-delete.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(AccountAccessGuard)
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
      'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature',
  })
  @Post('/')
  async create(
    @Body() addSubscriptionDto: SubscriptionDto,
  ): Promise<Subscription> {
    try {
      return await this.subscriptionService.create(addSubscriptionDto);
    } catch (error) {
      if (error.code === DB_FOREIGN_KEY_VIOLATION) {
        throw new BadRequestException(
          `No DAO '${addSubscriptionDto.daoId}' and/or Account '${addSubscriptionDto.accountId}' found.`,
        );
      }

      throw error;
    }
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
    description: 'Subscription with id <id> not found',
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature',
  })
  @Delete('/:id')
  remove(
    @Param() { id }: DeleteOneParams,
    @Body() subscriptionDeleteDto: SubscriptionDeleteDto,
  ): Promise<void> {
    return this.subscriptionService.remove(id);
  }
}
