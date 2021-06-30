import { Controller, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

import { TokenDto } from './dto/token.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('/send-token')
  create(@Body() addTokenDto: TokenDto): Promise<void> {
    return this.notificationsService.addToken(addTokenDto);
  }

  @Delete('/delete-token:id')
  remove(@Param() { token }: TokenDto): Promise<void> {
    return this.notificationsService.removeToken(token);
  }
}
