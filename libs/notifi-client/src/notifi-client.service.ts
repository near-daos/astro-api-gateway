import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotifiClient, createAxiosInstance } from '@notifi-network/notifi-node';

import { NotifiTemplateMessageDto } from './dto';

@Injectable()
export class NotifiClientService {
  private client: NotifiClient;
  private token = '';
  private tokenExpiry = 0;

  constructor(private readonly configService: ConfigService) {
    this.client = new NotifiClient(
      createAxiosInstance(axios, configService.get('notifi.env')),
    );
  }

  async createUser(accountId: string): Promise<string> {
    const jwt = await this.getToken();
    return this.client.createTenantUser(jwt, {
      walletBlockchain: 'NEAR',
      walletPublicKey: this.buildNotifiAccountId(accountId),
    });
  }

  async createAlert(
    accountNotifiId: string,
    email?: string,
    phone?: string,
  ): Promise<string> {
    const jwt = await this.getToken();
    const { id } = await this.client.createDirectPushAlert(jwt, {
      userId: accountNotifiId,
      emailAddresses: email ? [email.toLowerCase()] : undefined,
      phoneNumbers: phone ? [phone] : undefined,
    });
    return id;
  }

  async deleteAlert(alertId: string): Promise<string> {
    const jwt = await this.getToken();
    const { id } = await this.client.deleteDirectPushAlert(jwt, { alertId });
    return id;
  }

  async sendMessage(accountId: string, message: string): Promise<void> {
    const jwt = await this.getToken();
    return this.client.sendDirectPush(jwt, {
      key: `${accountId}:last-message`,
      walletPublicKey: this.buildNotifiAccountId(accountId),
      walletBlockchain: 'NEAR',
      message: message,
    });
  }

  async sendTemplateMessage(
    accountId: string,
    template: NotifiTemplateMessageDto,
  ): Promise<void> {
    const jwt = await this.getToken();
    return this.client.sendDirectPush(jwt, {
      key: `${accountId}:last-message`,
      walletPublicKey: this.buildNotifiAccountId(accountId),
      walletBlockchain: 'NEAR',
      template: template,
    });
  }

  private async getToken(): Promise<string> {
    if (this.tokenExpiry < Date.now()) {
      const authorization = await this.logIn();
      this.token = authorization.token;
      this.tokenExpiry = new Date(authorization.expiry).getTime();
      return this.token;
    }
    return this.token;
  }

  async logIn() {
    const config = this.configService.get('notifi');
    return this.client.logIn({
      sid: config.sid,
      secret: config.secret,
    });
  }

  private buildNotifiAccountId(accountId: string): string {
    return `${this.configService.get('environment')}-${accountId}`;
  }
}
