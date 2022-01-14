import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CrudRequest, ParsedRequest } from '@nestjsx/crud';

import {
  NotificationService,
  AccountNotificationService,
  AccountNotificationResponse,
  AccountNotification,
  Notification,
  NotificationResponse,
  UpdateAccountNotificationDto,
  AccountNotificationSettings,
  AccountNotificationSettingsResponse,
  AccountNotificationSettingsService,
  CreateAccountNotificationSettingsDto,
} from '@sputnik-v2/notification';
import {
  AccountAccessGuard,
  AccountBearer,
  BaseCrudRequestInterceptor,
  EntityQuery,
  FindOneParams,
  QueryFailedErrorFilter,
} from '@sputnik-v2/common';

import { AccountNotificationCrudRequestInterceptor } from './interceptors/account-notification-crud.interceptor';
import { NotificationCrudRequestInterceptor } from './interceptors/notification-crud.interceptor';

@ApiTags('Notifications')
@Controller()
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly accountNotificationService: AccountNotificationService,
    private readonly accountNotificationSettingsService: AccountNotificationSettingsService,
  ) {}

  @ApiResponse({
    status: 200,
    description: 'List of Account Notifications',
    type: Notification,
  })
  @ApiQuery({ type: EntityQuery })
  @UseInterceptors(NotificationCrudRequestInterceptor)
  @UseFilters(new QueryFailedErrorFilter())
  @Get('/notifications')
  async getNotifications(
    @ParsedRequest() query: CrudRequest,
  ): Promise<Notification[] | NotificationResponse> {
    return await this.notificationService.getMany(query);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Notification',
    type: Notification,
  })
  @ApiBadRequestResponse({ description: 'Invalid Notification ID' })
  @Get('/notifications/:id')
  async getNotificationById(
    @Param() { id }: FindOneParams,
  ): Promise<Notification> {
    const notification: Notification = await this.notificationService.findOne(
      id,
    );

    if (!notification) {
      throw new BadRequestException('Invalid Notification ID');
    }

    return notification;
  }

  @ApiResponse({
    status: 200,
    description: 'List of Account Notifications',
    type: AccountNotification,
  })
  @ApiQuery({ type: EntityQuery })
  @UseInterceptors(AccountNotificationCrudRequestInterceptor)
  @UseFilters(new QueryFailedErrorFilter())
  @Get('/account-notifications')
  async getAccountNotifications(
    @ParsedRequest() query: CrudRequest,
  ): Promise<AccountNotification[] | AccountNotificationResponse> {
    return this.accountNotificationService.getMany(query);
  }

  @ApiResponse({
    status: 200,
    description: 'OK',
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature',
  })
  @UseGuards(AccountAccessGuard)
  @Patch('/account-notifications/read-all')
  async readAccountNotifications(@Body() body: AccountBearer): Promise<void> {
    await this.accountNotificationService.readAccountNotifications(
      body.accountId,
    );
  }

  @ApiResponse({
    status: 200,
    description: 'OK',
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature',
  })
  @UseGuards(AccountAccessGuard)
  @Patch('/account-notifications/archive-all')
  async archiveAccountNotifications(
    @Body() body: AccountBearer,
  ): Promise<void> {
    await this.accountNotificationService.archiveAccountNotifications(
      body.accountId,
    );
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'OK',
    type: AccountNotification,
  })
  @ApiNotFoundResponse({
    description: 'Account Notification with id <id> not found',
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature',
  })
  @UseGuards(AccountAccessGuard)
  @Patch('/account-notifications/:id')
  async updateAccountNotification(
    @Param() { id }: FindOneParams,
    @Body() body: UpdateAccountNotificationDto,
  ): Promise<AccountNotification> {
    return this.accountNotificationService.updateAccountNotification(id, body);
  }

  @ApiResponse({
    status: 200,
    description: 'List of Account Notifications',
    type: AccountNotificationSettings,
  })
  @ApiQuery({ type: EntityQuery })
  @UseInterceptors(BaseCrudRequestInterceptor)
  @UseFilters(new QueryFailedErrorFilter())
  @Get('/notification-settings')
  async getNotificationSettings(
    @ParsedRequest() query: CrudRequest,
  ): Promise<
    AccountNotificationSettings[] | AccountNotificationSettingsResponse
  > {
    return this.accountNotificationSettingsService.getMany(query);
  }

  @ApiResponse({
    status: 200,
    description: 'OK',
    type: AccountNotificationSettings,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature',
  })
  @UseGuards(AccountAccessGuard)
  @Post('/notification-settings')
  async setNotificationSettings(
    @Body() body: CreateAccountNotificationSettingsDto,
  ): Promise<AccountNotificationSettings> {
    return this.accountNotificationSettingsService.create(body);
  }
}
