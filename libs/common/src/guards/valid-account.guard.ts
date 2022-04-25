import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NEAR_PROVIDER } from '@sputnik-v2/common/constants';
import { Near } from 'near-api-js';

@Injectable()
export class ValidAccountGuard implements CanActivate {
  constructor(
    @Inject(NEAR_PROVIDER)
    private near: Near,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const accountId = req.params.accountId || req.body.accountId;

    if (!accountId) {
      throw new BadRequestException('Account ID is missing');
    }

    try {
      const account = await this.near.account(accountId);
      await account.state();
    } catch (e) {
      throw new NotFoundException(`Account does not exist: ${accountId}`);
    }

    return true;
  }
}
