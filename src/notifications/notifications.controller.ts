import { Controller, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

import { TokenDto } from './dto/token.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiResponse({
    status: 201,
    description: 'Created'
  })
  @ApiBadRequestResponse({
    description: 'token should not be empty / token must be a string'
  })
  @Post('/token')
  create(@Body() addTokenDto: TokenDto): Promise<void> {
    return this.notificationsService.addToken(addTokenDto);
  }

  @ApiResponse({
    status: 200,
    description: 'OK'
  })
  @ApiNotFoundResponse({
    description: 'Token with id not found'
  })
  @Delete('/token/:token')
  remove(@Param() { token }: TokenDto): Promise<void> {
    return this.notificationsService.removeToken(token);
  }
}
