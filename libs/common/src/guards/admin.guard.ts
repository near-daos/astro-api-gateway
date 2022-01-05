import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  private admins: string[];

  constructor(private readonly configService: ConfigService) {
    this.admins = configService.get('api.admins') || [];
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    return req.isAuthenticated && this.admins.includes(req.accountId);
  }
}
