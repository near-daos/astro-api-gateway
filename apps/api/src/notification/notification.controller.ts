import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CrudRequest, ParsedRequest } from '@nestjsx/crud';
import { Span } from 'nestjs-ddtrace';

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
  NotificationStatusResponse,
} from '@sputnik-v2/notification';
import {
  AccountAccessGuard,
  AuthorizedRequest,
  BaseCrudRequestInterceptor,
  EntityQuery,
  FindAccountParams,
  FindOneParams,
  QueryFailedErrorFilter,
} from '@sputnik-v2/common';

import { AccountNotificationCrudRequestInterceptor } from './interceptors/account-notification-crud.interceptor';
import { NotificationCrudRequestInterceptor } from './interceptors/notification-crud.interceptor';

@Span()
@ApiTags('Notifications')
@Controller()
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly accountNotificationService: AccountNotificationService,
    private readonly accountNotificationSettingsService: AccountNotificationSettingsService,
  ) {}

  @ApiOperation({
    summary: 'Get list of Notifications',
  })
  @ApiOkResponse({
    description: 'List of Notifications',
    type: NotificationResponse,
  })
  @ApiQuery({ type: EntityQuery })
  @ApiBadRequestResponse({
    description: 'Bad Request Response based on the query params set',
  })
  @UseInterceptors(NotificationCrudRequestInterceptor)
  @UseFilters(new QueryFailedErrorFilter())
  @Get('/notifications')
  async getNotifications(
    @ParsedRequest() query: CrudRequest,
  ): Promise<Notification[] | NotificationResponse> {
    return await this.notificationService.getMany(query);
  }

  @ApiOperation({
    summary: 'Get notification by ID',
  })
  @ApiOkResponse({
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

  @ApiOperation({
    summary: 'Get list of Account Notifications',
  })
  @ApiOkResponse({
    description: 'List of Account Notifications',
    type: AccountNotificationResponse,
  })
  @ApiQuery({ type: EntityQuery })
  @ApiBadRequestResponse({
    description: 'Bad Request Response based on the query params set',
  })
  @UseInterceptors(AccountNotificationCrudRequestInterceptor)
  @UseFilters(new QueryFailedErrorFilter())
  @Get('/account-notifications')
  async getAccountNotifications(
    @ParsedRequest() query: CrudRequest,
  ): Promise<AccountNotification[] | AccountNotificationResponse> {
    return this.accountNotificationService.getMany(query);
  }

  @ApiOperation({
    summary: 'Read all Account Notifications',
  })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Patch('/account-notifications/read-all')
  async readAccountNotifications(@Req() req: AuthorizedRequest): Promise<void> {
    await this.accountNotificationService.readAccountNotifications(
      req.accountId,
    );
  }

  @ApiOperation({
    summary: 'Archive all Account Notifications',
  })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Patch('/account-notifications/archive-all')
  async archiveAccountNotifications(
    @Req() req: AuthorizedRequest,
  ): Promise<void> {
    await this.accountNotificationService.archiveAccountNotifications(
      req.accountId,
    );
  }

  @ApiOperation({
    summary: 'Update Account Notification',
  })
  @ApiOkResponse({
    description: 'OK',
    type: AccountNotification,
  })
  @ApiBadRequestResponse({
    description: 'Invalid Account Notification ID <id>',
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Patch('/account-notifications/:accountId/:id')
  async updateAccountNotification(
    @Param('accountId') accountId: string,
    @Param('id') id: string,
    @Body() body: UpdateAccountNotificationDto,
  ): Promise<AccountNotification> {
    return this.accountNotificationService.updateAccountNotification(
      accountId,
      id,
      body,
    );
  }

  @ApiOperation({
    summary: 'Get Account Notification Settings',
  })
  @ApiOkResponse({
    description: 'List of Account Notifications',
    type: AccountNotificationSettingsResponse,
  })
  @ApiQuery({ type: EntityQuery })
  @ApiBadRequestResponse({
    description: 'Bad Request Response based on the query params set',
  })
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

  @ApiOperation({
    summary: 'Update Account Notification Settings',
  })
  @ApiOkResponse({
    description: 'Created',
    type: AccountNotificationSettings,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Post('/notification-settings')
  async setNotificationSettings(
    @Req() req: AuthorizedRequest,
    @Body() body: CreateAccountNotificationSettingsDto,
  ): Promise<AccountNotificationSettings> {
    return this.accountNotificationSettingsService.create(req.accountId, body);
  }

  @ApiOperation({
    summary: 'Get Notification status by Account',
  })
  @ApiOkResponse({
    description: 'Notification status by Account',
    type: NotificationStatusResponse,
  })
  @Get('/account-notification-status/:accountId')
  async getAccountNotificationStatus(
    @Param() { accountId }: FindAccountParams,
  ): Promise<NotificationStatusResponse> {
    return this.accountNotificationService.getAccountNotificationStatus(
      accountId,
    );
  }
}
