import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class ValidAccountGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const accountId = req.params.accountId || req.body.accountId;

    if (!accountId) {
      throw new BadRequestException('Account ID is missing');
    }

    return true;
  }
}
