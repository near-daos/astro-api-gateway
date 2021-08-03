import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { app } from 'firebase-admin';
import { Repository } from 'typeorm';
import { TokenDto } from './dto/token.dto';
import { Token } from './entities/token.entity';
import { MessagingOptions, Notification } from './interfaces/notification';
@Injectable()
export class NotificationsService {
  private firebaseApp: app.App;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {
    this.firebaseApp = configService.get('firebase')
  }

  async sendNotification(
    notification: Notification,
    options: MessagingOptions,
  ): Promise<string> {
    try {
      const data = { notification, ...options };
      return await this.firebaseApp.messaging().send(data);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getAllTokens(): Promise<Token[]> {
    return this.tokenRepository.find({ select: ['token'] });
  }

  async addToken(addTokenDto: TokenDto): Promise<void> {
    this.tokenRepository.save(this.tokenRepository.create(addTokenDto));
  }

  async removeToken(token: string): Promise<void> {
    const deleteResponse = await this.tokenRepository.delete({ token: token });

    if (!deleteResponse.affected) {
      throw new NotFoundException(`Token with id ${token} not found`);
    }
  }
}
