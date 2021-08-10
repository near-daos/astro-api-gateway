import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  BadRequestException
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';

import { SubscriptionService } from './subscription.service';
import { SubscriptionDto } from './dto/subscription.dto';
import { DeleteOneParams } from 'src/common';
import { Subscription } from './entities/subscription.entity';
import { DB_FOREIGN_KEY_VIOLATION } from 'src/common/constants';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class NotificationsApiController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @ApiResponse({
    status: 201,
    description: 'Created'
  })
  @ApiBadRequestResponse({
    description: 'No DAO with id <daoId> found.'
  })
  @Post('/')
  async create(@Body() addSubscriptionDto: SubscriptionDto): Promise<Subscription> {
    return await this.subscriptionService.create(addSubscriptionDto)
      .catch(error => {
        if (error.code === DB_FOREIGN_KEY_VIOLATION) {
          throw new BadRequestException(`No DAO with id ${addSubscriptionDto.daoId} found.`);
        }

        throw error;
      });
  }

  @ApiParam({
    name: 'id',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'OK'
  })
  @ApiNotFoundResponse({
    description: 'Subscription with id <id> not found'
  })
  @Delete('/:id')
  remove(@Param() { id }: DeleteOneParams): Promise<void> {
    return this.subscriptionService.remove(id);
  }
}
