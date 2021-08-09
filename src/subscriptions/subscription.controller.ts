import { Controller, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';

import { SubscriptionDto } from './dto/subscription.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class NotificationsApiController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @ApiResponse({
    status: 201,
    description: 'Created'
  })
  @ApiBadRequestResponse({
    description: 'token should not be empty / token must be a string'
  })
  @Post('/')
  create(@Body() addSubscriptionDto: SubscriptionDto): Promise<void> {
    return this.subscriptionService.create(addSubscriptionDto);
  }

  @ApiResponse({
    status: 200,
    description: 'OK'
  })
  @ApiNotFoundResponse({
    description: 'Subscription with id not found'
  })
  @Delete('/:id')
  remove(@Param() id: string): Promise<void> {
    return this.subscriptionService.remove(id);
  }
}
